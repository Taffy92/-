export function isSensitiveUploadBody(body: unknown): boolean {
  if (!body) return false;
  if (typeof File !== "undefined" && body instanceof File) return true;
  if (typeof Blob !== "undefined" && body instanceof Blob) return true;
  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(body)) return true;
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    for (const value of body.values()) {
      if (typeof File !== "undefined" && value instanceof File) return true;
      if (typeof Blob !== "undefined" && value instanceof Blob) return true;
    }
  }
  return false;
}

export function isSafeLocalUrl(input: RequestInfo | URL): boolean {
  if (typeof window === "undefined") return true;
  const raw = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
  const url = new URL(raw, window.location.href);
  return url.origin === window.location.origin;
}

function isSensitiveRequestObject(input: RequestInfo | URL): boolean {
  if (!isRequestLike(input)) return false;
  const method = input.method.toUpperCase();
  if (method === "GET" || method === "HEAD") return false;
  const contentType = input.headers.get("content-type") || "";
  return !/application\/json|text\/plain|application\/x-www-form-urlencoded/i.test(contentType);
}

function isRequestLike(input: RequestInfo | URL): input is Request {
  return Boolean(
    input &&
      typeof input === "object" &&
      typeof (input as Request).method === "string" &&
      typeof (input as Request).headers?.get === "function"
  );
}

export function installNetworkGuard(): void {
  if (typeof window === "undefined") return;
  const marker = "__docToolNetworkGuardInstalled";
  const target = window as Window & { [marker]?: boolean };
  if (target[marker]) return;
  target[marker] = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body ?? (typeof Request !== "undefined" && input instanceof Request ? input.body : undefined);
    if ((isSensitiveUploadBody(body) || isSensitiveRequestObject(input)) && !isSafeLocalUrl(input)) {
      const message = "隐私保护已拦截：禁止向非本站资源上传用户 File、Blob、ArrayBuffer 或 FormData。";
      console.error(`[privacy] ${message}`, input);
      throw new Error(message);
    }
    return originalFetch(input, init);
  }) as typeof window.fetch;

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function patchedOpen(this: XMLHttpRequest, method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    this.__docToolUrl = url.toString();
    return originalOpen.call(this, method, url, async ?? true, username ?? undefined, password ?? undefined);
  } as typeof XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.send = function patchedSend(this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    if (isSensitiveUploadBody(body) && this.__docToolUrl && !isSafeLocalUrl(this.__docToolUrl)) {
      const message = "隐私保护已拦截：禁止通过 XMLHttpRequest 向非本站资源上传用户文件数据。";
      console.error(`[privacy] ${message}`, this.__docToolUrl);
      throw new Error(message);
    }
    return originalSend.call(this, body);
  } as typeof XMLHttpRequest.prototype.send;
}

declare global {
  interface XMLHttpRequest {
    __docToolUrl?: string;
  }
}
