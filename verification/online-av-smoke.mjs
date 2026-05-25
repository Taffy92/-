import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const webRoot = path.join(projectRoot, "apps", "web");
const outDir = path.join(webRoot, "out");
const inputDir = path.join(__dirname, "offline-smoke", "输入 文件夹");
const requireFromWeb = createRequire(path.join(webRoot, "package.json"));
const { chromium } = requireFromWeb("@playwright/test");

const files = readdirSync(inputDir);
const sample = {
  wav: path.join(inputDir, files.find((name) => name.toLowerCase().endsWith(".wav")) || ""),
  mp4: path.join(inputDir, files.find((name) => name.toLowerCase().endsWith(".mp4")) || "")
};

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
  [".wasm", "application/wasm"]
]);

function resolveStatic(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const parts = clean.split("/").filter(Boolean);
  const candidates = [
    clean === "/" ? path.join(outDir, "index.html") : "",
    path.join(outDir, ...parts),
    path.join(outDir, ...parts, "index.html"),
    path.extname(clean) ? "" : path.join(outDir, `${parts.join("/")}.html`)
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
  externalRequests: [],
  consoleErrors: []
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 920 } });
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

async function runSingleMode(label, filePath, timeoutMs) {
  await page.locator("button").filter({ hasText: label }).first().click();
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.locator("button.btn-primary").first().click();
  await page.getByText("已生成").waitFor({ timeout: timeoutMs });
  return true;
}

try {
  await page.goto(result.url, { waitUntil: "networkidle", timeout: 60000 });
  result.checks.audioConvert = await runSingleMode("音频格式转换", sample.wav, 45000);
  result.checks.videoConvert = await runSingleMode("视频格式转换", sample.mp4, 60000);
  result.checks.videoExtractAudio = await runSingleMode("视频提取音频", sample.mp4, 60000);
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
} finally {
  await browser.close();
  server.close();
}

console.log(JSON.stringify(result, null, 2));
if (result.error) process.exitCode = 1;
