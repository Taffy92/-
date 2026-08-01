import type {
  LicenseDraft,
  LicenseHistoryPage,
  LicenseResult
} from "./types";

const API_ROOT = "/api/admin/license";

export class LicenseAdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function checkBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_ROOT}/health`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkSession(): Promise<boolean> {
  try {
    const response = await fetch(`${API_ROOT}/session`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) return false;
    const payload = await response.json() as { authenticated?: unknown };
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<void> {
  await requestJson("/session", {
    method: "POST",
    body: JSON.stringify({ password })
  });
}

export async function logout(): Promise<void> {
  await requestJson("/session", { method: "DELETE" });
}

export async function generateLicense(draft: LicenseDraft): Promise<LicenseResult> {
  const payload = await requestJson<{ ok: true } & LicenseResult>("/generate", {
    method: "POST",
    body: JSON.stringify({
      customerName: draft.customerName,
      machineCode: draft.parentRecordId ? "" : draft.machineCode,
      duration: draft.duration,
      remark: draft.remark,
      parentRecordId: draft.parentRecordId
    })
  });
  return payload;
}

export async function loadHistory(
  query = "",
  page = 1
): Promise<LicenseHistoryPage> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    pageSize: "20"
  });
  const payload = await requestJson<{ ok: true } & LicenseHistoryPage>(
    `/records?${params.toString()}`
  );
  return payload;
}

export async function downloadRecordFile(recordId: string): Promise<void> {
  const response = await fetch(`${API_ROOT}/records/${encodeURIComponent(recordId)}/file`, {
    cache: "no-store",
    credentials: "same-origin"
  });
  if (!response.ok) throw await toApiError(response);
  downloadBlob(await response.blob(), "license.mrx");
}

export async function downloadEncryptedBackup(): Promise<void> {
  const response = await fetch(`${API_ROOT}/backup`, {
    cache: "no-store",
    credentials: "same-origin"
  });
  if (!response.ok) throw await toApiError(response);
  const disposition = response.headers.get("content-disposition") ?? "";
  const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ??
    "license-admin-backup.json";
  downloadBlob(await response.blob(), fileName);
}

export function downloadLicenseResult(result: LicenseResult): void {
  downloadBlob(
    new Blob([result.licenseFileContent], { type: "application/json;charset=utf-8" }),
    result.licenseFileName
  );
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "same-origin"
  });
  if (!response.ok) throw await toApiError(response);
  return await response.json() as T;
}

async function toApiError(response: Response): Promise<LicenseAdminApiError> {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  return new LicenseAdminApiError(payload.error ?? "操作失败，请稍后重试。", response.status);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
