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

const files = readdirSync(inputDir);
const imageFiles = files.filter((name) => /\.(png|jpe?g|webp)$/i.test(name) && !name.includes("损坏")).map((name) => path.join(inputDir, name));
const damagedImage = path.join(inputDir, files.find((name) => name.includes("损坏")) || "");

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
  await page.locator("aside button").nth(4).click();
  await page.locator("select").first().selectOption("compress");
}

try {
  await openBatchWorkbench();
  await page.locator('input[type="file"]').first().setInputFiles(imageFiles);
  await page.locator("button.btn-primary").first().click();
  await page.waitForFunction(() => document.body.innerText.includes("成功") || document.body.innerText.includes("失败"), undefined, { timeout: 30000 }).catch(() => undefined);
  await page.waitForTimeout(3000);
  result.checks.imageBatchText = await page.locator("body").textContent();
  result.checks.imageBatchExternalRequestCount = result.externalRequests.length;
  result.checks.imageBatchRemoteWorkerBlocked = result.externalRequests.some((entry) => /cdn\.jsdelivr|unpkg|jsdelivr/i.test(entry.url));
  result.checks.imageBatchLocalWorkerRequestCount = result.localWorkerRequests.length;

  await page.getByRole("button", { name: "清空全部" }).click().catch(() => undefined);
  await page.locator('input[type="file"]').first().setInputFiles(damagedImage);
  await page.locator("button.btn-primary").first().click();
  await page.waitForTimeout(8000);
  result.checks.retryButtonCount = await page.locator('[data-testid="retry-task-button"]').count();
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
