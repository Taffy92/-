import type { BatchMode, BatchOutputDirectory } from "./batchQueue";

export type SidecarBackend = "wasm" | "sidecar";

export type SidecarCheckResult = {
  configured?: boolean;
  status?: "sidecar_missing" | "sidecar_checksum_failed" | "sidecar_ready" | string;
  message?: string;
  sha256Verified?: boolean;
  verifiedFiles?: number;
  checksumFailures?: string[];
  ffmpegSha256?: string;
  ffprobeSha256?: string;
};

export type SidecarCommandResult = {
  status: "ok" | "failed" | "sidecar_missing" | "sidecar_checksum_failed" | string;
  mode: string;
  message: string;
  outputPath?: string;
  sanitizedOutputPath?: string;
  stdoutPreview?: string;
  stderrPreview?: string;
  durationMs?: number;
};

export type SidecarExperimentMode = "convert-wav-to-flac-poc" | "convert-mp4-to-webm-poc";
export type SidecarProbeMode = "probe-duration";
export type SidecarCommandMode = SidecarExperimentMode | SidecarProbeMode;

export const sidecarExperimentStorageKey = "format-converter.desktop.sidecar-ffmpeg-experiment.v1";

export function sidecarStatusText(status?: SidecarCheckResult) {
  if (!status) return "sidecar 未检查";
  if (isSidecarReady(status)) return "sidecar 可用，低风险格式可优先使用";
  if (status.status === "sidecar_missing") return "sidecar 未配置";
  if (status.status === "sidecar_checksum_failed" || status.sha256Verified === false) return "sidecar 校验失败";
  return "sidecar 未配置";
}

export function isSidecarReady(status?: SidecarCheckResult) {
  return status?.status === "sidecar_ready" && status.sha256Verified === true;
}

export function getSidecarExperimentMode(options: {
  mode: BatchMode;
  fileName: string;
  videoFormat?: string;
  audioFormat?: string;
}): SidecarExperimentMode | null {
  const extension = extensionOf(options.fileName);
  if (options.mode === "audio-convert" && extension === "wav" && options.audioFormat === "flac") {
    return "convert-wav-to-flac-poc";
  }
  if (options.mode === "video-convert" && extension === "mp4" && options.videoFormat === "webm") {
    return "convert-mp4-to-webm-poc";
  }
  return null;
}

export function shouldUseSidecarExperiment(options: {
  isDesktopSurface: boolean;
  enabled: boolean;
  status?: SidecarCheckResult;
  outputDirectory: BatchOutputDirectory;
  sourcePath?: string;
  mode: BatchMode;
  fileName: string;
  videoFormat?: string;
  audioFormat?: string;
}) {
  return Boolean(
    options.isDesktopSurface
      && options.enabled
      && isSidecarReady(options.status)
      && options.outputDirectory.kind === "tauri"
      && options.sourcePath
      && getSidecarExperimentMode(options)
  );
}

export function sidecarUnsupportedReason(options: {
  mode: BatchMode;
  fileName: string;
  videoFormat?: string;
  audioFormat?: string;
}) {
  if (getSidecarExperimentMode(options)) return "";
  if (options.mode === "audio-convert") {
    return "sidecar 低风险优先当前仅适用于 WAV 转 FLAC，其他音频输出继续使用 FFmpeg WASM。";
  }
  if (options.mode === "video-convert") {
    return "sidecar 低风险优先当前仅适用于 MP4 转 WebM，MP4/H.264、MOV、AVI、MKV 等输出继续使用 FFmpeg WASM。";
  }
  if (options.mode === "video-audio") {
    return "视频提取音频不属于 sidecar 低风险优先范围，继续使用 FFmpeg WASM。";
  }
  return "当前功能不属于 sidecar 低风险优先范围。";
}

function extensionOf(name: string) {
  const clean = name.split("?")[0].split("#")[0];
  const index = clean.lastIndexOf(".");
  return index >= 0 ? clean.slice(index + 1).toLowerCase() : "";
}
