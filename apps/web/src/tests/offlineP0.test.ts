import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");

describe("offline P0 release checks", () => {
  it("keeps the default desktop package path on NSIS and leaves MSI explicit", () => {
    const rootPackage = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));
    const desktopPackage = JSON.parse(readFileSync(resolve(projectRoot, "apps", "desktop", "package.json"), "utf8"));

    expect(desktopPackage.scripts.build).toBe("tauri build --bundles nsis");
    expect(desktopPackage.scripts["build:all"]).toBe("tauri build");
    expect(desktopPackage.scripts["package:msi"]).toBe("tauri build --bundles msi");
    expect(rootPackage.scripts["package:desktop"]).toContain("--filter desktop package");
    expect(rootPackage.scripts["package:desktop:msi"]).toContain("--filter desktop package:msi");
    expect(rootPackage.scripts["package:desktop:all"]).toContain("--filter desktop build:all");
  });

  it("keeps Tauri Chinese metadata valid UTF-8", () => {
    const tauriConfigPath = resolve(projectRoot, "apps", "desktop", "src-tauri", "tauri.conf.json");
    const config = JSON.parse(readFileSync(tauriConfigPath, "utf8"));
    const bundle = config.tauri.bundle;
    const windowConfig = config.tauri.windows[0];
    const fields = [
      config.package.productName,
      bundle.publisher,
      bundle.copyright,
      bundle.shortDescription,
      bundle.longDescription,
      windowConfig.title
    ].join("\n");

    expect(config.package.productName).toBe("万能格式转换器");
    expect(bundle.publisher).toBe("MR.谢");
    expect(windowConfig.title).toBe("万能格式转换器");
    expect(fields).toContain("本地处理");
    expect(fields).toContain("不上传服务器");
    expect(fields).not.toMatch(/[锟絔|娑搢鐠媩閻▅濮潀閸瑜?]/);
  });

  it("uses a local browser-image-compression worker asset", () => {
    const imageCorePath = resolve(projectRoot, "packages", "image-core", "src", "image.ts");
    const imageCoreSource = readFileSync(imageCorePath, "utf8");
    const localWorkerPath = "/vendor/browser-image-compression/browser-image-compression.js";

    expect(imageCoreSource).toContain("libURL");
    expect(imageCoreSource).toContain(localWorkerPath);
    expect(imageCoreSource).not.toContain("cdn.jsdelivr.net");
    expect(imageCoreSource).not.toContain("unpkg.com");

    const workerAssetPath = resolve(projectRoot, "apps", "web", "public", "vendor", "browser-image-compression", "browser-image-compression.js");
    expect(existsSync(workerAssetPath)).toBe(true);
    expect(readFileSync(workerAssetPath, "utf8")).toContain("browser-image-compression");
  });

  it("keeps release downloads on same-origin EdgeOne chunks without raw installers", () => {
    const downloadsConfigPath = resolve(projectRoot, "apps", "web", "src", "config", "downloads.ts");
    const downloadsConfigSource = readFileSync(downloadsConfigPath, "utf8");
    const downloadPageSource = readFileSync(resolve(projectRoot, "apps", "web", "src", "app", "download", "page.tsx"), "utf8");
    const downloadButtonSource = readFileSync(resolve(projectRoot, "apps", "web", "src", "components", "download", "InstallerDownloadButton.tsx"), "utf8");
    const edgeOneBuildSource = readFileSync(resolve(projectRoot, "apps", "web", "scripts", "build-edgeone.mjs"), "utf8");
    const versionSource = readFileSync(resolve(projectRoot, "apps", "web", "src", "config", "version.ts"), "utf8");
    const publicInstallerDir = resolve(projectRoot, "apps", "web", "public", "release", "v2.0.0", "installers");
    const outInstallerDir = resolve(projectRoot, "apps", "web", "out", "release", "v2.0.0", "installers");
    const releaseSumsPath = resolve(projectRoot, "release", "v2.0.0", "installers", "SHA256SUMS.txt");

    expect(downloadsConfigSource).toContain("/release/v2.0.0/edgeone/manifest.json");
    expect(downloadsConfigSource).not.toContain("github.com");
    expect(downloadsConfigSource).not.toContain('"/release/v2.0.0/installers"');
    expect(downloadPageSource).toContain("InstallerDownloadButton");
    expect(downloadPageSource).not.toContain("item.downloadUrl");
    expect(downloadButtonSource).toContain("showSaveFilePicker");
    expect(downloadButtonSource).toContain("getFile()");
    expect(downloadButtonSource).toContain("fetchVerifiedPart");
    expect(downloadButtonSource).toContain("DOWNLOAD_CONCURRENCY = 6");
    expect(downloadButtonSource).toContain("Promise.all(batch.map");
    expect(downloadButtonSource).toContain("下载后的安装包完整性校验失败");
    expect(downloadButtonSource).toContain('crypto.subtle.digest("SHA-256"');
    expect(edgeOneBuildSource).toContain("installerPartSize");
    expect(edgeOneBuildSource).toContain("usesCurrentInstallerPartLayout");
    expect(edgeOneBuildSource).toContain("writeInstallerParts");
    expect(edgeOneBuildSource).toContain("part-");
    expect(downloadsConfigSource).toContain('version: "2.0.0"');
    expect(versionSource).toContain('currentReleaseVersion = "2.0.0"');
    const releaseSums = readFileSync(releaseSumsPath, "utf8");
    const releaseHashes = releaseSums.match(/\b[A-F0-9]{64}\b/g) || [];
    expect(releaseHashes).toHaveLength(2);
    for (const hash of releaseHashes) {
      expect(downloadsConfigSource).toContain(hash);
    }
    expect(downloadsConfigSource).not.toContain("6561983E608F");
    expect(downloadsConfigSource).not.toContain("80EEFAC831A6");

    for (const dir of [publicInstallerDir, outInstallerDir]) {
      if (!existsSync(dir)) continue;
      const binaryInstallers = readdirSync(dir).filter((name) => /\.(exe|msi)$/i.test(name));
      expect(binaryInstallers).toEqual([]);
    }
  });

  it("keeps installer self-hashes out of the embedded notices bundle", () => {
    const generatedNoticesPath = resolve(projectRoot, "apps", "web", "src", "generated", "thirdPartyNotices.ts");
    const generatedNotices = readFileSync(generatedNoticesPath, "utf8");

    expect(generatedNotices).not.toContain("Windows NSIS 安装包");
    expect(generatedNotices).not.toContain("Windows MSI 安装包");
    expect(generatedNotices).not.toContain("release/v2.0.0/installers/");
  });

  it("keeps installer download material out of desktop build output", () => {
    const buildScriptPath = resolve(projectRoot, "apps", "web", "scripts", "build-desktop.mjs");
    const buildScript = readFileSync(buildScriptPath, "utf8");
    const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const toolsClient = readFileSync(toolsClientPath, "utf8");

    expect(buildScript).toContain('rm(path.join(outDir, "download")');
    expect(buildScript).toContain('rm(path.join(outDir, "release")');
    expect(buildScript).toContain("Desktop output contains installer self-hashes");
    expect(toolsClient).toContain('import { currentReleaseVersion } from "@/config/version"');
    expect(toolsClient).not.toContain('from "@/config/downloads"');
  });

  it("keeps desktop task clearing and file picker constraints", () => {
    const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const source = readFileSync(toolsClientPath, "utf8");
    const actionBarBlock = source.slice(
      source.indexOf('className="desktop-a-title-actions"'),
      source.indexOf('<div className="desktop-a-output">')
    );
    const pickerBlock = source.slice(
      source.indexOf('ref={inputRef}'),
      source.indexOf('<header className="desktop-a-titlebar">')
    );

    expect(source).toContain("function clearAllLocalTasks");
    expect(actionBarBlock).toContain("添加文件");
    expect(actionBarBlock).toContain("添加文件夹");
    expect(actionBarBlock).toContain("清空");
    expect(actionBarBlock.indexOf("添加文件")).toBeLessThan(actionBarBlock.indexOf("清空"));
    expect(pickerBlock).toContain("multiple");
    expect(pickerBlock).toContain("folderInputRef");
    expect(pickerBlock).toContain("webkitdirectory");
  });

  it("keeps generated desktop media results previewable", () => {
    const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const source = readFileSync(toolsClientPath, "utf8");
    const finishTaskBlock = source.slice(
      source.indexOf("function finishTask"),
      source.indexOf("async function runCrop")
    );
    const runBatchBlock = source.slice(
      source.indexOf("async function runBatch"),
      source.indexOf("async function processBatchTask")
    );
    const desktopPreviewBlock = source.slice(
      source.indexOf("function DesktopInspectorPreview"),
      source.indexOf("function DesktopTiledPreview")
    );

    expect(source).toContain("type ResultPreviewState");
    expect(source).toContain("function getLocalFilePreviewUrl");
    expect(source).toContain("convertFileSrc(pathValue)");
    expect(source).toContain("function getResultPreviewKind");
    expect(finishTaskBlock).toContain("setResultPreviewFromBlob(blob, name)");
    expect(runBatchBlock).toContain("if (tasks.length === 1)");
    expect(runBatchBlock).toContain("setResultPreviewFromBlob(result.blob, resultName)");
    expect(runBatchBlock).toContain("setResultPreviewFromOutputPath(outputPath, resultName)");
    expect(desktopPreviewBlock).toContain("resultPreview");
    expect(desktopPreviewBlock).toContain("src={resultPreview.url}");
  });

  it("keeps every imported desktop file in one scrollable preview grid", () => {
    const toolsClient = readFileSync(resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx"), "utf8");
    const globals = readFileSync(resolve(projectRoot, "apps", "web", "src", "app", "globals.css"), "utf8");
    const tiledPreview = toolsClient.slice(
      toolsClient.indexOf("function DesktopTiledPreview"),
      toolsClient.indexOf("function DesktopPreviewPanel")
    );

    expect(tiledPreview).toContain("previews.map");
    expect(tiledPreview).not.toContain(".slice(");
    expect(globals).toContain("grid-template-columns: repeat(3, minmax(0, 1fr)) !important");
    expect(globals).toMatch(/\.desktop-tile-preview-grid[\s\S]*?overflow:\s*auto/);
  });

  it("keeps the reviewed desktop UI copy and crop preview constraints", () => {
    const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const globalsPath = resolve(projectRoot, "apps", "web", "src", "app", "globals.css");
    const homePagePath = resolve(projectRoot, "apps", "web", "src", "app", "page.tsx");
    const source = readFileSync(toolsClientPath, "utf8");
    const globals = readFileSync(globalsPath, "utf8");
    const homeSource = readFileSync(homePagePath, "utf8");
    const desktopBranchStart = source.indexOf('className="desktop-a-shell"');
    const desktopBranch = source.slice(desktopBranchStart, source.indexOf('className="a2-online-tools"', desktopBranchStart));

    expect(source).not.toContain("启动本地编译");
    expect(source).not.toContain("当前文件预览");
    expect(source).not.toContain("预览区");
    expect(source).not.toContain("选择文件即预览");
    expect(source).not.toContain("首页预览");
    expect(source).not.toContain("第一页预览");
    expect(source).not.toContain("本地任务");
    expect(source).not.toContain("DesktopBatchTaskRow");
    expect(source).not.toContain("DesktopEmptyQueue");
    expect(source).toContain("desktop-a-task-canvas");
    expect(source).toContain("desktop-a-preview-area");
    expect(source).toContain("desktop-file-pick-cta");
    expect(source).toContain("desktop-preview-file-name");
    expect(source).toContain("DesktopTiledPreview");
    expect(source).toContain('aria-label="多文件缩略图预览"');
    expect(source).toContain("renderPdfPageToBlob(task.file, 1");
    expect(desktopBranch).toContain("folderInputRef");
    expect(desktopBranch).toContain("webkitdirectory");
    expect(desktopBranch).toContain("importFolder()");
    expect(desktopBranch).not.toContain("onDragOver");
    expect(desktopBranch).not.toContain("onDrop");
    expect(desktopBranch).toMatch(/ref=\{inputRef\}[\s\S]*?multiple[\s\S]*?onChange/);
    expect(globals).toContain("--desktop-page: #f3f5f7");
    expect(globals).toContain("color-scheme: light");
    expect(globals).toContain(".desktop-tile-preview-grid");
    expect(globals).toContain(".desktop-file-pick-cta");
    expect(globals).toContain(".desktop-a-statusbar");
    expect(globals).toContain("grid-template-columns: 184px minmax(0, 1fr) 286px");
    expect(globals).toContain(".desktop-preview-file-name");
    expect(globals).not.toContain(".desktop-compact-table-shell");
    expect(globals).not.toContain(".desktop-file-stage-header");
    const footerBlock = source.slice(
      source.indexOf('<footer className="desktop-a-statusbar"'),
      source.indexOf("</footer>", source.indexOf('<footer className="desktop-a-statusbar"'))
    );
    expect(footerBlock).toContain("总进度");
    expect(footerBlock).toContain("成功");
    expect(footerBlock).toContain("失败");
    expect(footerBlock).toContain("等待");
    expect(footerBlock).toContain("打开输出目录");
    expect(footerBlock).not.toContain("更新日志");
    expect(footerBlock).not.toContain("使用教程");
    expect(source).toContain("viewMode: 2");
    expect(source).toContain("autoCropArea: 1");
    expect(source).toContain("desktop-preview-body-shell");
    expect(homeSource).not.toContain("进入工具台");
  });
});
