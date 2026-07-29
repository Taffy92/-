import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const toolsClientSource = readFileSync(path.join(process.cwd(), "src/components/tools/ToolsClient.tsx"), "utf8");
const toolCatalogSource = readFileSync(path.join(process.cwd(), "src/config/toolCatalog.ts"), "utf8");
const headerSource = readFileSync(path.join(process.cwd(), "src/components/layout/Header.tsx"), "utf8");
const mediaCoreSource = readFileSync(path.join(process.cwd(), "../../packages/media-core/src/index.ts"), "utf8");

describe("online audio/video and batch professional gate", () => {
  it("keeps online audio and video conversion entries", () => {
    expect(toolsClientSource).toContain('id: "video-convert"');
    expect(toolsClientSource).toContain('id: "audio-convert"');
    expect(toolsClientSource).toContain('id: "video-audio"');
    expect(toolsClientSource).toContain("视频格式转换");
    expect(toolsClientSource).toContain("音频格式转换");
    expect(toolsClientSource).toContain("视频提取音频");
  });

  it("keeps the online toolbox free of professional gate layout slots", () => {
    const webTabsBlock = toolsClientSource.slice(
      toolsClientSource.indexOf("const webTabs"),
      toolsClientSource.indexOf("const desktopTabs")
    );
    expect(webTabsBlock).not.toContain('id: "batch-gate"');
    expect(webTabsBlock).not.toContain('id: "download"');
    expect(toolsClientSource).not.toContain('data-testid="online-batch-gate"');
    expect(toolCatalogSource).toContain("export const unifiedToolCategories");
    expect(toolCatalogSource).toContain('id: "image"');
    expect(toolCatalogSource).toContain('id: "pdf"');
    expect(toolCatalogSource).toContain('id: "document"');
    expect(toolCatalogSource).toContain('id: "media"');
    expect(toolCatalogSource).toContain('id: "ocr"');
    expect(headerSource).toContain("在线工具");
    expect(headerSource).toContain("使用教程");
    expect(headerSource).toContain("离线版");
    expect(headerSource).not.toContain("增强工具");
    expect(toolsClientSource).toContain("文件本地处理，广告与转换数据隔离。");
  });

  it("keeps FFmpeg WASM loading on local static assets only", () => {
    expect(mediaCoreSource).toContain('const ffmpegAssetBase = "/ffmpeg"');
    expect(mediaCoreSource).toContain("ffmpeg-core.js");
    expect(mediaCoreSource).toContain("ffmpeg-core.wasm");
    expect(mediaCoreSource).not.toContain("unpkg.com");
    expect(mediaCoreSource).not.toContain("cdn.jsdelivr.net");
    expect(mediaCoreSource).not.toContain("https://");
    expect(mediaCoreSource).not.toContain("FormData");
  });
});
