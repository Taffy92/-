import { generateKeyPairSync, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  createLicenseAdminApi,
  type LicenseAdminApiDependencies
} from "../../cloud-functions/api/admin/license/_lib/api";
import { hashAdminPassword } from "../../cloud-functions/api/admin/license/_lib/auth";
import {
  createRecordStore,
  type BlobStoreLike
} from "../../cloud-functions/api/admin/license/_lib/record-store";

class MemoryBlobStore implements BlobStoreLike {
  readonly values = new Map<string, string>();
  failWrites = false;

  async set(key: string, value: string, options?: { onlyIfNew?: boolean }): Promise<void> {
    if (this.failWrites) throw new Error("blob unavailable");
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

describe("EdgeOne license admin API", () => {
  it("exposes a minimal public health response", async () => {
    const { api } = await createFixture();
    const response = api.health();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("creates and clears an administrator session", async () => {
    const { api } = await createFixture();
    const wrong = await api.createSession(request("/session", {
      method: "POST",
      body: JSON.stringify({ password: "000000" })
    }));
    expect(wrong.status).toBe(401);
    expect(await wrong.json()).toEqual({ ok: false, error: "密码不正确" });

    const correct = await api.createSession(request("/session", {
      method: "POST",
      body: JSON.stringify({ password: "123456" })
    }));
    expect(correct.status).toBe(200);
    expect(correct.headers.get("set-cookie")).toContain("license_admin_session=");

    const logout = api.deleteSession(request("/session", { method: "DELETE" }));
    expect(logout.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects unauthenticated and cross-origin issuance", async () => {
    const { api } = await createFixture();
    const unauthenticated = await api.generate(request("/generate", {
      method: "POST",
      body: JSON.stringify(validIssueInput())
    }));
    expect(unauthenticated.status).toBe(401);

    const cookie = await login(api);
    const foreign = await api.generate(request("/generate", {
      method: "POST",
      origin: "https://example.com",
      cookie,
      body: JSON.stringify(validIssueInput())
    }));
    expect(foreign.status).toBe(403);
  });

  it("issues, lists, renews, and downloads a recorded license", async () => {
    const { api } = await createFixture();
    const cookie = await login(api);
    const issued = await api.generate(request("/generate", {
      method: "POST",
      cookie,
      body: JSON.stringify(validIssueInput())
    }));
    expect(issued.status).toBe(200);
    const first = await issued.json() as {
      recordId: string;
      licenseId: string;
      machineCode: string;
      expiresAt: number;
      licenseCode: string;
      licenseFileContent: string;
    };
    expect(first.machineCode).toBe("TEST-TEST-TEST-TEST");
    expect(first.licenseCode).toMatch(/^UFC1-/);
    expect(first.licenseFileContent).toContain("ufc-license-v1");

    const listed = await api.listRecords(request("/records?query=测试&page=1&pageSize=20", {
      cookie
    }));
    const history = await listed.json() as {
      total: number;
      items: Array<{ recordId: string; maskedMachineCode: string }>;
    };
    expect(history.total).toBe(1);
    expect(history.items[0].maskedMachineCode).toBe("TEST-****-****-TEST");

    const renewed = await api.generate(request("/generate", {
      method: "POST",
      cookie,
      body: JSON.stringify({
        ...validIssueInput(),
        machineCode: "",
        duration: 90,
        parentRecordId: first.recordId
      })
    }));
    const second = await renewed.json() as {
      expiresAt: number;
      previousExpiresAt: number;
      parentLicenseId: string;
    };
    expect(second.previousExpiresAt).toBe(first.expiresAt);
    expect(second.parentLicenseId).toBe(first.licenseId);
    expect(second.expiresAt).toBe(first.expiresAt + 90 * 24 * 60 * 60);

    const file = await api.downloadFile(
      request(`/records/${first.recordId}/file`, { cookie }),
      first.recordId
    );
    expect(file.status).toBe(200);
    expect(file.headers.get("content-disposition")).toContain("license.mrx");
    expect(await file.text()).toContain("ufc-license-v1");
  });

  it("does not return a generated code when Blob persistence fails", async () => {
    const { api, blob } = await createFixture();
    const cookie = await login(api);
    blob.failWrites = true;

    const response = await api.generate(request("/generate", {
      method: "POST",
      cookie,
      body: JSON.stringify(validIssueInput())
    }));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("UFC1-");
  });

  it("exports only encrypted record envelopes", async () => {
    const { api } = await createFixture();
    const cookie = await login(api);
    await api.generate(request("/generate", {
      method: "POST",
      cookie,
      body: JSON.stringify(validIssueInput())
    }));

    const response = await api.backup(request("/backup", { cookie }));
    const text = await response.text();
    expect(response.headers.get("content-disposition")).toContain("license-admin-backup");
    expect(text).not.toContain("测试客户");
    expect(text).not.toContain("TEST-TEST-TEST-TEST");
    expect(text).not.toContain("UFC1-");
  });
});

async function createFixture(): Promise<{
  api: ReturnType<typeof createLicenseAdminApi>;
  blob: MemoryBlobStore;
}> {
  const { privateKey } = generateKeyPairSync("ed25519");
  const blob = new MemoryBlobStore();
  const recordKey = Buffer.alloc(32, 3);
  const passwordDigest = await hashAdminPassword("123456", Buffer.alloc(16, 2));
  const config = {
    passwordDigest,
    privateKeyPem: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
    sessionSecret: randomBytes(32).toString("base64url"),
    recordEncryptionKey: recordKey
  };
  const dependencies: LicenseAdminApiDependencies = {
    now: () => 1_700_000_000,
    getConfig: () => config,
    getRecordStore: () => createRecordStore(blob, recordKey)
  };
  return { api: createLicenseAdminApi(dependencies), blob };
}

async function login(api: ReturnType<typeof createLicenseAdminApi>): Promise<string> {
  const response = await api.createSession(request("/session", {
    method: "POST",
    body: JSON.stringify({ password: "123456" })
  }));
  const setCookie = response.headers.get("set-cookie") ?? "";
  return setCookie.split(";")[0];
}

function request(
  path: string,
  options: {
    method?: string;
    origin?: string;
    cookie?: string;
    body?: string;
  } = {}
): Request {
  const headers = new Headers();
  headers.set("Origin", options.origin ?? "https://gszhmrx.cn");
  if (options.cookie) headers.set("Cookie", options.cookie);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  return new Request(`https://gszhmrx.cn/api/admin/license${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body
  });
}

function validIssueInput(): Record<string, unknown> {
  return {
    customerName: "测试客户",
    machineCode: "test test test test",
    duration: 30,
    remark: "首次授权"
  };
}
