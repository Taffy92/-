import { describe, expect, it } from "vitest";
import { defaultOutputDirectory } from "../lib/batchQueue";
import { getSidecarExperimentMode, isSidecarReady, shouldUseSidecarExperiment, sidecarStatusText, sidecarUnsupportedReason } from "../lib/sidecarFfmpeg";

describe("sidecar FFmpeg priority routing", () => {
  const ready = { status: "sidecar_ready", sha256Verified: true };
  const tauriOutput = { kind: "tauri" as const, path: "D:\\output folder", label: "D:/output folder" };

  it("uses sidecar only in desktop mode with verified sidecar, local source path and Tauri output directory", () => {
    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: true,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\input folder\\audio.wav",
      mode: "audio-convert",
      fileName: "audio.wav",
      audioFormat: "flac"
    })).toBe(true);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: false,
      enabled: true,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\input folder\\audio.wav",
      mode: "audio-convert",
      fileName: "audio.wav",
      audioFormat: "flac"
    })).toBe(false);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: false,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\input folder\\audio.wav",
      mode: "audio-convert",
      fileName: "audio.wav",
      audioFormat: "flac"
    })).toBe(false);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: true,
      status: { status: "sidecar_checksum_failed", sha256Verified: false },
      outputDirectory: tauriOutput,
      sourcePath: "D:\\input folder\\audio.wav",
      mode: "audio-convert",
      fileName: "audio.wav",
      audioFormat: "flac"
    })).toBe(false);

    expect(shouldUseSidecarExperiment({
      isDesktopSurface: true,
      enabled: true,
      status: ready,
      outputDirectory: defaultOutputDirectory(),
      sourcePath: "D:\\input folder\\audio.wav",
      mode: "audio-convert",
      fileName: "audio.wav",
      audioFormat: "flac"
    })).toBe(false);
  });

  it("routes WAV to FLAC and common local video conversions through sidecar", () => {
    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "audio.wav", audioFormat: "flac" })).toBe("convert-wav-to-flac-poc");
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.mp4", videoFormat: "mp4" })).toBe("convert-video-sidecar");
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.mov", videoFormat: "webm" })).toBe("convert-video-sidecar");
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.avi", videoFormat: "mkv" })).toBe("convert-video-sidecar");
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.mkv", videoFormat: "mov" })).toBe("convert-video-sidecar");
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.webm", videoFormat: "avi" })).toBe("convert-video-sidecar");

    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "audio.wav", audioFormat: "mp3" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "audio.wav", audioFormat: "aac" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "audio-convert", fileName: "audio.wav", audioFormat: "m4a" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.ogv", videoFormat: "mp4" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-convert", fileName: "video.mp4", videoFormat: "ogv" })).toBeNull();
    expect(getSidecarExperimentMode({ mode: "video-audio", fileName: "video.mp4", audioFormat: "flac" })).toBeNull();
  });

  it("returns status and fallback explanations without enabling unsupported work", () => {
    expect(isSidecarReady({ status: "sidecar_ready", sha256Verified: true })).toBe(true);
    expect(isSidecarReady({ status: "sidecar_ready", sha256Verified: false })).toBe(false);
    expect(sidecarStatusText({ status: "sidecar_ready", sha256Verified: true })).toContain("sidecar");
    expect(sidecarStatusText({ status: "sidecar_checksum_failed", sha256Verified: false })).toContain("sidecar");
    expect(sidecarStatusText({ status: "sidecar_missing", sha256Verified: false })).toContain("sidecar");
    expect(sidecarUnsupportedReason({ mode: "audio-convert", fileName: "audio.wav", audioFormat: "mp3" })).toContain("WAV");
    expect(sidecarUnsupportedReason({ mode: "video-convert", fileName: "video.ogv", videoFormat: "mp4" })).toContain("MP4");
    expect(sidecarUnsupportedReason({ mode: "video-audio", fileName: "video.mp4", audioFormat: "m4a" })).toContain("sidecar");
  });
});
