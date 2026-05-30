const assert = require("node:assert/strict");
const Module = require("node:module");

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "@cloudbase/node-sdk") {
    return {
      init() {
        return {
          database() {
            return {
              collection() {
                return {
                  async add() {
                    return { id: "mock-log-id" };
                  }
                };
              }
            };
          },
          async getTempFileURL({ fileList }) {
            return {
              fileList: fileList.map((item) => ({
                fileID: item.fileID,
                tempFileURL: `https://download.example.test/${encodeURIComponent(item.fileID)}`
              }))
            };
          }
        };
      }
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

process.env.DOWNLOAD_PASSWORD = "MRX-DOWNLOAD-2026";
process.env.ALLOWED_ORIGIN = "https://site.example.test";
process.env.INSTALLER_EXE_FILE_ID = "cloud://bucket/installers/v1.0.0/setup.exe";
process.env.INSTALLER_MSI_FILE_ID = "cloud://bucket/installers/v1.0.0/setup.msi";
process.env.INSTALLER_EXE_FILE_NAME = "万能格式转换器_1.0.0_x64-setup.exe";
process.env.INSTALLER_MSI_FILE_NAME = "万能格式转换器_1.0.0_x64_zh-CN.msi";

const { server } = require("../cloudbase/functions/createDownloadUrl/index.js");

function listen(app) {
  return new Promise((resolve) => {
    app.listen(0, "127.0.0.1", () => resolve(app.address().port));
  });
}

async function request(baseUrl, body, origin = "https://site.example.test", method = "POST", extraHeaders = {}) {
  const isRawBody = typeof body === "string" || Buffer.isBuffer(body);
  const response = await fetch(baseUrl, {
    method,
    headers: {
      "Content-Type": isRawBody ? "text/plain" : "application/json",
      Origin: origin,
      ...extraHeaders
    },
    body: method === "POST" ? (isRawBody ? body : JSON.stringify(body)) : undefined
  });
  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : {}
  };
}

(async () => {
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}/createDownloadUrl`;
  try {
    const options = await request(baseUrl, undefined, "https://site.example.test", "OPTIONS");
    assert.equal(options.status, 204);
    assert.equal(options.headers.get("access-control-allow-origin"), "https://site.example.test");

    const exe = await request(baseUrl, { password: "MRX-DOWNLOAD-2026", packageType: "exe" });
    assert.equal(exe.status, 200);
    assert.equal(exe.body.packageType, "exe");
    assert.equal(exe.body.fileName, "万能格式转换器_1.0.0_x64-setup.exe");

    const msi = await request(baseUrl, { password: "MRX-DOWNLOAD-2026", packageType: "msi" });
    assert.equal(msi.status, 200);
    assert.equal(msi.body.packageType, "msi");
    assert.equal(msi.body.fileName, "万能格式转换器_1.0.0_x64_zh-CN.msi");

    const wrongPassword = await request(baseUrl, { password: "wrong", packageType: "exe" });
    assert.equal(wrongPassword.status, 403);

    const invalidPackage = await request(baseUrl, { password: "MRX-DOWNLOAD-2026", packageType: "zip" });
    assert.equal(invalidPackage.status, 400);

    const invalidOrigin = await request(baseUrl, { password: "MRX-DOWNLOAD-2026", packageType: "exe" }, "https://evil.example.test");
    assert.equal(invalidOrigin.status, 403);
    assert.equal(invalidOrigin.headers.get("access-control-allow-origin"), null);

    const invalidContentType = await request(
      baseUrl,
      { password: "MRX-DOWNLOAD-2026", packageType: "exe" },
      "https://site.example.test",
      "POST",
      { "Content-Type": "text/plain" }
    );
    assert.equal(invalidContentType.status, 415);

    const oversizedPayload = await request(
      baseUrl,
      JSON.stringify({
        password: "MRX-DOWNLOAD-2026",
        packageType: "exe",
        padding: "x".repeat(4096)
      }),
      "https://site.example.test",
      "POST",
      { "Content-Type": "application/json" }
    );
    assert.equal(oversizedPayload.status, 413);

    console.log("createDownloadUrl local checks passed");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    Module._load = originalLoad;
  }
})().catch(async (error) => {
  try {
    await new Promise((resolve) => server.close(resolve));
  } catch {}
  Module._load = originalLoad;
  console.error(error);
  process.exit(1);
});
