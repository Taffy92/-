import { randomUUID } from "node:crypto";
import {
  clearSessionCookie,
  createSessionCookie,
  createSessionToken,
  hasSessionCookie,
  hasValidSession,
  verifyAdminPassword
} from "./auth";
import {
  readLicenseAdminConfig,
  type LicenseAdminConfig
} from "./config";
import {
  HttpError,
  assertSameOrigin,
  errorResponse,
  jsonResponse,
  readJsonBody,
  toSafeErrorResponse
} from "./http";
import { generateLicense } from "./license";
import { normalizeMachineCode } from "./machine-code";
import {
  createEdgeOneRecordStore,
  type LicenseRecordStore
} from "./record-store";
import type { LicenseDuration, LicenseRecord } from "./types";

const ALLOWED_DURATIONS = new Set<LicenseDuration>([30, 90, 180, 365, "permanent"]);

export type LicenseAdminApiDependencies = {
  now: () => number;
  getConfig: () => LicenseAdminConfig;
  getRecordStore: (config: LicenseAdminConfig) => LicenseRecordStore;
};

const defaultDependencies: LicenseAdminApiDependencies = {
  now: () => Math.floor(Date.now() / 1000),
  getConfig: () => readLicenseAdminConfig(),
  getRecordStore: (config) => createEdgeOneRecordStore(config.recordEncryptionKey)
};

