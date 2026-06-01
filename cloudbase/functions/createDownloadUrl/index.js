const http = require("http");
const tcb = require("@cloudbase/node-sdk");
const {
  buildCorsHeaders: buildCorsHeadersBase,
  getRequestOrigin,
  isOriginAllowed: isOriginAllowedBase,
  normalizePackageType,
  parseAllowedOrigins,
  passwordMatches
} = require("./security");

const app = tcb.init({
  env: process.env.TCB_ENV || process.env.SCF_NAMESPACE
});

const db = app.database();
const LOG_COLLECTION = process.env.LOG_COLLECTION || "download_authorization_logs";
const DOWNLOAD_PASSWORD = process.env.DOWNLOAD_PASSWORD || "";
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.ALLOWED_ORIGIN || process.env.ALLOWED_ORIGINS || "");
const DEFAULT_MAX_AGE = Number(process.env.DOWNLOAD_URL_MAX_AGE || 600);
const MAX_REQUEST_BODY_BYTES = Number(process.env.DOWNLOAD_REQUEST_MAX_BYTES || 2048);
const DEFAULT_FILE_ID = process.env.INSTALLER_FILE_ID || "";
const DEFAULT_FILE_NAME =
  process.env.INSTALLER_FILE_NAME ||
  "\u4e07\u80fd\u683c\u5f0f\u8f6c\u6362\u5668_1.0.0_x64-setup.exe";
