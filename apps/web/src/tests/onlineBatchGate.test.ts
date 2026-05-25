import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const toolsClientSource = readFileSync(path.join(process.cwd(), "src/components/tools/ToolsClient.tsx"), "utf8");
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

  it("adds a web-only professional batch gate without enabling the batch queue", () => {
    expect(toolsClientSource).toContain('id: "batch-gate"');
    expect(toolsClientSource).toContain("批量处理为离线专业版功能，请下载 Windows 离线专业版使用。");
    expect(toolsClientSource).toContain('data-testid="online-batch-gate"');
    expect(toolsClientSource).toContain('tab.id !== "download" && tab.id !== "batch-gate"');
    expect(toolsClientSource).toContain('case "batch-gate": window.location.href = "/download"; return;');
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
