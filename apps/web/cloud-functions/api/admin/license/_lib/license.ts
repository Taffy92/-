import {
  createHash,
  createHmac,
  createPrivateKey,
  randomUUID,
  sign,
  timingSafeEqual
} from "node:crypto";
import { normalizeMachineCode } from "./machine-code";
import type {
  ActivationRequest,
  GenerateLicenseInput,
  GeneratedLicense,
  LicenseDuration,
  LicensePayload
} from "./types";

export const PRODUCT = "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO";
export const SOFTWARE_NAME = "万能格式转换器离线专业版";
export const LICENSE_PREFIX = "UFC1-";
export const PERMANENT_EXPIRES_AT = 4_102_415_999;

const LOCAL_TRIAL_KEY_CONTEXT = "ufc-local-trial-v1";
const DEFAULT_FEATURES = ["basic", "convert", "export", "batch"];
const SECONDS_PER_DAY = 24 * 60 * 60;

export function calculateExpiresAt(input: {
  now: number;
  previousExpiresAt?: number;
  duration: LicenseDuration;
}): number {
  if (input.duration === "permanent") {
    return PERMANENT_EXPIRES_AT;
  }
  if (!Number.isInteger(input.duration) || input.duration <= 0) {
    throw new Error("授权时长不正确。");
  }
  const base = Math.max(input.now, input.previousExpiresAt ?? 0);
  return base + input.duration * SECONDS_PER_DAY;
}

export function generateLicense(input: GenerateLicenseInput): GeneratedLicense {
  const issuedAt = input.now ?? Math.floor(Date.now() / 1000);
  const machineCode = normalizeMachineCode(input.machineCode);
  const payload: LicensePayload = {
    license_id: input.licenseId ?? createLicenseId(issuedAt),
    product: PRODUCT,
    software_name: SOFTWARE_NAME,
    machine_id: machineCode,
    issued_at: issuedAt,
    expires_at: calculateExpiresAt({
      now: issuedAt,
      previousExpiresAt: input.previousExpiresAt,
      duration: input.duration
    }),
    edition: "pro",
    features: [...DEFAULT_FEATURES]
  };

  const privateKey = createPrivateKey(input.privateKeyPem);
  const signature = sign(
    null,
    Buffer.from(canonicalLicensePayload(payload), "utf8"),
    privateKey
  ).toString("base64url");
  const envelope = {
    version: "ufc-license-v1" as const,
    payload,
    signature
  };
  const licenseFileContent = `${JSON.stringify(envelope, null, 2)}\n`;
  const licenseCode = `${LICENSE_PREFIX}${Buffer.from(JSON.stringify(envelope), "utf8").toString("base64url")}`;

  return {
    machineCode,
    issuedAt,
    expiresAt: payload.expires_at,
    licenseCode,
    licenseFileName: "license.mrx",
    licenseFileContent,
    envelope
  };
}

export function canonicalLicensePayload(payload: LicensePayload): string {
  return [
    `license_id=${payload.license_id}`,
    `product=${payload.product}`,
    `software_name=${payload.software_name}`,
    `machine_id=${payload.machine_id}`,
    `issued_at=${payload.issued_at}`,
    `expires_at=${payload.expires_at}`,
    `edition=${payload.edition}`,
    `features=${payload.features.join(",")}`
  ].join("\n");
}

export function verifyActivationRequest(request: ActivationRequest, machineCode: string): void {
  const normalizedMachineCode = normalizeMachineCode(machineCode);
  if (request.product !== PRODUCT) {
    throw new Error("activation_request.mrx 产品不匹配。");
  }
  if (normalizeMachineCode(request.machineId ?? request.machine_id) !== normalizedMachineCode) {
    throw new Error("activation_request.mrx 机器码不匹配。");
  }

  const signature = request.requestSignature ?? request.request_signature ?? "";
  const expected = activationRequestHmac(request, normalizedMachineCode);
  if (!safeTextEqual(signature, expected)) {
    throw new Error("activation_request.mrx 签名无效，请让用户重新导出。");
  }
}

export function activationRequestHmac(request: ActivationRequest, machineCode: string): string {
  const normalizedMachineCode = normalizeMachineCode(machineCode);
  const key = createHash("sha256")
    .update(PRODUCT)
    .update("|trial|")
    .update(normalizedMachineCode)
    .update("|")
    .update(LOCAL_TRIAL_KEY_CONTEXT)
    .digest();
  return createHmac("sha256", key)
    .update(canonicalActivationRequest(request), "utf8")
    .digest("base64url");
}

function canonicalActivationRequest(request: ActivationRequest): string {
  return [
    `product=${request.product}`,
    `software_name=${request.softwareName ?? request.software_name}`,
    `machine_id=${request.machineId ?? request.machine_id}`,
    `app_version=${request.appVersion ?? request.app_version}`,
    `trial_status=${request.trialStatus ?? request.trial_status}`,
    `request_time=${request.requestTime ?? request.request_time}`,
    `request_id=${request.requestId ?? request.request_id}`
  ].join("\n");
}

function createLicenseId(issuedAt: number): string {
  const date = new Date(issuedAt * 1000).toISOString().slice(0, 10).replace(/-/g, "");
  return `LIC-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function safeTextEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