const INSTALLER_FILES = {
  exe: {
    fileID: process.env.INSTALLER_EXE_FILE_ID || DEFAULT_FILE_ID,
    fileName:
      process.env.INSTALLER_EXE_FILE_NAME ||
      DEFAULT_FILE_NAME
  },
  msi: {
    fileID: process.env.INSTALLER_MSI_FILE_ID || "",
    fileName:
      process.env.INSTALLER_MSI_FILE_NAME ||
      "\u4e07\u80fd\u683c\u5f0f\u8f6c\u6362\u5668_1.0.0_x64_zh-CN.msi"
  }
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(getRequestOrigin(req))) {
      sendJson(res, 403, { error: "\u5f53\u524d\u6765\u6e90\u4e0d\u5141\u8bb8\u8bbf\u95ee\u4e0b\u8f7d\u6388\u6743\u63a5\u53e3\u3002" }, buildCorsHeaders(req));
      return;
    }
    sendJson(res, 204, {}, buildCorsHeaders(req));
    return;
  }

  const url = new URL(req.url || "/", "http://127.0.0.1");
  const isRootPath = url.pathname === "/" || url.pathname === "/createDownloadUrl";

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "createDownloadUrl",
      mode: "shared_password",
      configured: Boolean(DOWNLOAD_PASSWORD && INSTALLER_FILES.exe.fileID)
    });
    return;
  }

  if (req.method === "GET" && isRootPath) {
    sendInfoPage(res);
    return;
  }

  if (!isRootPath) {
    sendJson(res, 404, { error: "Not Found" });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      error: "\u8bf7\u5728\u4e0b\u8f7d\u9875\u8f93\u5165\u4e0b\u8f7d\u53e3\u4ee4\u83b7\u53d6\u5b89\u88c5\u5305\u4e0b\u8f7d\u94fe\u63a5\u3002"
    });
    return;
  }

  try {
    if (!isOriginAllowed(getRequestOrigin(req))) {
      await writeLog({ allowed: false, reason: "invalid_origin", req });
      sendJson(res, 403, {
        error: "\u5f53\u524d\u6765\u6e90\u4e0d\u5141\u8bb8\u8bbf\u95ee\u4e0b\u8f7d\u6388\u6743\u63a5\u53e3\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    if (!DOWNLOAD_PASSWORD) {
      await writeLog({ allowed: false, reason: "missing_download_password", req });
      sendJson(res, 503, {
        error: "\u4e0b\u8f7d\u53e3\u4ee4\u5c1a\u672a\u914d\u7f6e\uff0c\u8bf7\u8054\u7cfb\u4f5c\u8005\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    const contentType = String(req.headers["content-type"] || "");
    if (!/application\/json/i.test(contentType)) {
      await writeLog({ allowed: false, reason: "invalid_content_type", req });
      sendJson(res, 415, {
        error: "\u4e0b\u8f7d\u6388\u6743\u63a5\u53e3\u53ea\u63a5\u53d7 JSON \u8bf7\u6c42\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    let body;
    try {
      body = await readJsonBody(req, MAX_REQUEST_BODY_BYTES);
    } catch (error) {
      const statusCode = Number(error && error.statusCode) || 400;
      await writeLog({
        allowed: false,
        reason: statusCode === 413 ? "request_too_large" : "invalid_json",
        req
      });
      sendJson(res, statusCode, {
        error: error && error.message ? error.message : "\u8bf7\u6c42 JSON \u683c\u5f0f\u4e0d\u6b63\u786e\uff0c\u8bf7\u4f7f\u7528\u6709\u6548 JSON \u5185\u5bb9\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    const password = String(body.password || body.code || "").trim();
    const packageType = normalizePackageType(body.packageType || body.type || "exe");
    if (!packageType) {
      await writeLog({ allowed: false, reason: "invalid_package_type", req });
      sendJson(res, 400, {
        error: "\u5b89\u88c5\u5305\u7c7b\u578b\u4e0d\u6b63\u786e\uff0c\u8bf7\u9009\u62e9 EXE \u6216 MSI\u3002"
      }, buildCorsHeaders(req));
      return;
    }
    const selectedFile = INSTALLER_FILES[packageType];

    if (!selectedFile || !selectedFile.fileID) {
      await writeLog({ allowed: false, reason: "missing_file_id", req });
      sendJson(res, 500, {
        error: "\u5b89\u88c5\u5305\u6587\u4ef6\u5c1a\u672a\u914d\u7f6e\uff0c\u8bf7\u8054\u7cfb\u4f5c\u8005\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    if (!password) {
      await writeLog({ allowed: false, reason: "empty_password", req });
      sendJson(res, 400, { error: "\u8bf7\u8f93\u5165\u4e0b\u8f7d\u53e3\u4ee4\u3002" }, buildCorsHeaders(req));
      return;
    }

    if (!passwordMatches(password, DOWNLOAD_PASSWORD)) {
      await writeLog({ allowed: false, reason: "invalid_password", req });
      sendJson(res, 403, {
        error: "\u4e0b\u8f7d\u53e3\u4ee4\u4e0d\u6b63\u786e\u6216\u5df2\u66f4\u65b0\uff0c\u8bf7\u8054\u7cfb\u4f5c\u8005\u83b7\u53d6\u6700\u65b0\u53e3\u4ee4\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    const tempUrlResult = await app.getTempFileURL({
      fileList: [{ fileID: selectedFile.fileID, maxAge: DEFAULT_MAX_AGE }]
    });
    const fileInfo = tempUrlResult.fileList && tempUrlResult.fileList[0];
    if (!fileInfo || !fileInfo.tempFileURL) {
      await writeLog({ allowed: false, reason: "temp_url_failed", req });
      sendJson(res, 500, {
        error: "\u4e34\u65f6\u4e0b\u8f7d\u94fe\u63a5\u751f\u6210\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002"
      }, buildCorsHeaders(req));
      return;
    }

    await writeLog({ allowed: true, reason: "ok", packageType, req });

    sendJson(res, 200, {
      downloadUrl: fileInfo.tempFileURL,
      expiresAt: new Date(Date.now() + DEFAULT_MAX_AGE * 1000).toISOString(),
      fileName: selectedFile.fileName,
      packageType,
      message: "\u4e0b\u8f7d\u53e3\u4ee4\u6821\u9a8c\u901a\u8fc7\u3002"
    }, buildCorsHeaders(req));
  } catch (error) {
    console.error("[createDownloadUrl]", error);
    sendJson(res, 500, {
      error: "\u6388\u6743\u4e0b\u8f7d\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u6216\u8054\u7cfb\u4f5c\u8005\u3002"
    }, buildCorsHeaders(req));
  }
});

if (require.main === module) {
  server.listen(9000);
}

function readJsonBody(req, maxBytes = MAX_REQUEST_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let totalBytes = 0;
    let overflow = false;
    req.on("data", (chunk) => {
      if (overflow) return;
      raw += chunk;
      totalBytes += Buffer.byteLength(chunk);
      if (totalBytes > maxBytes) {
        overflow = true;
      }
    });
    req.on("end", () => {
      if (overflow) {
        const error = new Error("\u8bf7\u6c42\u4f53\u8fc7\u5927\uff0c\u8bf7\u51cf\u5c11\u63d0\u4ea4\u5185\u5bb9\u540e\u91cd\u8bd5\u3002");
        error.statusCode = 413;
        reject(error);
        return;
      }
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        const error = new Error("\u8bf7\u6c42 JSON \u683c\u5f0f\u4e0d\u6b63\u786e\uff0c\u8bf7\u4f7f\u7528\u6709\u6548 JSON \u5185\u5bb9\u3002");
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function writeLog({ req, ...data }) {
  try {
    await db.collection(LOG_COLLECTION).add({
      ...data,
      mode: "shared_password",
      origin: getRequestOrigin(req),
      userAgent: req && req.headers ? req.headers["user-agent"] || "" : "",
      createdAt: new Date()
    });
  } catch (error) {
    console.warn("[createDownloadUrl] write log failed", error);
  }
}

function isOriginAllowed(origin) {
  return isOriginAllowedBase(origin, ALLOWED_ORIGINS);
}

function buildCorsHeaders(req) {
  return buildCorsHeadersBase(req, ALLOWED_ORIGINS);
}

function sendInfoPage(res) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });
  res.end(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>&#19979;&#36733;&#21475;&#20196;&#25509;&#21475;</title>
  <style>
    body{margin:0;background:#f8fafc;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:720px;margin:12vh auto;padding:32px;border:1px solid #dbeafe;border-radius:20px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.08)}
    h1{font-size:28px;margin:0 0 12px}
    p{font-size:16px;line-height:1.8;color:#475569}
    a{color:#0284c7;font-weight:700;text-decoration:none}
    code{padding:3px 6px;border-radius:6px;background:#eef6ff}
  </style>
</head>
<body>
  <main>
    <h1>&#19979;&#36733;&#21475;&#20196;&#25509;&#21475;&#24050;&#21551;&#29992;</h1>
    <p>&#36825;&#20010;&#22320;&#22336;&#26159;&#31163;&#32447;&#29256;&#23433;&#35013;&#21253;&#30340;&#25480;&#26435;&#19979;&#36733;&#25509;&#21475;&#65292;&#19981;&#26159;&#26222;&#36890;&#19979;&#36733;&#39029;&#12290;</p>
    <p>&#35831;&#36820;&#22238;&#19979;&#36733;&#39029;&#65292;&#36755;&#20837;&#20316;&#32773;&#25552;&#20379;&#30340;&#19979;&#36733;&#21475;&#20196;&#33719;&#21462;&#20020;&#26102;&#19979;&#36733;&#38142;&#25509;&#12290;</p>
    <p><a href="https://gszhmrx.cn/download/">&#21069;&#24448;&#19979;&#36733;&#39029;</a></p>
    <p>&#25509;&#21475;&#20581;&#24247;&#26816;&#26597;&#65306;<code>/health</code></p>
  </main>
</body>
</html>`);
}

function sendJson(res, statusCode, body, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  res.end(statusCode === 204 ? "" : JSON.stringify(body));
}

module.exports = {
  server
};
