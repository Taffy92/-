import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes
} from "node:crypto";
import type { LicenseRecord } from "./types";

export type EncryptedLicenseRecord = {
  version: 1;
  recordId: string;
  createdAt: number;
  machineLookup: string;
  iv: string;
  authTag: string;
  ciphertext: string;
};

export function encryptLicenseRecord(
  record: LicenseRecord,
  encryptionKey: Buffer,
  iv: Buffer = randomBytes(12)
): EncryptedLicenseRecord {
  assertEncryptionInputs(encryptionKey, iv);
  const machineLookup = machineLookupFor(record.machineCode, encryptionKey);
  const aad = recordAad(record.recordId, record.createdAt, machineLookup);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(record), "utf8"),
    cipher.final()
  ]);

  return {
    version: 1,
    recordId: record.recordId,
    createdAt: record.createdAt,
    machineLookup,
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url")
  };
}

export function decryptLicenseRecord(
  envelope: EncryptedLicenseRecord,
  encryptionKey: Buffer
): LicenseRecord {
  if (envelope.version !== 1 || encryptionKey.length !== 32) {
    throw new Error("授权记录无法解密。");
  }
  const iv = Buffer.from(envelope.iv, "base64url");
  const authTag = Buffer.from(envelope.authTag, "base64url");
  const ciphertext = Buffer.from(envelope.ciphertext, "base64url");
  assertEncryptionInputs(encryptionKey, iv);

  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv);
  decipher.setAAD(recordAad(envelope.recordId, envelope.createdAt, envelope.machineLookup));
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString("utf8");
  const record = JSON.parse(plaintext) as LicenseRecord;
  if (record.recordId !== envelope.recordId || record.createdAt !== envelope.createdAt) {
    throw new Error("授权记录元数据不匹配。");
  }
  if (machineLookupFor(record.machineCode, encryptionKey) !== envelope.machineLookup) {
    throw new Error("授权记录机器摘要不匹配。");
  }
  return record;
}

export function machineLookupFor(machineCode: string, encryptionKey: Buffer): string {
  const lookupKey = createHmac("sha256", encryptionKey)
    .update("license-admin-machine-lookup-v1", "utf8")
    .digest();
  return createHmac("sha256", lookupKey)
    .update(machineCode, "utf8")
    .digest("base64url");
}

function recordAad(recordId: string, createdAt: number, machineLookup: string): Buffer {
  return Buffer.from(`v1|${recordId}|${createdAt}|${machineLookup}`, "utf8");
}

function assertEncryptionInputs(encryptionKey: Buffer, iv: Buffer): void {
  if (encryptionKey.length !== 32 || iv.length !== 12) {
    throw new Error("授权记录加密参数不正确。");
  }
}
