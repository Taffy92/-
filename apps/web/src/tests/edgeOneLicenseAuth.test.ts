import { describe, expect, it } from "vitest";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  createSessionCookie,
  createSessionToken,
  hashAdminPassword,
  verifyAdminPassword,
  verifySessionToken
} from "../../cloud-functions/api/admin/license/_lib/auth";
import {
  assertSameOrigin,
  errorResponse,
  jsonResponse
} from "../../cloud-functions/api/admin/license/_lib/http";

describe("EdgeOne license admin authentication", () => {
  it("accepts a six-digit numeric password through scrypt", async () => {
    const digest = await hashAdminPassword("123456", Buffer.alloc(16, 7));
    await expect(verifyAdminPassword("123456", digest)).resolves.toBe(true);
    await expect(verifyAdminPassword("654321", digest)).resolves.toBe(false);
  });

  it("does not add lockout or delay after repeated failures", async () => {
    const digest = await hashAdminPassword("123456", Buffer.alloc(16, 8));
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () => verifyAdminPassword("000000", digest))
    );
    expect(attempts).toEqual(Array(12).fill(false));
  });

  it("creates and verifies an eight-hour signed session", () => {
    const now = 1_700_000_000;
    const token = createSessionToken("session-secret", now);
    expect(verifySessionToken(token, "session-secret", now + 8 * 60 * 60 - 1)).toBe(true);
    expect(verifySessionToken(token, "session-secret", now + 8 * 60 * 60)).toBe(false);
    expect(verifySessionToken(`${token}x`, "session-secret", now)).toBe(false);
    expect(verifySessionToken(token, "different-secret", now)).toBe(false);
  });

  it("uses a tightly scoped secure cookie", () => {
    const header = createSessionCookie("signed-token");
    expect(header).toContain(`${SESSION_COOKIE_NAME}=signed-token`);
    expect(header).toContain("Max-Age=28800");
    expect(header).toContain("Path=/api/admin/license");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Strict");

    expect(clearSessionCookie()).toContain("Max-Age=0");
  });

  it("requires state-changing requests to be same-origin", () => {
    const valid = new Request("https://gszhmrx.cn/api/admin/license/generate", {
      method: "POST",
      headers: { Origin: "https://gszhmrx.cn" }
    });
    expect(() => assertSameOrigin(valid)).not.toThrow();

    const proxied = new Request("http://gszhmrx.cn/api/admin/license/generate", {
      method: "POST",
      headers: { Origin: "https://gszhmrx.cn" }
    });
    expect(() => assertSameOrigin(proxied)).not.toThrow();

    const missing = new Request("https://gszhmrx.cn/api/admin/license/generate", {
      method: "POST"
    });
    expect(() => assertSameOrigin(missing)).toThrow("请求来源");

    const foreign = new Request("https://gszhmrx.cn/api/admin/license/generate", {
      method: "POST",
      headers: { Origin: "https://example.com" }
    });
    expect(() => assertSameOrigin(foreign)).toThrow("请求来源");
  });

  it("sets no-store on JSON and generic error responses", async () => {
    const ok = jsonResponse({ ok: true });
    expect(ok.headers.get("Cache-Control")).toBe("no-store");
    expect(ok.headers.get("X-Content-Type-Options")).toBe("nosniff");

    const error = errorResponse(401, "密码不正确");
    expect(error.status).toBe(401);
    expect(await error.json()).toEqual({ ok: false, error: "密码不正确" });
    expect(error.headers.get("Cache-Control")).toBe("no-store");
  });
});
