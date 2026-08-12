const CANONICAL_ADMIN_ORIGIN = "https://gszhmrx.cn";
const NON_CANONICAL_ADMIN_HOSTS = new Set([
  "www.gszhmrx.cn",
  "format-converter-web-upload-bnsgopdb.edgeone.cool"
]);

interface EdgeOneMiddlewareContext {
  request: Request;
  next: () => Response;
  redirect: (url: string, status?: number) => Response;
}

export function middleware(context: EdgeOneMiddlewareContext): Response {
  const url = new URL(context.request.url);
  const nonCanonicalHost = NON_CANONICAL_ADMIN_HOSTS.has(url.hostname);

  if (nonCanonicalHost && url.pathname.startsWith("/api/admin/license/")) {
    return new Response(
      JSON.stringify({ ok: false, error: "管理接口仅允许从主域名访问。" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  if (url.protocol !== "https:" || nonCanonicalHost) {
    const destinationOrigin = nonCanonicalHost ? CANONICAL_ADMIN_ORIGIN : `https://${url.host}`;
    const destination = new URL(`${url.pathname}${url.search}`, destinationOrigin);
    return context.redirect(destination.toString(), 308);
  }

  return context.next();
}

export const config = {
  matcher: ["/:path*"]
};
