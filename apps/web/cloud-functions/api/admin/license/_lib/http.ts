const MAX_BODY_BYTES = 64 * 1024;
const ADMIN_ORIGIN_HOSTS = new Set([
  "gszhmrx.cn",
  "www.gszhmrx.cn",
  "format-converter-web-s1e4ymen.edgeone.cool"
]);

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {}
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function errorResponse(status: number, message: string): Response {
  return jsonResponse({ ok: false, error: message }, { status });
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    throw new HttpError(403, "请求来源不正确。");
  }

  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  const isLocalHttp =
    originUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(originUrl.hostname) &&
    originUrl.host === requestUrl.host;
  const isAllowedProductionOrigin =
    originUrl.protocol === "https:" &&
    !originUrl.port &&
    ADMIN_ORIGIN_HOSTS.has(originUrl.hostname);
  if (!isAllowedProductionOrigin && !isLocalHttp) {
    throw new HttpError(403, "请求来源不正确。");
  }
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  const contentLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    throw new HttpError(413, "请求内容过大。");
  }

  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
    throw new HttpError(413, "请求内容过大。");
  }
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "请求格式不正确。");
  }
}

export function toSafeErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return errorResponse(error.status, error.message);
  }
  if (error instanceof Error && error.message === "LICENSE_ADMIN_NOT_CONFIGURED") {
    return errorResponse(503, "后台暂不可用。");
  }
  return errorResponse(500, "操作失败，请稍后重试。");
}
