import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  audioOutputFormats,
  audioBitrateOptions,
  extractedAudioOutputFormats,
  getAudioMime,
  getMediaCapabilityReport,
  getVideoMime,
  videoSizeOptions,
  videoOutputFormats
} from "@doctool/media-core";

const originalWorker = globalThis.Worker;
const originalWebAssembly = globalThis.WebAssembly;
const originalWindow = globalThis.window;
const mediaCoreSource = readFileSync(path.join(process.cwd(), "../../packages/media-core/src/index.ts"), "utf8");

function setGlobal<T extends keyof typeof globalThis>(name: T, value: (typeof globalThis)[T] | undefined) {
  if (typeof value === "undefined") {
    Reflect.deleteProperty(globalThis, name);
    return;
  }
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

class MockWorker {
  terminate() {
    return undefined;
  }
}

describe("media-core FFmpeg WASM capability checks", () => {
  afterEach(() => {
    setGlobal("Worker", originalWorker);
    setGlobal("WebAssembly", originalWebAssembly);
    setGlobal("window", originalWindow);
  });

  it("reports the requested local video, audio and extraction formats", () => {
    setGlobal("Worker", MockWorker as unknown as typeof Worker);
    setGlobal("WebAssembly", originalWebAssembly || ({} as typeof WebAssembly));
    setGlobal("window", globalThis as Window & typeof globalThis);

    const report = getMediaCapabilityReport();

    expect(report.canUseFfmpeg).toBe(true);
    expect(report.canUseWorkers).toBe(true);
    expect(report.canUseWebAssembly).toBe(true);
    expect(report.videoFormats).toEqual([...videoOutputFormats]);
    expect(report.audioFormats).toEqual([...audioOutputFormats]);
    expect(report.extractedAudioFormats).toEqual([...extractedAudioOutputFormats]);
    expect(report.videoSizes).toEqual([...videoSizeOptions]);
    expect(report.audioBitrates).toEqual([...audioBitrateOptions]);
    expect(report.videoFormats).toEqual(["mp4", "mov", "avi", "mkv", "webm"]);
    expect(report.audioFormats).toEqual(["mp3", "wav", "aac", "m4a", "flac"]);
    expect(report.extractedAudioFormats).toEqual(["mp3", "wav", "m4a", "aac"]);
    expect(report.videoSizes).toEqual(["original", "1080p", "720p", "480p"]);
    expect(report.audioBitrates).toEqual(["96k", "128k", "192k", "256k"]);
    expect(getVideoMime("avi")).toBe("video/x-msvideo");
    expect(getAudioMime("m4a")).toBe("audio/mp4");
  });

  it("reports warnings when local FFmpeg WASM requirements are missing", () => {
    setGlobal("Worker", undefined);
    setGlobal("WebAssembly", undefined);
    setGlobal("window", undefined);

    const report = getMediaCapabilityReport();

    expect(report.canUseFfmpeg).toBe(false);
    expect(report.canUseWorkers).toBe(false);
    expect(report.canUseWebAssembly).toBe(false);
    expect(report.videoFormats).toEqual([]);
    expect(report.audioFormats).toEqual([]);
    expect(report.extractedAudioFormats).toEqual([]);
    expect(report.videoSizes).toEqual([]);
    expect(report.audioBitrates).toEqual([]);
    expect(report.warnings.length).toBeGreaterThanOrEqual(3);
  });

  it("loads FFmpeg core from same-origin assets and supports split web deployment", () => {
    expect(mediaCoreSource).toContain('const ffmpegAssetBase = "/ffmpeg"');
    expect(mediaCoreSource).toContain("NEXT_PUBLIC_FFMPEG_WASM_PARTS");
    expect(mediaCoreSource).toContain("resolveFfmpegWasmAsset");
    expect(mediaCoreSource).toContain("application/wasm");
    expect(mediaCoreSource).toContain("ffmpeg-core.wasm");
    expect(mediaCoreSource).toContain("-map_metadata");
    expect(mediaCoreSource).toContain("0:a:0");
    expect(mediaCoreSource).toContain("videoSize");
    expect(mediaCoreSource).toContain("audioBitrate");
    expect(mediaCoreSource).toContain("scale=-2");
    expect(mediaCoreSource).toContain("32/min(iw\\\\,ih)");
    expect(mediaCoreSource).toContain("\"mpeg4\"");
    expect(mediaCoreSource).toContain("ffmpeg.ffprobe");
    expect(mediaCoreSource).toContain("stream=codec_type");
    expect(mediaCoreSource).toContain("该视频没有可提取的音频轨道");
    expect(mediaCoreSource).toContain("argsForVideoWithoutAudio");
    expect(mediaCoreSource).toContain("streamCopyVideoArgs");
    expect(mediaCoreSource).not.toContain("+faststart");
    expect(mediaCoreSource).not.toContain("libx264");
    expect(mediaCoreSource).not.toContain("unpkg.com");
    expect(mediaCoreSource).not.toContain("FormData");
  });
});
