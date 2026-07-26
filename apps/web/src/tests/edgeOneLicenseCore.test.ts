import { createPrivateKey, createPublicKey, generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  PERMANENT_EXPIRES_AT,
  calculateExpiresAt,
  canonicalLicensePayload,
  generateLicense
} from "../../cloud-functions/api/admin/license/_lib/license";
import { normalizeMachineCode } from "../../cloud-functions/api/admin/license/_lib/machine-code";

describe("EdgeOne license core", () => {
  it("normalizes the desktop machine-code alphabet and separators", () => {
    expect(normalizeMachineCode("test-test-test-test")).toBe("TEST-TEST-TEST-TEST");
    expect(normalizeMachineCode("test test\n test-test")).toBe("TEST-TEST-TEST-TEST");
  });

  it.each([
    "TOO-SHORT",
    "TEST-TEST-TEST-TEST-X",
    "IIII-TEST-TEST-TEST",
    "OOOO-TEST-TEST-TEST",
    "0000-TEST-TEST-TEST",
    "1111-TEST-TEST-TEST"
  ])("rejects invalid machine code %s", (machineCode) => {
    expect(() => normalizeMachineCode(machineCode)).toThrow("机器码");
  });

  it("preserves remaining time when renewing an active license", () => {
    expect(calculateExpiresAt({
      now: 1_700_000_000,
      previousExpiresAt: 1_700_086_400,
      duration: 30
    })).toBe(1_702_678_400);
  });

  it("renews from now when the previous license has expired", () => {
    expect(calculateExpiresAt({
      now: 1_700_000_000,
      previousExpiresAt: 1_699_999_999,
      duration: 30
    })).toBe(1_702_592_000);
  });

  it("uses the fixed Asia/Shanghai permanent expiry", () => {
    expect(calculateExpiresAt({
      now: 1_700_000_000,
      previousExpiresAt: 1_800_000_000,
      duration: "permanent"
    })).toBe(PERMANENT_EXPIRES_AT);
    expect(PERMANENT_EXPIRES_AT).toBe(4_102_415_999);
  });

  it("generates a desktop-compatible Ed25519 envelope", () => {
    const { privateKey } = generateKeyPairSync("ed25519");
    const privateKeyPem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
    const publicKey = createPublicKey(createPrivateKey(privateKeyPem));

    const result = generateLicense({
      privateKeyPem,
      machineCode: "test test test test",
      duration: 30,
      now: 1_700_000_000,
      licenseId: "LIC-EDGEONE-TEST"
    });

    expect(result.machineCode).toBe("TEST-TEST-TEST-TEST");
    expect(result.licenseCode).toMatch(/^UFC1-/);
    expect(result.licenseFileContent).toContain('"version": "ufc-license-v1"');
    expect(result.envelope.payload).toMatchObject({
      license_id: "LIC-EDGEONE-TEST",
      product: "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO",
      software_name: "万能格式转换器离线专业版",
      machine_id: "TEST-TEST-TEST-TEST",
      issued_at: 1_700_000_000,
      expires_at: 1_702_592_000,
      edition: "pro",
      features: ["basic", "convert", "export", "batch"]
    });

    const signature = Buffer.from(result.envelope.signature, "base64url");
    const payload = Buffer.from(canonicalLicensePayload(result.envelope.payload), "utf8");
    expect(verify(null, payload, publicKey, signature)).toBe(true);
  });
});
