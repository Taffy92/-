import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(projectRoot, "apps", "web", "out");
const inputDir = path.join(__dirname, "输入 文件夹");
const evidenceDir = path.join(__dirname, "evidence");
await mkdir(evidenceDir, { recursive: true });

const requireFromWeb = createRequire(path.join(projectRoot, "apps", "web", "package.json"));
const { chromium } = requireFromWeb("@playwright/test");

if (!existsSync(inputDir)) {
  throw new Error(`缺少离线冒烟样本目录：${inputDir}`);
}

const files = readdirSync(inputDir);
const imageFiles = files.filter((name) => /\.(png|jpe?g|webp)$/i.test(name) && !name.includes("损坏")).map((name) => path.join(inputDir, name));
const damagedImage = path.join(inputDir, files.find((name) => name.includes("损坏")) || "");

if (!imageFiles.length || !existsSync(damagedImage)) {
  throw new Error("离线 P0 冒烟需要至少一个正常图片样本和一个名称包含“损坏”的图片样本。");
}

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
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

const port = 41875;
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const result = {
  url: `http://127.0.0.1:${port}/tools/`,
  checks: {},
  localWorkerRequests: [],
  externalRequests: [],
  consoleErrors: []
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 980 } });
const page = await context.newPage();

await page.route("**/*", async (route) => {
  const url = route.request().url();
  if (url.includes("/vendor/browser-image-compression/browser-image-compression.js")) {
    result.localWorkerRequests.push(url);
  }
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

async function openBatchWorkbench() {
  await page.goto(result.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".desktop-a-shell").waitFor({ timeout: 30000 });
  await page.locator("button.desktop-a-current-tool").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("link", { name: /^图片压缩/ }).click();
  await page.locator("button.desktop-a-current-tool").filter({ hasText: "图片压缩" }).waitFor({ timeout: 15000 });
}

try {
  await openBatchWorkbench();
  await page.locator('input[type="file"]').first().setInputFiles(imageFiles);
  await page.locator(`[title="${path.basename(imageFiles[0])}"]`).first().waitFor({ timeout: 15000 });
  result.checks.imageBatchStartEnabled = !(await page.getByRole("button", { name: /开始(转换|处理)/ }).first().isDisabled());
  await page.getByRole("button", { name: /开始(转换|处理)/ }).first().click();
  await page.waitForTimeout(500);
  result.checks.imageBatchText = await page.locator("body").textContent();
  result.checks.imageBatchExternalRequestCount = result.externalRequests.length;
  result.checks.imageBatchRemoteWorkerBlocked = result.externalRequests.some((entry) => /cdn\.jsdelivr|unpkg|jsdelivr/i.test(entry.url));
  result.checks.imageBatchLocalWorkerRequestCount = result.localWorkerRequests.length;
  result.checks.outputDirectoryVisible = String(result.checks.imageBatchText || "").includes("输出目录");

  await page.getByRole("button", { name: "清空", exact: true }).click().catch(() => undefined);
  await page.locator('input[type="file"]').first().setInputFiles(damagedImage);
  await page.locator(`[title="${path.basename(damagedImage)}"]`).first().waitFor({ timeout: 15000 });
  result.checks.damagedImageQueued = true;
  result.checks.retryButtonCount = await page.locator('[data-testid="retry-task-button"], [title="重试"]').count();
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
} finally {
  await writeFile(path.join(evidenceDir, "offline-p0-smoke-result.json"), JSON.stringify(result, null, 2), "utf8");
  await browser.close();
  server.close();
}

if (result.error || result.checks.imageBatchRemoteWorkerBlocked || result.externalRequests.some((entry) => /cdn\.jsdelivr|unpkg|jsdelivr/i.test(entry.url))) {
  console.error(result.error || "Remote image compression worker request detected.");
  process.exitCode = 1;
}
