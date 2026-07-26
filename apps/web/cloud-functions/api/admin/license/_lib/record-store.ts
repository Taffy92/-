import { getStore } from "@edgeone/pages-blob";
import { normalizeMachineCode } from "./machine-code";
import {
  decryptLicenseRecord,
  encryptLicenseRecord,
  type EncryptedLicenseRecord
} from "./record-crypto";
import type {
  LicenseRecord,
  LicenseRecordListItem
} from "./types";

const RECORD_PREFIX = "records/v1/";
const STORE_NAME = "license-admin-records";

export type BlobStoreLike = {
  set(
    key: string,
    value: string,
    options?: { onlyIfNew?: boolean; cacheControl?: string | null }
  ): Promise<void>;
  get(
    key: string,
    options?: { type?: "text"; consistency?: "eventual" | "strong" }
  ): Promise<string | null>;
  list(options?: {
    prefix?: string;
    consistency?: "eventual" | "strong";
  }): Promise<{ blobs: Array<{ key: string; etag: string }> }>;
};

export function createEdgeOneRecordStore(encryptionKey: Buffer): LicenseRecordStore {
  return createRecordStore(
    getStore(STORE_NAME) as unknown as BlobStoreLike,
    encryptionKey
  );
}

export function createRecordStore(
  blob: BlobStoreLike,
  encryptionKey: Buffer
): LicenseRecordStore {
  return {
    async append(record) {
      const objectKey = recordObjectKey(record);
      const encrypted = encryptLicenseRecord(record, encryptionKey);
      await blob.set(objectKey, JSON.stringify(encrypted), {
        onlyIfNew: true,
        cacheControl: "no-store"
      });
    },

    async get(recordId) {
      const records = await readAllRecords(blob, encryptionKey);
      return records.find((record) => record.recordId === recordId) ?? null;
    },

    async latestForMachine(machineCode) {
      const normalized = normalizeMachineCode(machineCode);
      const records = await readAllRecords(blob, encryptionKey);
      return records
        .filter((record) => record.machineCode === normalized)
        .sort(compareLatest)[0] ?? null;
    },

    async list(input) {
      const page = clampInteger(input.page, 1, Number.MAX_SAFE_INTEGER, 1);
      const pageSize = clampInteger(input.pageSize, 1, 50, 20);
      const query = input.query.trim().toLocaleLowerCase("zh-CN");
      const machineQuery = tryNormalizeMachineQuery(input.query);
      const records = (await readAllRecords(blob, encryptionKey))
        .filter((record) => {
          if (!query) return true;
          return (
            record.customerName.toLocaleLowerCase("zh-CN").includes(query) ||
            record.machineCode === machineQuery
          );
        })
        .sort(compareLatest);
      const start = (page - 1) * pageSize;
      return {
        page,
        pageSize,
        total: records.length,
        items: records.slice(start, start + pageSize).map(toListItem)
      };
    },

    async exportEncryptedBackup() {
      const envelopes = await readAllEncrypted(blob);
      return `${JSON.stringify({
        version: 1,
        exportedAt: Math.floor(Date.now() / 1000),
        records: envelopes
      }, null, 2)}\n`;
    }
  };
}

export type LicenseRecordStore = {
  append(record: LicenseRecord): Promise<void>;
  get(recordId: string): Promise<LicenseRecord | null>;
  latestForMachine(machineCode: string): Promise<LicenseRecord | null>;
  list(input: {
    query: string;
    page: number;
    pageSize: number;
  }): Promise<{
    page: number;
    pageSize: number;
    total: number;
    items: LicenseRecordListItem[];
  }>;
  exportEncryptedBackup(): Promise<string>;
};

async function readAllRecords(
  blob: BlobStoreLike,
  encryptionKey: Buffer
): Promise<LicenseRecord[]> {
  const envelopes = await readAllEncrypted(blob);
  return envelopes.map((envelope) => decryptLicenseRecord(envelope, encryptionKey));
}

async function readAllEncrypted(blob: BlobStoreLike): Promise<EncryptedLicenseRecord[]> {
  const { blobs } = await blob.list({
    prefix: RECORD_PREFIX,
    consistency: "strong"
  });
  return Promise.all(blobs.map(async ({ key }) => {
    const raw = await blob.get(key, { type: "text", consistency: "strong" });
    if (!raw) throw new Error("授权记录不存在。");
    return JSON.parse(raw) as EncryptedLicenseRecord;
  }));
}

function recordObjectKey(record: LicenseRecord): string {
  if (!/^REC-[A-Z0-9-]+$/.test(record.recordId)) {
    throw new Error("授权记录编号不正确。");
  }
  const date = new Date(record.createdAt * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${RECORD_PREFIX}${year}/${month}/${record.recordId}.json`;
}

function compareLatest(left: LicenseRecord, right: LicenseRecord): number {
  return right.createdAt - left.createdAt || right.expiresAt - left.expiresAt;
}

function tryNormalizeMachineQuery(query: string): string {
  try {
    return normalizeMachineCode(query);
  } catch {
    return "";
  }
}

function toListItem(record: LicenseRecord): LicenseRecordListItem {
  return {
    recordId: record.recordId,
    licenseId: record.licenseId,
    parentLicenseId: record.parentLicenseId,
    customerName: record.customerName,
    maskedMachineCode: maskMachineCode(record.machineCode),
    issuedAt: record.issuedAt,
    previousExpiresAt: record.previousExpiresAt,
    expiresAt: record.expiresAt,
    durationDays: record.durationDays,
    permanent: record.permanent,
    licenseCode: record.licenseCode,
    remark: record.remark,
    createdAt: record.createdAt,
    status: record.expiresAt > Math.floor(Date.now() / 1000) ? "active" : "expired"
  };
}

function maskMachineCode(machineCode: string): string {
  const groups = machineCode.split("-");
  return groups.length === 4
    ? `${groups[0]}-****-****-${groups[3]}`
    : "****-****-****-****";
}

function clampInteger(value: number, minimum: number, maximum: number, fallback: number): number {
  return Number.isInteger(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}
