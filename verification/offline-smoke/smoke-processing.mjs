import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(projectRoot, "apps", "web", "out");
const inputDir = path.join(__dirname, "\u8f93\u5165 \u6587\u4ef6\u5939");
const evidenceDir = path.join(__dirname, "evidence");
await mkdir(evidenceDir, { recursive: true });

const requireFromWeb = createRequire(path.join(projectRoot, "apps", "web", "package.json"));
const { chromium } = requireFromWeb("@playwright/test");

if (!existsSync(inputDir)) {
  throw new Error(`缺少离线冒烟样本目录：${inputDir}`);
}

const files = readdirSync(inputDir);
const byExt = (ext) => path.join(inputDir, files.find((name) => name.includes("\u6807\u51c6") && name.toLowerCase().endsWith(ext)) || files.find((name) => name.toLowerCase().endsWith(ext)) || "");
const sample = {
  docx: byExt(".docx"),
  xlsx: byExt(".xlsx"),
  wav: byExt(".wav"),
  mp4: byExt(".mp4")
};

for (const [name, filePath] of Object.entries(sample)) {
  if (!filePath || !existsSync(filePath)) {
    throw new Error(`缺少 ${name} 离线处理冒烟样本。`);
  }
}

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
  [".wasm", "application/wasm"]
]);

function resolveStatic(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const candidates = [
    clean === "/" ? path.join(outDir, "index.html") : "",
    path.join(outDir, clean),
    path.join(outDir, clean, "index.html"),
    path.extname(clean) ? "" : path.join(outDir, `${clean}.html`)
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

const server = createServer((req, res) => {
  const filePath = resolveStatic(req.url || "/");
  if (!filePath) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }
  res.writeHead(200, { "content-type": mime.get(path.extname(filePath)) || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
});

const port = 41874;
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const result = {
  url: `http://127.0.0.1:${port}/tools/`,
  samples: sample,
  checks: {},
  externalRequests: [],
  consoleErrors: []
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 980 } });
const page = await context.newPage();

await page.route("**/*", async (route) => {
  const url = route.request().url();
  if (url.startsWith(`http://127.0.0.1:${port}/`) || url.startsWith("blob:") || url.startsWith("data:")) {
    await route.continue();
    return;
  }
  result.externalRequests.push({ url, method: route.request().method(), resourceType: route.request().resourceType() });
  await route.abort();
});
page.on("console", (message) => {
  if (message.type() === "error") result.consoleErrors.push(message.text());
});
page.on("pageerror", (error) => result.consoleErrors.push(error.message));

async function clearAll() {
  await page.getByRole("button", { name: "清空", exact: true }).click().catch(() => undefined);
}

const toolLabels = {
  "word-images": "Word 转图片",
  "excel-images": "Excel 转图片",
  "audio-convert": "音频格式转换",
  "video-convert": "视频格式转换"
};

async function selectMode(mode) {
  const label = toolLabels[mode];
  if (!label) throw new Error(`Unsupported offline smoke tool: ${mode}`);
  await page.locator("button.desktop-a-current-tool").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("link", { name: new RegExp(`^${label}`) }).click();
  await page.locator("button.desktop-a-current-tool").filter({ hasText: label }).waitFor({ timeout: 15000 });
}

async function runMode(mode, filePath, timeoutMs) {
  await clearAll();
  await selectMode(mode);
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  const basename = path.basename(filePath);
  await page.locator(`[title="${basename}"]`).first().waitFor({ timeout: Math.max(15000, timeoutMs) });

  const bodyText = await page.locator("body").textContent().catch(() => "");
  const index = bodyText.indexOf(basename);
  if (index < 0) return "";
  return bodyText.slice(Math.max(0, index - 80), index + 240).replace(/\s+/g, " ").trim();
}

try {
  await page.goto(result.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".desktop-a-shell").waitFor({ timeout: 30000 });
  result.checks.wordBatchRow = await runMode("word-images", sample.docx, 12000);
  result.checks.excelBatchRow = await runMode("excel-images", sample.xlsx, 12000);
  result.checks.audioBatchRow = await runMode("audio-convert", sample.wav, 35000);
  result.checks.videoBatchRow = await runMode("video-convert", sample.mp4, 45000);
  const emptyChecks = Object.entries(result.checks)
    .filter(([, value]) => !String(value || "").trim())
    .map(([key]) => key);
  if (emptyChecks.length > 0) {
    result.error = `Smoke result rows were not detected: ${emptyChecks.join(", ")}`;
  }
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
} finally {
  await writeFile(path.join(evidenceDir, "smoke-processing-result.json"), JSON.stringify(result, null, 2), "utf8");
  await browser.close();
  server.close();
}

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
}
console.log(JSON.stringify(result, null, 2));
