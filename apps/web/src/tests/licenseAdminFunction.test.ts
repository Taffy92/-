import { createPrivateKey, createPublicKey, generateKeyPairSync, verify } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(process.cwd(), "..", "..");
const licenseAdmin = require(path.join(projectRoot, "cloudbase/functions/licenseAdmin/index.js")) as {
  PRODUCT: string;
  SOFTWARE_NAME: string;
  canonicalLicensePayload: (payload: LicensePayload) => string;
  generateLicenseFromInput: (input: Record<string, unknown>, privateKeyPem: string) => LicenseResult;
  activationRequestHmac: (request: ActivationRequest, machineId: string) => string;
};

type LicensePayload = {
  license_id: string;
  product: string;
  software_name: string;
  machine_id: string;
  issued_at: number;
  expires_at: number;
  edition: string;
  features: string[];
};

type LicenseResult = {
  ok: boolean;
  machineId: string;
  licenseCode: string;
  licenseFileContent: string;
  envelope: {
    version: string;
    payload: LicensePayload;
    signature: string;
  };
};

type ActivationRequest = {
  product: string;
  softwareName: string;
  machineId: string;
  appVersion: string;
  trialStatus: string;
  requestTime: number;
  requestId: string;
  requestSignature: string;
};

describe("licenseAdmin cloud function", () => {
  it("generates desktop-compatible signed license envelopes", () => {
    const { privateKey } = generateKeyPairSync("ed25519");
    const privatePem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
    const publicKey = createPublicKey(createPrivateKey(privatePem));

    const result = licenseAdmin.generateLicenseFromInput(
      {
        machineId: "test-test-test-test",
        days: 30,
        customer: "Test Customer",
        issuedAt: 1700000000,
        licenseId: "LIC-TEST"
      },
      privatePem
    );

    expect(result.ok).toBe(true);
    expect(result.machineId).toBe("TEST-TEST-TEST-TEST");
    expect(result.licenseCode).toMatch(/^UFC1-/);
    expect(result.licenseFileContent).toContain('"version": "ufc-license-v1"');

    const signature = Buffer.from(result.envelope.signature, "base64url");
    const payload = Buffer.from(licenseAdmin.canonicalLicensePayload(result.envelope.payload), "utf8");
    expect(verify(null, payload, publicKey, signature)).toBe(true);
  });

  it("accepts a valid activation_request.mrx payload", () => {
    const { privateKey } = generateKeyPairSync("ed25519");
    const privatePem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
    const request: ActivationRequest = {
      product: licenseAdmin.PRODUCT,
      softwareName: licenseAdmin.SOFTWARE_NAME,
      machineId: "TEST-TEST-TEST-TEST",
      appVersion: "1.0.0",
      trialStatus: "trial_expired",
      requestTime: 1700000000,
      requestId: "REQ-TEST",
      requestSignature: ""
    };
    request.requestSignature = licenseAdmin.activationRequestHmac(request, request.machineId);

    const result = licenseAdmin.generateLicenseFromInput(
      {
        request: JSON.stringify(request),
        days: 365,
        issuedAt: 1700000000,
        licenseId: "LIC-REQUEST"
      },
      privatePem
    );

    expect(result.machineId).toBe(request.machineId);
    expect(result.envelope.payload.product).toBe(licenseAdmin.PRODUCT);
  });

  it("rejects forged activation requests", () => {
    const { privateKey } = generateKeyPairSync("ed25519");
    const privatePem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
    const request: ActivationRequest = {
      product: licenseAdmin.PRODUCT,
      softwareName: licenseAdmin.SOFTWARE_NAME,
      machineId: "TEST-TEST-TEST-TEST",
      appVersion: "1.0.0",
      trialStatus: "trial_expired",
      requestTime: 1700000000,
      requestId: "REQ-TEST",
      requestSignature: "bad"
    };

    expect(() => {
      licenseAdmin.generateLicenseFromInput({ request: JSON.stringify(request), days: 365 }, privatePem);
    }).toThrow("签名无效");
  });
});
