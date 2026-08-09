import { describe, expect, it, vi } from "vitest";
import { middleware } from "../../edgeone/middleware";

function createContext(url: string) {
  return {
    request: new Request(url),
    next: vi.fn(() => new Response(null, { status: 204 })),
    redirect: vi.fn((destination: string, status = 307) =>
      Response.redirect(destination, status)
    )
  };
}

describe("EdgeOne canonical license-admin middleware", () => {
  it("passes canonical admin requests through", () => {
    const context = createContext("https://gszhmrx.cn/admin/license/");
    const response = middleware(context);

    expect(response.status).toBe(204);
    expect(context.next).toHaveBeenCalledOnce();
  });

  it("redirects the non-canonical admin page", () => {
    const context = createContext("https://www.gszhmrx.cn/admin/license/?source=test");
    const response = middleware(context);

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://gszhmrx.cn/admin/license/?source=test"
    );
  });

  it("rejects non-canonical admin API requests", async () => {
    const context = createContext(
      "https://format-converter-web-upload-bnsgopdb.edgeone.cool/api/admin/license/session"
    );
    const response = middleware(context);

    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({ ok: false });
  });
});
