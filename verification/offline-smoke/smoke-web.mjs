import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(projectRoot, "apps", "web", "out");
const inputDir = path.join(__dirname, "输入 文件夹");
const evidenceDir = path.join(__dirname, "evidence");
const requireFromWeb = createRequire(path.join(projectRoot, "apps", "web", "package.json"));
const { chromium } = requireFromWeb("@playwright/test");
await mkdir(evidenceDir, { recursive: true });

const sample = {
  imageA: path.join(inputDir, "图片 一.jpg"),
  imageB: path.join(inputDir, "图片 二.png"),
  damagedImage: path.join(inputDir, "损坏 图片.jpg"),
  docx: path.join(inputDir, "测试 文档.docx"),
  xlsx: path.join(inputDir, "测试 表格.xlsx"),
  wav: path.join(inputDir, "测试 音频.wav"),
  mp4: path.join(inputDir, "测试 视频.mp4")
};

for (const [name, filePath] of Object.entries(sample)) {
  if (!existsSync(filePath)) {
    throw new Error(`缺少 ${name} 离线 Web 冒烟样本：${filePath}`);
  }
}

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
  [".woff2", "font/woff2"]
]);

function resolveStatic(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const candidates = [];
  if (clean === "/" || clean === "") candidates.push(path.join(outDir, "index.html"));
  candidates.push(path.join(outDir, clean));
  candidates.push(path.join(outDir, clean, "index.html"));
  if (!path.extname(clean)) candidates.push(path.join(outDir, `${clean}.html`));
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

const port = 41873;
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const result = {
  url: `http://127.0.0.1:${port}/tools/`,
  checks: {},
  requests: [],
  externalRequests: [],
  consoleErrors: [],
  downloads: [],
  screenshots: []
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1440, height: 980 }
});
const page = await context.newPage();

await page.route("**/*", async (route) => {
  const url = route.request().url();
  result.requests.push({ url, method: route.request().method(), resourceType: route.request().resourceType() });
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

async function screenshot(name) {
  const target = path.join(evidenceDir, name);
  await page.screenshot({ path: target, fullPage: true });
  result.screenshots.push(target);
}

async function bodyText() {
  return (await page.locator("body").textContent().catch(() => "")) || "";
}

async function clearAll() {
  await page.getByRole("button", { name: /清空(任务|全部)/ }).click().catch(() => undefined);
}

async function selectTool(mode) {
  await page.locator(".desktop-function-select select, select").first().selectOption(mode);
}

async function waitForFileTitle(filePath) {
  await page.locator(`[title="${path.basename(filePath)}"]`).first().waitFor({ timeout: 15000 });
}

async function queueOne(mode, filePath) {
  await clearAll();
  await selectTool(mode);
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await waitForFileTitle(filePath);
}

try {
  await page.goto(result.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".desktop-replica").waitFor({ timeout: 30000 });
  result.checks.desktopWorkbenchVisible = true;
  result.checks.privacyTextVisible = /本地运行，保护隐私安全|本地处理/.test(await bodyText());
  result.checks.startDisabledWhenEmpty = await page.getByRole("button", { name: /开始(转换|处理)/ }).first().isDisabled();
  await screenshot("desktop-workbench-1440.png");

  await selectTool("compress");
  await page.locator('input[type="file"]').first().setInputFiles([
    sample.imageA,
    sample.imageB
  ]);
  await waitForFileTitle(sample.imageA);
  await waitForFileTitle(sample.imageB);
  const imageText = await bodyText();
  result.checks.multiImageFilesAdded = imageText.includes("已添加 2 个文件");
  result.checks.independentQueuedStateVisible = imageText.includes("等待中");
  result.checks.startEnabledWithFiles = !(await page.getByRole("button", { name: /开始(转换|处理)/ }).first().isDisabled());
  await page.getByRole("button", { name: /开始(转换|处理)/ }).first().click();
  await page.waitForFunction(() => document.body.innerText.includes("输出目录尚未就绪"), undefined, { timeout: 10000 }).catch(() => {});
  result.checks.outputDirectoryGuardVisible = (await bodyText()).includes("输出目录尚未就绪");
  await screenshot("image-batch-queued.png");

  await queueOne("compress", sample.damagedImage);
  result.checks.damagedImageQueued = await page.locator(`[title="${path.basename(sample.damagedImage)}"]`).first().isVisible().catch(() => false);

  await queueOne("word-images", sample.docx);
  result.checks.wordFileQueued = await page.locator(`[title="${path.basename(sample.docx)}"]`).first().isVisible().catch(() => false);

  await queueOne("excel-images", sample.xlsx);
  result.checks.excelFileQueued = await page.locator(`[title="${path.basename(sample.xlsx)}"]`).first().isVisible().catch(() => false);

  await queueOne("audio-convert", sample.wav);
  result.checks.audioFileQueued = await page.locator(`[title="${path.basename(sample.wav)}"]`).first().isVisible().catch(() => false);

  await queueOne("video-convert", sample.mp4);
  result.checks.videoFileQueued = await page.locator(`[title="${path.basename(sample.mp4)}"]`).first().isVisible().catch(() => false);

  const failedChecks = Object.entries(result.checks)
    .filter(([, value]) => value !== true)
    .map(([key]) => key);
  if (failedChecks.length > 0) {
    result.error = `Smoke checks failed: ${failedChecks.join(", ")}`;
  }
  if (result.externalRequests.length > 0) {
    result.error = `${result.error ? `${result.error}; ` : ""}Unexpected external requests: ${result.externalRequests.map((entry) => entry.url).join(", ")}`;
  }
  if (result.consoleErrors.length > 0) {
    result.error = `${result.error ? `${result.error}; ` : ""}Console errors: ${result.consoleErrors.join(" | ")}`;
  }
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
} finally {
  await writeFile(path.join(evidenceDir, "smoke-web-result.json"), JSON.stringify(result, null, 2), "utf8");
  await browser.close();
  server.close();
}

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
}
console.log(JSON.stringify(result, null, 2));