export function createLicenseAdminApi(
  dependencies: LicenseAdminApiDependencies = defaultDependencies
) {
  return {
    health(request: Request): Response {
      return jsonResponse({ ok: true, hasSession: hasSessionCookie(request) });
    },

    async createSession(request: Request): Promise<Response> {
      try {
        assertSameOrigin(request);
        const config = dependencies.getConfig();
        const body = await readJsonBody<{ password?: unknown }>(request);
        const password = typeof body.password === "string" ? body.password : "";
        if (Buffer.byteLength(password, "utf8") > 256) {
          return errorResponse(401, "密码不正确");
        }
        if (!await verifyAdminPassword(password, config.passwordDigest)) {
          return errorResponse(401, "密码不正确");
        }
        const response = jsonResponse({ ok: true });
        response.headers.set(
          "Set-Cookie",
          createSessionCookie(createSessionToken(config.sessionSecret, dependencies.now()))
        );
        return response;
      } catch (error) {
        return toSafeErrorResponse(error);
      }
    },

    deleteSession(request: Request): Response {
      try {
        assertSameOrigin(request);
        const response = jsonResponse({ ok: true });
        response.headers.set("Set-Cookie", clearSessionCookie());
        return response;
      } catch (error) {
        return toSafeErrorResponse(error);
      }
    },

    async generate(request: Request): Promise<Response> {
      try {
        assertSameOrigin(request);
        const { config, records } = authorize(request, dependencies);
        const body = await readJsonBody<GenerateRequest>(request);
        const customerName = cleanText(body.customerName, "客户名称", 120, true);
        const remark = cleanText(body.remark, "备注", 500, false);
        const duration = parseDuration(body.duration);
        let machineCode: string;
        let previousExpiresAt: number | undefined;
        let parentLicenseId: string | null = null;

        if (body.parentRecordId) {
          const parent = await records.get(cleanRecordId(body.parentRecordId));
          if (!parent) throw new HttpError(404, "没有找到要续期的授权记录。");
          machineCode = parent.machineCode;
          const latest = await records.latestForMachine(machineCode);
          if (!latest) throw new HttpError(404, "没有找到要续期的授权记录。");
          previousExpiresAt = latest.expiresAt;
          parentLicenseId = latest.licenseId;
        } else {
          machineCode = normalizeMachineCode(body.machineCode);
        }

        const generated = generateLicense({
          privateKeyPem: config.privateKeyPem,
          machineCode,
          duration,
          previousExpiresAt,
          now: dependencies.now()
        });
        const record = toLicenseRecord({
          generated,
          customerName,
          remark,
          duration,
          previousExpiresAt,
          parentLicenseId,
          now: dependencies.now()
        });
        await records.append(record);

        return jsonResponse({
          ok: true,
          recordId: record.recordId,
          licenseId: record.licenseId,
          parentLicenseId: record.parentLicenseId,
          customerName: record.customerName,
          machineCode: record.machineCode,
          issuedAt: record.issuedAt,
          previousExpiresAt: record.previousExpiresAt,
          expiresAt: record.expiresAt,
          durationDays: record.durationDays,
          permanent: record.permanent,
          licenseCode: record.licenseCode,
          licenseFileName: generated.licenseFileName,
          licenseFileContent: record.licenseFileContent
        });
      } catch (error) {
        return toSafeErrorResponse(error);
      }
    },

    async listRecords(request: Request): Promise<Response> {
      try {
        const { records } = authorize(request, dependencies);
        const url = new URL(request.url);
        const result = await records.list({
          query: url.searchParams.get("query") ?? "",
          page: parseInteger(url.searchParams.get("page"), 1),
          pageSize: parseInteger(url.searchParams.get("pageSize"), 20)
        });
        return jsonResponse({ ok: true, ...result });
      } catch (error) {
        return toSafeErrorResponse(error);
      }
    },

    async downloadFile(request: Request, recordId: string): Promise<Response> {
      try {
        const { records } = authorize(request, dependencies);
        const record = await records.get(cleanRecordId(recordId));
        if (!record) throw new HttpError(404, "没有找到授权文件。");
        return new Response(record.licenseFileContent, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": 'attachment; filename="license.mrx"',
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
          }
        });
      } catch (error) {
        return toSafeErrorResponse(error);
      }
    },

    async backup(request: Request): Promise<Response> {
      try {
        const { records } = authorize(request, dependencies);
        const content = await records.exportEncryptedBackup();
        const date = new Date(dependencies.now() * 1000).toISOString().slice(0, 10);
        return new Response(content, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="license-admin-backup-${date}.json"`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
          }
        });
      } catch (error) {
        return toSafeErrorResponse(error);
      }
    }
  };
}

export const licenseAdminApi = createLicenseAdminApi();

type GenerateRequest = {
  customerName?: unknown;
  machineCode?: unknown;
  duration?: unknown;
  remark?: unknown;
  parentRecordId?: unknown;
};

function authorize(
  request: Request,
  dependencies: LicenseAdminApiDependencies
): { config: LicenseAdminConfig; records: LicenseRecordStore } {
  const config = dependencies.getConfig();
  if (!hasValidSession(request, config.sessionSecret, dependencies.now())) {
    throw new HttpError(401, "请重新登录。");
  }
  return {
    config,
    records: dependencies.getRecordStore(config)
  };
}

function parseDuration(value: unknown): LicenseDuration {
  const normalized = value === "permanent" ? value : Number(value);
  if (!ALLOWED_DURATIONS.has(normalized as LicenseDuration)) {
    throw new HttpError(400, "授权时长不正确。");
  }
  return normalized as LicenseDuration;
}

function cleanText(
  value: unknown,
  label: string,
  maxBytes: number,
  required: boolean
): string {
  const text = typeof value === "string" ? value.trim() : "";
  if ((required && !text) || Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new HttpError(400, `${label}不正确。`);
  }
  return text;
}

function cleanRecordId(value: unknown): string {
  const recordId = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!/^REC-[A-Z0-9-]+$/.test(recordId)) {
    throw new HttpError(400, "授权记录编号不正确。");
  }
  return recordId;
}

function parseInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function toLicenseRecord(input: {
  generated: ReturnType<typeof generateLicense>;
  customerName: string;
  remark: string;
  duration: LicenseDuration;
  previousExpiresAt?: number;
  parentLicenseId: string | null;
  now: number;
}): LicenseRecord {
  return {
    recordId: `REC-${createDatePart(input.now)}-${randomUUID().slice(0, 8).toUpperCase()}`,
    licenseId: input.generated.envelope.payload.license_id,
    parentLicenseId: input.parentLicenseId,
    customerName: input.customerName,
    machineCode: input.generated.machineCode,
    issuedAt: input.generated.issuedAt,
    previousExpiresAt: input.previousExpiresAt ?? null,
    expiresAt: input.generated.expiresAt,
    durationDays: input.duration === "permanent" ? null : input.duration,
    permanent: input.duration === "permanent",
    edition: input.generated.envelope.payload.edition,
    features: [...input.generated.envelope.payload.features],
    licenseCode: input.generated.licenseCode,
    licenseFileContent: input.generated.licenseFileContent,
    remark: input.remark,
    createdAt: input.now
  };
}

function createDatePart(now: number): string {
  return new Date(now * 1000).toISOString().slice(0, 10).replace(/-/g, "");
}
