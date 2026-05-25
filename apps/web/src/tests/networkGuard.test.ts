import { beforeEach, describe, expect, it, vi } from "vitest";
import { installNetworkGuard, isSafeLocalUrl, isSensitiveUploadBody } from "../lib/privacy/networkGuard";

describe("networkGuard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (window as Window & { __docToolNetworkGuardInstalled?: boolean }).__docToolNetworkGuardInstalled = false;
    Object.defineProperty(window, "location", {
      value: new URL("https://example.test/tools/"),
      writable: true
    });
  });

  it("detects File, Blob, ArrayBuffer, typed arrays and FormData upload bodies", () => {
    expect(isSensitiveUploadBody(new File(["image"], "private.jpg", { type: "image/jpeg" }))).toBe(true);
    expect(isSensitiveUploadBody(new Blob(["pdf"], { type: "application/pdf" }))).toBe(true);
    expect(isSensitiveUploadBody(new ArrayBuffer(8))).toBe(true);
    expect(isSensitiveUploadBody(new Uint8Array([1, 2, 3]))).toBe(true);

    const form = new FormData();
    form.append("file", new Blob(["pdf"], { type: "application/pdf" }), "sample.pdf");
    expect(isSensitiveUploadBody(form)).toBe(true);
    expect(isSensitiveUploadBody(JSON.stringify({ password: "download-code" }))).toBe(false);
  });

  it("distinguishes same-origin static requests from external requests", () => {
    expect(isSafeLocalUrl("/pdfjs/pdf.worker.min.mjs")).toBe(true);
    expect(isSafeLocalUrl("https://example.test/pdfjs/pdf.worker.min.mjs")).toBe(true);
    expect(isSafeLocalUrl("https://third-party.test/upload")).toBe(false);
  });

  it("blocks suspicious external fetch uploads in development", () => {
    const originalFetch = vi.fn(() => Promise.resolve(new Response("ok")));
    Object.defineProperty(window, "fetch", { value: originalFetch, writable: true });
    installNetworkGuard();

    expect(() => window.fetch("https://third-party.test/upload", { method: "POST", body: new Blob(["private image"]) })).toThrow(/隐私保护已拦截/);
    const request = {
      url: "https://third-party.test/upload",
      method: "POST",
      headers: new Headers({ "content-type": "application/pdf" })
    } as Request;
    expect(() => window.fetch(request)).toThrow(/隐私保护已拦截/);
    void window.fetch("/local-resource", { method: "POST", body: new Blob(["local"]) });
    void window.fetch("https://cloudbase.example.test/createDownloadUrl", { method: "POST", body: JSON.stringify({ password: "ok" }) });

    expect(originalFetch).toHaveBeenCalledTimes(2);
  });

  it("blocks suspicious external XMLHttpRequest uploads in development", () => {
    installNetworkGuard();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://third-party.test/upload");
    expect(() => xhr.send(new File(["video"], "private.mp4", { type: "video/mp4" }))).toThrow(/隐私保护已拦截/);
  });
});
