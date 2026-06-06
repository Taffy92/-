const http = require("http");
const { createHash, createHmac, createPrivateKey, randomUUID, sign } = require("crypto");

const PRODUCT = "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO";
const SOFTWARE_NAME = "万能格式转换器离线专业版";
const LICENSE_PREFIX = "UFC1-";
const LOCAL_TRIAL_KEY_CONTEXT = "ufc-local-trial-v1";
const DEFAULT_FEATURES = "basic,convert,export,batch";
const MAX_BODY_BYTES = 64 * 1024;

const CONTACT = {
  wechat: "___Skyblue",
  phone: "15588261515",
  email: "370298218@qq.com"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/licenseAdmin")) {
      sendHtml(res, renderAdminPage());
      return;
    }

    if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/licenseAdmin/health")) {
      sendJson(res, 200, {
        ok: true,
        service: "licenseAdmin",
        configured: isConfigured(),
        product: PRODUCT
      });
      return;
    }

    if (req.method === "POST" && (url.pathname === "/api/license" || url.pathname === "/licenseAdmin/api/license")) {
      if (!isAdminRequest(req)) {
        sendJson(res, 401, { error: "管理员密码不正确。" });
        return;
      }

      if (!getPrivateKeyPem()) {
        sendJson(res, 503, { error: "授权私钥尚未配置，请先设置 LICENSE_PRIVATE_KEY_PEM_B64。" });
        return;
      }

      const body = await readJsonBody(req);
      const result = generateLicenseFromInput(body, getPrivateKeyPem());
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: "Not Found" });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error && error.message ? error.message : "授权生成失败，请稍后重试。"
    });
  }
});

if (require.main === module) {
  server.listen(9000);
}

function isConfigured() {
  return Boolean((process.env.LICENSE_ADMIN_PASSWORD_SHA256 || process.env.LICENSE_ADMIN_PASSWORD) && getPrivateKeyPem());
}

function getPrivateKeyPem() {
  if (process.env.LICENSE_PRIVATE_KEY_PEM_B64) {
    return Buffer.from(process.env.LICENSE_PRIVATE_KEY_PEM_B64, "base64").toString("utf8");
  }
  return process.env.LICENSE_PRIVATE_KEY_PEM || "";
}

function isAdminRequest(req) {
  const expectedHash = process.env.LICENSE_ADMIN_PASSWORD_SHA256 || hashText(process.env.LICENSE_ADMIN_PASSWORD || "");
  if (!expectedHash) return false;
  const authorization = String(req.headers.authorization || "");
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const providedHash = hashText(token);
  return timingSafeTextEqual(providedHash, expectedHash);
}

function generateLicenseFromInput(input, privateKeyPem) {
  const request = parseActivationRequest(input.request || input.activationRequest || "");
  const machineId = normalizeMachineId(input.machineId || input.machine_id || request?.machineId || request?.machine_id || "");
  if (!machineId) {
    const error = new Error("请输入机器码，或粘贴 activation_request.mrx 内容。");
    error.statusCode = 400;
    throw error;
  }

  if (request) {
    verifyActivationRequest(request, machineId);
  }

  const now = Math.floor(Date.now() / 1000);
  const days = parsePositiveInt(input.days || 365, "授权天数");
  const issuedAt = input.issuedAt ? parsePositiveInt(input.issuedAt, "签发时间") : now;
  const expiresAt = input.expiresAt ? parsePositiveInt(input.expiresAt, "到期时间") : issuedAt + days * 24 * 60 * 60;
  const features = normalizeFeatures(input.features || DEFAULT_FEATURES);
  const payload = {
    license_id: input.licenseId || `LIC-${new Date(issuedAt * 1000).toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`,
    product: PRODUCT,
    software_name: SOFTWARE_NAME,
    machine_id: machineId,
    issued_at: issuedAt,
    expires_at: expiresAt,
    edition: input.edition || "pro",
    features
  };

  const privateKey = createPrivateKey(privateKeyPem);
  const signature = sign(null, Buffer.from(canonicalLicensePayload(payload), "utf8"), privateKey).toString("base64url");
  const envelope = {
    version: "ufc-license-v1",
    payload,
    signature
  };
  const licenseCode = `${LICENSE_PREFIX}${Buffer.from(JSON.stringify(envelope), "utf8").toString("base64url")}`;
  return {
    ok: true,
    product: PRODUCT,
    machineId,
    customer: String(input.customer || "").trim(),
    remark: String(input.remark || "").trim(),
    issuedAt,
    expiresAt,
    expiresAtText: new Date(expiresAt * 1000).toLocaleString("zh-CN", { hour12: false }),
    licenseCode,
    licenseFileName: "license.mrx",
    licenseFileContent: `${JSON.stringify(envelope, null, 2)}\n`,
    envelope,
    contact: CONTACT
  };
}

