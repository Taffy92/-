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
  mp4: process.env.SMOKE_VIDEO
    ? path.resolve(process.env.SMOKE_VIDEO)
    : path.join(inputDir, files.find((name) => name.toLowerCase().endsWith(".mp4")) || "")
};

const videoFormats = (process.env.SMOKE_VIDEO_FORMATS || "mp4,mov,avi,mkv,webm")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

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

const port = Number(process.env.SMOKE_PORT || 41875);
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

async function runSingleMode(toolId, filePath, timeoutMs, outputFormat, allowExpectedFailure = false) {
  await page.goto(`${result.url}?tool=${toolId}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  if (outputFormat) {
    await page.getByLabel("输出格式").selectOption(outputFormat);
  }
  const startButton = page.getByRole("button", { name: "开始转换", exact: true });
  await startButton.waitFor({ state: "visible", timeout: 15_000 });
  if (await startButton.isDisabled()) throw new Error("开始转换按钮在文件就绪后仍处于禁用状态。");
  await startButton.click();
  const success = page.getByText("转换完成", { exact: true });
  const failure = page.getByText("处理失败", { exact: true });
  const outcome = await Promise.race([
    success.waitFor({ timeout: timeoutMs }).then(() => "success"),
    failure.waitFor({ timeout: timeoutMs }).then(() => "failure")
  ]);
  if (outcome === "failure") {
    const bodyText = await captureBodyText();
    if (allowExpectedFailure && /过小的视频分辨率/.test(bodyText)) return "expected-failure: input resolution guard";
    throw new Error(bodyText.slice(0, 400));
  }
  return true;
}

async function captureBodyText() {
  return page.locator("body").textContent().catch(() => "");
}

try {
  result.checks.audioConvert = await runSingleMode("audio-convert", sample.wav, 120_000);
  result.checks.videoConvert = {};
  for (const format of videoFormats) {
    try {
      result.checks.videoConvert[format] = await runSingleMode("video-convert", sample.mp4, 180_000, format, format === "webm");
    } catch (error) {
      result.checks.videoConvert[format] = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        bodyText: await captureBodyText()
      };
    }
  }
  try {
    result.checks.videoExtractAudio = await runSingleMode("video-audio", sample.mp4, 180_000);
  } catch (error) {
    const bodyText = await captureBodyText();
    if (!bodyText.includes("该视频没有可提取的音频轨道")) throw error;
    result.checks.videoExtractAudio = "expected-no-audio";
  }
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
  result.bodyText = await captureBodyText();
} finally {
  await browser.close();
  server.close();
}

console.log(JSON.stringify(result, null, 2));
if (result.error) process.exitCode = 1;
