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
  if (!NON_CANONICAL_ADMIN_HOSTS.has(url.hostname)) {
    return context.next();
  }

  if (url.pathname.startsWith("/api/admin/license/")) {
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

  const destination = new URL(`${url.pathname}${url.search}`, CANONICAL_ADMIN_ORIGIN);
  return context.redirect(destination.toString(), 308);
}

export const config = {
  matcher: ["/admin/license/:path*", "/api/admin/license/:path*"]
};
