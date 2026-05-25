import { describe, expect, it } from "vitest";
import { defaultOutputDirectory } from "../lib/batchQueue";
import { getSidecarExperimentMode, isSidecarReady, shouldUseSidecarExperiment, sidecarStatusText, sidecarUnsupportedReason } from "../lib/sidecarFfmpeg";

describe("sidecar FFmpeg low-risk priority routing", () => {
  const ready = { status: "sidecar_ready", sha256Verified: true };
  const tauriOutput = { kind: "tauri" as const, path: "D:\\输出 文件夹", label: "D:/.../输出 文件夹" };

  it("uses sidecar only in desktop mode with verified sidecar, local source path and Tauri output directory", () => {
    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: true,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\输入 文件夹\\中文音频.wav",
      mode: "audio-convert",
      fileName: "中文音频.wav",
      audioFormat: "flac"
    })).toBe(true);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: false,
      enabled: true,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\输入 文件夹\\中文音频.wav",
      mode: "audio-convert",
      fileName: "中文音频.wav",
      audioFormat: "flac"
    })).toBe(false);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: false,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\输入 文件夹\\中文音频.wav",
      mode: "audio-convert",
      fileName: "中文音频.wav",
      audioFormat: "flac"
    })).toBe(false);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: true,
      status: { status: "sidecar_checksum_failed", sha256Verified: false },
      outputDirectory: tauriOutput,
      sourcePath: "D:\\输入 文件夹\\中文音频.wav",
      mode: "audio-convert",
      fileName: "中文音频.wav",
      audioFormat: "flac"
    })).toBe(false);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: true,
      status: ready,
      outputDirectory: defaultOutputDirectory(),
      sourcePath: "D:\\输入 文件夹\\中文音频.wav",
      mode: "audio-convert",
      fileName: "中文音频.wav",
      audioFormat: "flac"
    })).toBe(false);
  });

  it("allows only WAV to FLAC and MP4 to WebM as sidecar priority formats", () => {
    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "中文音频.wav", audioFormat: "flac" })).toBe("convert-wav-to-flac-poc");
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "中文视频.mp4", videoFormat: "webm" })).toBe("convert-mp4-to-webm-poc");

    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "中文音频.wav", audioFormat: "mp3" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "中文音频.wav", audioFormat: "aac" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "中文音频.wav", audioFormat: "m4a" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "中文视频.mp4", videoFormat: "mp4" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "中文视频.mov", videoFormat: "webm" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "中文视频.avi", videoFormat: "webm" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "中文视频.mkv", videoFormat: "webm" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-audio", fileName: "中文视频.mp4", audioFormat: "flac" })).toBeNull();
  });

  it("returns clear status and fallback explanations", () => {
    expect(isSidecarReady({ status: "sidecar_ready", sha256Verified: true })).toBe(true);
    expect(isSidecarReady({ status: "sidecar_ready", sha256Verified: false })).toBe(false);
    expect(sidecarStatusText({ status: "sidecar_ready", sha256Verified: true })).toContain("低风险格式");
    expect(sidecarStatusText({ status: "sidecar_checksum_failed", sha256Verified: false })).toBe("sidecar 校验失败");
    expect(sidecarStatusText({ status: "sidecar_missing", sha256Verified: false })).toBe("sidecar 未配置");
    expect(sidecarUnsupportedReason({ mode: "audio-convert", fileName: "中文音频.wav", audioFormat: "mp3" })).toContain("WAV 转 FLAC");
    expect(sidecarUnsupportedReason({ mode: "video-convert", fileName: "中文视频.mp4", videoFormat: "mp4" })).toContain("MP4/H.264");
    expect(sidecarUnsupportedReason({ mode: "video-audio", fileName: "中文视频.mp4", audioFormat: "m4a" })).toContain("视频提取音频");
  });
});
