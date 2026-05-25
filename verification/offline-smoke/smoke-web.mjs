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

try {
  await page.goto(result.url, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByRole("heading", { name: "专业工作台" }).waitFor({ timeout: 30000 });
  result.checks.desktopWorkbenchVisible = true;
  result.checks.privacyTextVisible = await page.getByText("文件仅在本机处理，不上传服务器").first().isVisible().catch(() => false);
  result.checks.startDisabledWhenEmpty = await page.getByRole("button", { name: /开始处理/ }).first().isDisabled();
  await screenshot("desktop-workbench-1440.png");

  await page.getByRole("button", { name: "批量任务" }).click();
  await page.locator('input[type="file"]').first().setInputFiles([
    path.join(inputDir, "图片 一.jpg"),
    path.join(inputDir, "图片 二.png")
  ]);
  await page.locator('[title="图片 一.jpg"]').waitFor({ timeout: 15000 });
  result.checks.multiImageFilesAdded = await page.getByText("已添加 2 个文件").isVisible().catch(() => false);
  result.checks.independentQueuedStateVisible = await page.getByText("等待中").first().isVisible().catch(() => false);

  const downloadPromise = page.waitForEvent("download", { timeout: 90000 }).catch(() => null);
  await page.getByRole("button", { name: /开始处理/ }).first().click();
  await page.getByText("已完成批量任务", { exact: false }).waitFor({ timeout: 90000 }).catch(() => {});
  const download = await downloadPromise;
  if (download) {
    const suggested = download.suggestedFilename();
    const saveAs = path.join(evidenceDir, suggested);
    await download.saveAs(saveAs);
    result.downloads.push(saveAs);
  }
  result.checks.imageBatchSuccessVisible = await page.getByText("成功", { exact: true }).first().isVisible().catch(() => false);
  result.checks.copyOutputPathButtonVisible = await page.getByTitle("复制输出路径").first().isVisible().catch(() => false);
  await screenshot("image-batch-after-run.png");

  await page.getByRole("button", { name: "清空全部" }).click();
  await page.getByRole("combobox", { name: "批量类型" }).selectOption("compress");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(inputDir, "损坏 图片.jpg"));
  await page.locator('[title="损坏 图片.jpg"]').waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /开始处理/ }).first().click();
  await page.getByText("失败").waitFor({ timeout: 45000 }).catch(() => {});
  result.checks.failedReasonVisible = await page.getByText("处理失败", { exact: false }).first().isVisible().catch(() => false);
  result.checks.retryButtonVisible = await page.getByTitle("重试").first().isVisible().catch(() => false);

  await page.getByTitle("重试").first().click().catch(() => {});
  result.checks.retryClicked = true;
  await page.getByRole("button", { name: "清空全部" }).click();

  await page.locator('input[type="file"]').first().setInputFiles(path.join(inputDir, "图片 一.jpg"));
  await page.getByTitle("取消").first().click();
  result.checks.cancelledStateVisible = await page.getByText("已取消").first().isVisible().catch(() => false);
  await page.getByRole("button", { name: "清空全部" }).click();

  const folderInput = page.locator('input[webkitdirectory]').first();
  await folderInput.setInputFiles(inputDir);
  await page.waitForTimeout(1500);
  result.checks.folderImportSummaryText = await page.getByText("最近导入", { exact: false }).first().textContent().catch(() => "");
  result.checks.folderImportVisible = Boolean(result.checks.folderImportSummaryText);
  await screenshot("folder-import.png");

  await page.getByRole("combobox", { name: "批量类型" }).selectOption("word-images");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(inputDir, "测试 文档.docx"));
  result.checks.wordFileQueued = await page.locator('[title="测试 文档.docx"]').isVisible().catch(() => false);

  await page.getByRole("button", { name: "清空全部" }).click();
  await page.getByRole("combobox", { name: "批量类型" }).selectOption("excel-images");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(inputDir, "测试 表格.xlsx"));
  result.checks.excelFileQueued = await page.locator('[title="测试 表格.xlsx"]').isVisible().catch(() => false);

  await page.getByRole("button", { name: "清空全部" }).click();
  await page.getByRole("combobox", { name: "批量类型" }).selectOption("audio-convert");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(inputDir, "测试 音频.wav"));
  result.checks.audioFileQueued = await page.locator('[title="测试 音频.wav"]').isVisible().catch(() => false);

  await page.getByRole("button", { name: "清空全部" }).click();
  await page.getByRole("combobox", { name: "批量类型" }).selectOption("video-convert");
  await page.locator('input[type="file"]').first().setInputFiles(path.join(inputDir, "测试 视频.mp4"));
  result.checks.videoFileQueued = await page.locator('[title="测试 视频.mp4"]').isVisible().catch(() => false);

  await page.getByRole("button", { name: "导出处理日志" }).click();
  await page.waitForTimeout(500);
  result.checks.exportLogClicked = true;
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