function parseActivationRequest(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  const text = String(value).trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("activation_request.mrx 内容不是有效 JSON。");
    error.statusCode = 400;
    throw error;
  }
}

function verifyActivationRequest(request, machineId) {
  if (request.product !== PRODUCT) {
    const error = new Error("activation_request.mrx 产品不匹配。");
    error.statusCode = 400;
    throw error;
  }
  const signature = request.requestSignature || request.request_signature;
  if (!signature) {
    const error = new Error("activation_request.mrx 缺少请求签名。");
    error.statusCode = 400;
    throw error;
  }
  const expected = activationRequestHmac(request, machineId);
  if (!timingSafeTextEqual(signature, expected)) {
    const error = new Error("activation_request.mrx 签名无效，请让用户重新导出。");
    error.statusCode = 400;
    throw error;
  }
}

function activationRequestHmac(request, machineId) {
  const key = createHash("sha256")
    .update(PRODUCT)
    .update("|trial|")
    .update(machineId)
    .update("|")
    .update(LOCAL_TRIAL_KEY_CONTEXT)
    .digest();
  return createHmac("sha256", key)
    .update(canonicalActivationRequest(request), "utf8")
    .digest("base64url");
}

function canonicalActivationRequest(request) {
  return [
    `product=${request.product}`,
    `software_name=${request.softwareName || request.software_name}`,
    `machine_id=${request.machineId || request.machine_id}`,
    `app_version=${request.appVersion || request.app_version}`,
    `trial_status=${request.trialStatus || request.trial_status}`,
    `request_time=${request.requestTime || request.request_time}`,
    `request_id=${request.requestId || request.request_id}`
  ].join("\n");
}

function canonicalLicensePayload(payload) {
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

function normalizeMachineId(value) {
  return String(value).trim().toUpperCase();
}

function normalizeFeatures(value) {
  const features = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!features.length) {
    const error = new Error("授权功能列表不能为空。");
    error.statusCode = 400;
    throw error;
  }
  return features;
}

