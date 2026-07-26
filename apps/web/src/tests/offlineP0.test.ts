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
    const publicInstallerDir = resolve(projectRoot, "apps", "web", "public", "release", "v1.0.0", "installers");
    const outInstallerDir = resolve(projectRoot, "apps", "web", "out", "release", "v1.0.0", "installers");
    const releaseSumsPath = resolve(projectRoot, "release", "v1.0.0", "installers", "SHA256SUMS.txt");
    const publicSumsPath = resolve(publicInstallerDir, "SHA256SUMS.txt");

    expect(downloadsConfigSource).toContain("/release/v1.0.0/edgeone/manifest.json");
    expect(downloadsConfigSource).not.toContain("github.com");
    expect(downloadsConfigSource).not.toContain('"/release/v1.0.0/installers"');
    expect(downloadPageSource).toContain("InstallerDownloadButton");
    expect(downloadPageSource).not.toContain("item.downloadUrl");
    expect(downloadButtonSource).toContain("showSaveFilePicker");
    expect(downloadButtonSource).toContain("fetchVerifiedPart");
    expect(downloadButtonSource).toContain('crypto.subtle.digest("SHA-256"');
    expect(edgeOneBuildSource).toContain("installerPartSize");
    expect(edgeOneBuildSource).toContain("writeInstallerParts");
    expect(edgeOneBuildSource).toContain("part-");
    expect(downloadsConfigSource).toContain('version: "1.0.0"');
    expect(versionSource).toContain('currentReleaseVersion = "1.0.0"');
    const releaseSums = readFileSync(releaseSumsPath, "utf8");
    const releaseHashes = releaseSums.match(/\b[A-F0-9]{64}\b/g) || [];
    expect(releaseHashes).toHaveLength(2);
    for (const hash of releaseHashes) {
      expect(downloadsConfigSource).toContain(hash);
    }
    expect(downloadsConfigSource).not.toContain("6561983E608F");
    expect(downloadsConfigSource).not.toContain("80EEFAC831A6");

    expect(readFileSync(publicSumsPath, "utf8")).toBe(releaseSums);
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
    expect(generatedNotices).not.toContain("release/v1.0.0/installers/");
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
      source.indexOf('className="desktop-compact-actions"'),
      source.indexOf('<section className="desktop-file-workspace"')
    );

    expect(source).toContain("function clearAllLocalTasks");
    expect(source).toContain("if (isDesktopSurface && tabId !== activeTab) clearAllLocalTasks");
    expect(actionBarBlock).toContain("清空任务");
    expect(actionBarBlock.indexOf("清空任务")).toBeLessThan(actionBarBlock.indexOf("输出目录"));
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

  it("keeps the reviewed desktop UI copy and crop preview constraints", () => {
    const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const globalsPath = resolve(projectRoot, "apps", "web", "src", "app", "globals.css");
    const homePagePath = resolve(projectRoot, "apps", "web", "src", "app", "page.tsx");
    const source = readFileSync(toolsClientPath, "utf8");
    const globals = readFileSync(globalsPath, "utf8");
    const homeSource = readFileSync(homePagePath, "utf8");
    const actionBarBlock = source.slice(
      source.indexOf('className="desktop-compact-actions"'),
      source.indexOf('<section className="desktop-file-workspace"')
    );
    const desktopBranchStart = source.indexOf('className="desktop-replica desktop-compact-frame"');
    const desktopBranch = source.slice(desktopBranchStart, source.indexOf('className="office-workbench apple-workbench-page"', desktopBranchStart));

    expect(source).not.toContain("启动本地编译");
    expect(source).not.toContain("当前文件预览");
    expect(source).not.toContain("预览区");
    expect(source).not.toContain("选择文件即预览");
    expect(source).not.toContain("首页预览");
    expect(source).not.toContain("第一页预览");
    expect(source).not.toContain("本地任务");
    expect(source).not.toContain("DesktopBatchTaskRow");
    expect(source).not.toContain("DesktopEmptyQueue");
    expect(source).toContain("desktop-file-workspace");
    expect(source).toContain("desktop-file-stage-preview");
    expect(source).toContain("desktop-file-pick-cta");
    expect(source).toContain("desktop-preview-file-name");
    expect(source).toContain("DesktopTiledPreview");
    expect(source).toContain('aria-label="多文件缩略图预览"');
    expect(source).toContain("renderPdfPageToBlob(task.file, 1");
    expect(actionBarBlock).not.toContain("inputRef.current?.click()");
    expect(actionBarBlock).not.toContain("importFolder()");
    expect(desktopBranch).not.toContain("folderInputRef");
    expect(desktopBranch).not.toContain("webkitdirectory");
    expect(desktopBranch).not.toContain("onDragOver");
    expect(desktopBranch).not.toContain("onDrop");
    expect(desktopBranch).toMatch(/ref=\{inputRef\}[\s\S]*?multiple[\s\S]*?onChange/);
    expect(globals).toContain("--desktop-bg: #f5f5f7");
    expect(globals).toContain("color-scheme: light");
    expect(globals).toContain(".desktop-tile-preview-grid");
    expect(globals).toContain(".desktop-file-pick-cta");
    expect(globals).toContain("width: 300px");
    expect(globals).toContain("height: 64px");
    expect(globals).toContain("font-weight: 900");
    expect(globals).toContain(".desktop-preview-file-name");
    expect(globals).not.toContain(".desktop-compact-table-shell");
    expect(globals).not.toContain(".desktop-file-stage-header");
    const footerBlock = source.slice(
      source.indexOf('<footer className="desktop-compact-footer">'),
      source.indexOf("</footer>", source.indexOf('<footer className="desktop-compact-footer">'))
    );
    expect(footerBlock).toContain("本地运行，保护隐私安全");
    expect(footerBlock).toContain("开发者：MR.谢");
    expect(footerBlock).not.toContain("更新日志");
    expect(footerBlock).not.toContain("使用教程");
    expect(source).toContain("viewMode: 2");
    expect(source).toContain("autoCropArea: 1");
    expect(source).toContain("desktop-preview-body-shell");
    expect(homeSource).not.toContain("进入工具台");
  });
});
