import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsSource = readFileSync(path.join(root, "src/components/tools/ToolsClient.tsx"), "utf8");
const pdfCoreSource = readFileSync(path.join(root, "../../packages/pdf-core/src/pdf.ts"), "utf8");
const exportCoreSource = readFileSync(path.join(root, "../../packages/export-core/src/officeImages.ts"), "utf8");
const mediaCoreSource = readFileSync(path.join(root, "../../packages/media-core/src/index.ts"), "utf8");
const cloudFunctionSource = readFileSync(path.join(root, "../../cloudbase/functions/createDownloadUrl/index.js"), "utf8");
const cloudFunctionSecuritySource = readFileSync(path.join(root, "../../cloudbase/functions/createDownloadUrl/security.js"), "utf8");

describe("privacy and product boundary checks", () => {
  it("exposes the approved tabs and removes deprecated modules", () => {
    const tabBlock = toolsSource.slice(toolsSource.indexOf("const webTabs"), toolsSource.indexOf("const aspectOptions"));
    expect(tabBlock).toContain('id: "video-convert"');
    expect(tabBlock).toContain('id: "audio-convert"');
    expect(tabBlock).toContain('id: "video-audio"');
    expect(tabBlock).toContain('id: "pdf-images"');
    expect(tabBlock).toContain('id: "word-images"');
    expect(tabBlock).toContain('id: "excel-images"');
    expect(tabBlock).toContain("const desktopTabs: ToolTab[]");
    expect(tabBlock).toContain('tab.id !== "download"');
    expect(tabBlock).not.toContain('{ id: "batch"');
    expect(tabBlock).not.toContain("离线批量处理");
    expect(tabBlock).not.toContain('id: "pdf-word"');
    expect(tabBlock).not.toContain('id: "pdf-excel"');
    expect(tabBlock).not.toContain('id: "image-word"');
    expect(tabBlock).not.toContain('id: "image-excel"');
    expect(tabBlock).not.toContain("PDF 编辑");
    expect(tabBlock).not.toContain("PDF 精准编辑");
    expect(tabBlock).not.toContain("PDF 局部修改");
    expect(tabBlock).not.toContain("PDF 安全涂销");
    expect(tabBlock).not.toContain("PDF 签名盖章");
    expect(tabBlock).not.toContain("PDF 批注标注");
  });

  it("keeps local file processing code free of upload endpoints", () => {
    for (const source of [toolsSource, pdfCoreSource, exportCoreSource, mediaCoreSource]) {
      expect(source).not.toMatch(/fetch\(["'`]https?:\/\/.+upload/i);
      expect(source).not.toMatch(/new\s+FormData\(/);
    }
    expect(toolsSource).toContain("FFmpeg WASM");
    expect(toolsSource).toContain("convertVideoFormat");
    expect(toolsSource).toContain("convertAudioFormat");
    expect(toolsSource).toContain("extractAudioFromVideo");
    expect(toolsSource).toContain("AdSlot");
  });

  it("keeps batch processing exclusive to the offline desktop surface", () => {
    expect(toolsSource).toContain('const tabs = isDesktopSurface ? desktopTabs : webTabs');
    expect(toolsSource).toContain('if (!isDesktopSurface) throw new Error');
    expect(toolsSource).toContain("function getBatchModeForTab");
    expect(toolsSource).toContain('case "resize": return "resize"');
    expect(toolsSource).toContain('case "pdf-images": return "pdf-images"');
    expect(toolsSource).toContain("runBatch(modeForActiveTool)");
    expect(toolsSource).toContain("handleBatchFiles");
    expect(toolsSource).toContain("runBatch");
    expect(toolsSource).toContain("图片批量压缩");
    expect(toolsSource).toContain("视频批量转换");
    expect(toolsSource).toContain("音频批量转换");
  });

  it("keeps the desktop titlebar version tied to release configuration", () => {
    expect(toolsSource).toContain('import { downloadsConfig } from "@/config/downloads"');
    expect(toolsSource).toContain("离线专业版 v{downloadsConfig.version}");
    expect(toolsSource).not.toContain("离线专业版 v1.2.0");
  });

  it("shows local-processing privacy and capability messaging", () => {
    expect(toolsSource).toContain("文件本地处理，广告与转换数据隔离。");
    expect(toolsSource).toContain("文件只在当前设备处理，不上传服务器。");
    expect(toolsSource).toContain("MediaCapabilityBox");
    expect(toolsSource).toContain("getMediaCapabilityReport");
  });

  it("compresses images to JPG with the requested practical target sizes", () => {
    expect(toolsSource).toContain('useState("200KB")');
    expect(toolsSource).toContain('format: "jpg"');
    expect(toolsSource).toContain('fileNameWithSuffix(source.name, "compressed", "jpg")');
    expect(toolsSource).toContain('<option value="200KB">200KB</option>');
    expect(toolsSource).toContain('<option value="100KB">100KB</option>');
    expect(toolsSource).toContain('<option value="50KB">50KB</option>');
    expect(toolsSource).toContain('<option value="25KB">25KB</option>');
    expect(toolsSource).not.toContain('fileNameWithSuffix(source.name, "compressed", "webp")');
  });

  it("provides previewable watermark and resize controls", () => {
    expect(toolsSource).toContain("watermarkFontSize");
    expect(toolsSource).toContain("watermarkColor");
    expect(toolsSource).toContain("水印预览");
    expect(toolsSource).toContain("resizeMode");
    expect(toolsSource).toContain("resizePercent");
    expect(toolsSource).toContain("尺寸预览");
    expect(toolsSource).toContain("按百分比");
    expect(toolsSource).toContain("按像素");
  });

  it("keeps image cropping as a user-draggable Cropper.js workflow", () => {
    expect(toolsSource).toContain('import Cropper from "cropperjs"');
    expect(toolsSource).toContain("cropper.getCroppedCanvas");
    expect(toolsSource).toContain("cropBoxResizable: true");
    expect(toolsSource).toContain("自由裁切");
    expect(toolsSource).toContain("16:9 横屏");
    expect(toolsSource).toContain("9:16 竖屏");
    expect(toolsSource).toContain("头像 1:1");
    expect(toolsSource).toContain("一寸证件照 25x35");
  });

  it("keeps PDF and document image conversion compatible with offline WebView runtimes", () => {
    expect(pdfCoreSource).toContain("ensurePromiseWithResolvers");
    expect(pdfCoreSource).toContain("/pdfjs/pdf.mjs");
    expect(pdfCoreSource).toContain("pdf.worker.polyfill.mjs");
    expect(pdfCoreSource).toContain("useWorkerFetch: false");
    expect(toolsSource).toContain("combineImagePages");
    expect(toolsSource).toContain("renderDocxToImagePages");
    expect(toolsSource).toContain("renderExcelToImagePages");
    expect(exportCoreSource).toContain("JSZip.loadAsync");
    expect(exportCoreSource).toContain("ExcelJS.Workbook");
    expect(exportCoreSource).toContain("combineImagePages");
  });

  it("keeps CloudBase download authorization separate from user file processing", () => {
    expect(cloudFunctionSource).toContain("DOWNLOAD_PASSWORD");
    expect(cloudFunctionSource).toContain("ALLOWED_ORIGIN");
    expect(cloudFunctionSecuritySource).toContain("Access-Control-Allow-Origin");
    expect(cloudFunctionSource).toContain("getTempFileURL");
    expect(cloudFunctionSecuritySource).toContain("normalizePackageType");
    expect(cloudFunctionSource).toContain("invalid_package_type");
    expect(cloudFunctionSource).not.toContain("FormData");
    expect(cloudFunctionSource).not.toContain("File(");
    expect(cloudFunctionSource).not.toContain("Blob(");
    expect(cloudFunctionSource).not.toContain("arrayBuffer");
    expect(cloudFunctionSource).not.toContain("@doctool/");
    expect(cloudFunctionSource).not.toContain("@ffmpeg/");
    expect(cloudFunctionSource).not.toContain("pdfjs-dist");
    expect(cloudFunctionSource).not.toContain("ExcelJS");
    expect(cloudFunctionSource).not.toContain("renderExcelToImagePages");
    expect(cloudFunctionSource).not.toContain("convertVideoFormat");
  });

  it("hard-blocks oversized files in the online surface before local decoding", () => {
    const handleFileBlock = toolsSource.slice(toolsSource.indexOf("async function handleFile"), toolsSource.indexOf("function handleBatchFiles"));
    expect(toolsSource).toContain("getOnlineFileSizeLimitMessage");
    expect(toolsSource).toContain("Windows 离线专业版进行大文件或批量处理");
    expect(handleFileBlock).toContain("isDesktopSurface ? \"\" : getOnlineFileSizeLimitMessage(nextFile)");
    expect(handleFileBlock.indexOf("getOnlineFileSizeLimitMessage(nextFile)")).toBeLessThan(handleFileBlock.indexOf("URL.createObjectURL(nextFile)"));
    expect(handleFileBlock.indexOf("getOnlineFileSizeLimitMessage(nextFile)")).toBeLessThan(handleFileBlock.indexOf("summarizeFile(nextFile)"));
  });
});
