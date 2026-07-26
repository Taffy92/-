import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  decryptLicenseRecord,
  encryptLicenseRecord
} from "../../cloud-functions/api/admin/license/_lib/record-crypto";
import {
  createRecordStore,
  type BlobStoreLike
} from "../../cloud-functions/api/admin/license/_lib/record-store";
import type { LicenseRecord } from "../../cloud-functions/api/admin/license/_lib/types";

class MemoryBlobStore implements BlobStoreLike {
  readonly values = new Map<string, string>();
  readonly setOptions: Array<{ key: string; onlyIfNew?: boolean }> = [];

  async set(key: string, value: string, options?: { onlyIfNew?: boolean }): Promise<void> {
    this.setOptions.push({ key, onlyIfNew: options?.onlyIfNew });
    if (options?.onlyIfNew && this.values.has(key)) throw new Error("already exists");
    this.values.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async list(options?: { prefix?: string }): Promise<{ blobs: Array<{ key: string; etag: string }> }> {
    return {
      blobs: [...this.values.keys()]
        .filter((key) => key.startsWith(options?.prefix ?? ""))
        .map((key) => ({ key, etag: "test" }))
    };
  }
}

const key = Buffer.alloc(32, 9);

describe("EdgeOne encrypted license records", () => {
  it("encrypts every sensitive record field with authenticated encryption", () => {
    const record = makeRecord();
    const encrypted = encryptLicenseRecord(record, key, Buffer.alloc(12, 4));
    const serialized = JSON.stringify(encrypted);

    expect(serialized).not.toContain(record.customerName);
    expect(serialized).not.toContain(record.machineCode);
    expect(serialized).not.toContain("UFC1-");
    expect(serialized).not.toContain("license.mrx");
    expect(encrypted.machineLookup).not.toBe(
      Buffer.from(record.machineCode, "utf8").toString("base64url")
    );
    expect(decryptLicenseRecord(encrypted, key)).toEqual(record);
  });

  it("rejects tampered ciphertext, IV, and authentication tags", () => {
    const encrypted = encryptLicenseRecord(makeRecord(), key, Buffer.alloc(12, 5));
    for (const field of ["ciphertext", "iv", "authTag"] as const) {
      const tampered = {
        ...encrypted,
        [field]: `${encrypted[field][0] === "A" ? "B" : "A"}${encrypted[field].slice(1)}`
      };
      expect(() => decryptLicenseRecord(tampered, key)).toThrow();
    }
    expect(() => decryptLicenseRecord(encrypted, randomBytes(32))).toThrow();
  });

  it("appends immutable records and can decrypt them after refresh", async () => {
    const blob = new MemoryBlobStore();
    const records = createRecordStore(blob, key);
    const record = makeRecord();

    await records.append(record);
    expect(blob.setOptions).toEqual([
      { key: "records/v1/2023/11/REC-TEST.json", onlyIfNew: true }
    ]);
    await expect(records.append(record)).rejects.toThrow();
    await expect(records.get(record.recordId)).resolves.toEqual(record);
  });

  it("finds the latest machine record and preserves the full history", async () => {
    const blob = new MemoryBlobStore();
    const records = createRecordStore(blob, key);
    const first = makeRecord({
      recordId: "REC-FIRST",
      licenseId: "LIC-FIRST",
      expiresAt: 1_700_086_400,
      createdAt: 1_700_000_000
    });
    const second = makeRecord({
      recordId: "REC-SECOND",
      licenseId: "LIC-SECOND",
      parentLicenseId: "LIC-FIRST",
      previousExpiresAt: first.expiresAt,
      expiresAt: 1_702_678_400,
      createdAt: 1_700_000_100
    });
    await records.append(first);
    await records.append(second);

    await expect(records.latestForMachine("test test test test")).resolves.toEqual(second);
    await expect(records.get(first.recordId)).resolves.toEqual(first);
  });

  it("searches customer and machine code while masking list output", async () => {
    const blob = new MemoryBlobStore();
    const records = createRecordStore(blob, key);
    await records.append(makeRecord({ customerName: "广州测试客户" }));
    await records.append(makeRecord({
      recordId: "REC-OTHER",
      licenseId: "LIC-OTHER",
      customerName: "Other",
      machineCode: "ABCD-EFGH-JKLM-NPQR"
    }));

    const byCustomer = await records.list({ query: "广州", page: 1, pageSize: 20 });
    expect(byCustomer.total).toBe(1);
    expect(byCustomer.items[0]).toMatchObject({
      customerName: "广州测试客户",
      maskedMachineCode: "TEST-****-****-TEST"
    });

    const byMachine = await records.list({ query: "test test test test", page: 1, pageSize: 20 });
    expect(byMachine.total).toBe(1);
    expect(byMachine.items[0].licenseCode).toMatch(/^UFC1-/);
  });

  it("exports encrypted envelopes without customer or license plaintext", async () => {
    const blob = new MemoryBlobStore();
    const records = createRecordStore(blob, key);
    const record = makeRecord();
    await records.append(record);

    const backup = await records.exportEncryptedBackup();
    expect(backup).not.toContain(record.customerName);
    expect(backup).not.toContain(record.machineCode);
    expect(backup).not.toContain(record.licenseCode);
    expect(JSON.parse(backup)).toMatchObject({ version: 1 });
  });
});

function makeRecord(overrides: Partial<LicenseRecord> = {}): LicenseRecord {
  return {
    recordId: "REC-TEST",
    licenseId: "LIC-TEST",
    parentLicenseId: null,
    customerName: "测试客户",
    machineCode: "TEST-TEST-TEST-TEST",
    issuedAt: 1_700_000_000,
    previousExpiresAt: null,
    expiresAt: 1_702_592_000,
    durationDays: 30,
    permanent: false,
    edition: "pro",
    features: ["basic", "convert", "export", "batch"],
    licenseCode: "UFC1-TEST-LICENSE-CODE",
    licenseFileContent: '{"version":"ufc-license-v1","file":"license.mrx"}',
    remark: "测试备注",
    createdAt: 1_700_000_000,
    ...overrides
  };
}