function parsePositiveInt(value, label) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const error = new Error(`${label}必须是正整数。`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let total = 0;
    req.on("data", (chunk) => {
      total += Buffer.byteLength(chunk);
      if (total > MAX_BODY_BYTES) {
        const error = new Error("请求内容过大。");
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        const error = new Error("请求 JSON 格式不正确。");
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(data));
}

function sendHtml(res, html) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(html);
}

function hashText(value) {
  if (!value) return "";
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

function timingSafeTextEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function renderAdminPage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>离线专业版授权后台</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#07111f;color:#e5eefc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(920px,100%);margin:0 auto;padding:24px 14px 42px}.panel{border:1px solid rgba(56,189,248,.22);background:#0b1628;border-radius:8px;padding:18px;margin-top:14px}
    h1{font-size:24px;margin:0 0 8px}h2{font-size:18px;margin:0 0 12px}.muted{color:#9fb2ce;font-size:14px;line-height:1.7}
    label{display:block;margin-top:12px;font-size:13px;color:#c8d8f0}.grid{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:720px){.grid{grid-template-columns:1fr 1fr}}
    input,textarea,select,button{width:100%;border-radius:6px;border:1px solid rgba(125,211,252,.24);background:#07111f;color:#f8fbff;font:inherit}
    input,textarea,select{padding:12px;margin-top:6px}textarea{min-height:104px;resize:vertical}
    button{min-height:44px;padding:10px 14px;background:#22d3ee;color:#06111f;font-weight:700;cursor:pointer}
    button.secondary{background:#13233a;color:#dcecff}.actions{display:grid;grid-template-columns:1fr;gap:10px;margin-top:14px}@media(min-width:520px){.actions{grid-template-columns:1fr 1fr 1fr}}
    pre{white-space:pre-wrap;word-break:break-all;background:#050b14;border:1px solid rgba(125,211,252,.18);border-radius:6px;padding:12px;max-height:260px;overflow:auto}
    .ok{color:#86efac}.error{color:#fecaca}.tag{display:inline-block;border:1px solid rgba(34,211,238,.28);color:#67e8f9;padding:4px 8px;border-radius:4px;font-size:12px;margin-bottom:10px}
  </style>
</head>
<body>
  <main>
    <span class="tag">私有后台 · 手机可用 · 离线授权</span>
    <h1>离线专业版授权后台</h1>
    <p class="muted">输入用户机器码，或粘贴 activation_request.mrx 内容。生成的激活码和 license.mrx 都在用户电脑本地校验；用户有网、无网都可以完成授权。</p>
    <section class="panel">
      <h2>生成授权</h2>
      <label>管理员密码<input id="password" type="password" autocomplete="current-password" /></label>
      <div class="grid">
        <label>机器码<input id="machineId" placeholder="XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" /></label>
        <label>授权天数<input id="days" type="number" min="1" value="365" /></label>
      </div>
      <div class="grid">
        <label>客户名称<input id="customer" placeholder="客户或单位名称" /></label>
        <label>版本<select id="edition"><option value="pro">pro</option><option value="standard">standard</option></select></label>
      </div>
      <label>activation_request.mrx 内容<textarea id="request" placeholder="可选：粘贴用户导出的 activation_request.mrx JSON"></textarea></label>
      <label>备注<textarea id="remark" placeholder="可选：付款记录、微信昵称、售后备注"></textarea></label>
      <button id="generate">生成激活码</button>
      <p id="status" class="muted"></p>
    </section>
    <section class="panel">
      <h2>生成结果</h2>
      <p id="summary" class="muted">等待生成。</p>
      <pre id="licenseCode"></pre>
      <div class="actions">
        <button class="secondary" id="copyCode">复制激活码</button>
        <button class="secondary" id="downloadFile">下载 license.mrx</button>
        <button class="secondary" id="clear">清空</button>
      </div>
    </section>
    <section class="panel">
      <h2>联系方式</h2>
      <p class="muted">微信：${CONTACT.wechat}<br/>电话：${CONTACT.phone}<br/>邮箱：${CONTACT.email}</p>
    </section>
  </main>
  <script>
    const els = {
      password: document.getElementById("password"),
      machineId: document.getElementById("machineId"),
      days: document.getElementById("days"),
      customer: document.getElementById("customer"),
      edition: document.getElementById("edition"),
      request: document.getElementById("request"),
      remark: document.getElementById("remark"),
      status: document.getElementById("status"),
      summary: document.getElementById("summary"),
      licenseCode: document.getElementById("licenseCode")
    };
    let licenseFileContent = "";
    document.getElementById("generate").addEventListener("click", async () => {
      els.status.textContent = "正在生成...";
      els.status.className = "muted";
      licenseFileContent = "";
      try {
        const apiPath = location.pathname.replace(/\\/$/, "") + "/api/license";
        const response = await fetch(apiPath || "/api/license", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + els.password.value
          },
          body: JSON.stringify({
            machineId: els.machineId.value,
            days: els.days.value,
            customer: els.customer.value,
            edition: els.edition.value,
            request: els.request.value,
            remark: els.remark.value
          })
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) throw new Error(payload.error || "生成失败");
        licenseFileContent = payload.licenseFileContent;
        els.licenseCode.textContent = payload.licenseCode;
        els.summary.textContent = "机器码：" + payload.machineId + "；到期：" + payload.expiresAtText;
        els.status.textContent = "已生成。把激活码发给用户输入，或把 license.mrx 文件发给用户导入。";
        els.status.className = "ok";
      } catch (error) {
        els.status.textContent = error.message || String(error);
        els.status.className = "error";
      }
    });
    document.getElementById("copyCode").addEventListener("click", async () => {
      await navigator.clipboard.writeText(els.licenseCode.textContent || "");
      els.status.textContent = "激活码已复制。";
      els.status.className = "ok";
    });
    document.getElementById("downloadFile").addEventListener("click", () => {
      if (!licenseFileContent) return;
      const blob = new Blob([licenseFileContent], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "license.mrx";
      link.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById("clear").addEventListener("click", () => {
      for (const id of ["machineId", "customer", "request", "remark"]) els[id].value = "";
      els.licenseCode.textContent = "";
      els.summary.textContent = "等待生成。";
      licenseFileContent = "";
    });
  </script>
</body>
</html>`;
}

module.exports = {
  PRODUCT,
  SOFTWARE_NAME,
  canonicalLicensePayload,
  generateLicenseFromInput,
  activationRequestHmac,
  server
};
