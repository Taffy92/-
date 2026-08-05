import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const helperPath = path.join(process.cwd(), "../../cloudbase/functions/createDownloadUrl/security.js");

function loadCloudFunction(allowedOrigin = "https://example.test") {
  delete require.cache[require.resolve(helperPath)];
  process.env.ALLOWED_ORIGIN = allowedOrigin;
  return require(helperPath) as {
    normalizeOrigin: (origin: string) => string;
    parseAllowedOrigins: (origin: string) => string[];
    normalizePackageType: (value: string) => "zip" | null;
    passwordMatches: (input: string, expected: string) => boolean;
    isOriginAllowed: (origin: string, allowed?: string[]) => boolean;
    buildCorsHeaders: (req: { headers: Record<string, string> }, allowed: string[]) => Record<string, string>;
  };
}

describe("CloudBase download authorization hardening", () => {
  it("only accepts the ZIP package type", () => {
    const cloudFunction = loadCloudFunction();
    expect(cloudFunction.normalizePackageType("zip")).toBe("zip");
    expect(cloudFunction.normalizePackageType("MSI")).toBeNull();
    expect(cloudFunction.normalizePackageType("exe")).toBeNull();
    expect(cloudFunction.normalizePackageType("../setup.exe")).toBeNull();
  });

  it("keeps timingSafeEqual guarded when password lengths differ", () => {
    const cloudFunction = loadCloudFunction();
    expect(cloudFunction.passwordMatches("short", "much-longer-password")).toBe(false);
    expect(cloudFunction.passwordMatches("same", "same")).toBe(true);
  });

  it("normalizes and checks allowed origins for CORS", () => {
    const cloudFunction = loadCloudFunction("https://example.test, https://www.example.test/path");
    const allowed = cloudFunction.parseAllowedOrigins("https://example.test, https://www.example.test/path");
    expect(allowed).toEqual(["https://example.test", "https://www.example.test"]);
    expect(cloudFunction.isOriginAllowed("https://example.test", allowed)).toBe(true);
    expect(cloudFunction.isOriginAllowed("https://evil.test", allowed)).toBe(false);
  });

  it("reflects only allowed origins in CORS headers", () => {
    const cloudFunction = loadCloudFunction("https://example.test");
    const allowedHeaders = cloudFunction.buildCorsHeaders({ headers: { origin: "https://example.test" } }, ["https://example.test"]);
    expect(allowedHeaders["Access-Control-Allow-Origin"]).toBe("https://example.test");
    expect(allowedHeaders["Access-Control-Allow-Methods"]).toContain("POST");
    expect(allowedHeaders["Access-Control-Allow-Headers"]).toContain("Content-Type");

    const rejectedHeaders = cloudFunction.buildCorsHeaders({ headers: { origin: "https://evil.test" } }, ["https://example.test"]);
    expect(rejectedHeaders["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
