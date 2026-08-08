import type { BatchMode, BatchOutputDirectory } from "./batchQueue";
import { ConversionFailure, selectConversionBackend } from "./conversion";

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

export type SidecarExperimentMode = "convert-video-sidecar" | "convert-wav-to-flac-poc" | "convert-mp4-to-webm-poc";
export type SidecarProbeMode = "probe-duration";
export type SidecarCommandMode = SidecarExperimentMode | SidecarProbeMode;

type MediaBackendSelection = Readonly<{
  isDesktopSurface: boolean;
  enabled: boolean;
  status?: SidecarCheckResult;
  outputDirectory: BatchOutputDirectory;
  sourcePath?: string;
  mode: BatchMode;
  fileName: string;
  videoFormat?: string;
  audioFormat?: string;
}>;

export const sidecarExperimentStorageKey = "format-converter.desktop.sidecar-ffmpeg-experiment.v1";
const sidecarVideoFormats = ["mp4", "mov", "avi", "mkv", "webm"];

export function sidecarStatusText(status?: SidecarCheckResult) {
  if (!status) return "sidecar 未检查";
  if (isSidecarReady(status)) return "sidecar 可用，本地白名单格式可优先使用";
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
  if (options.mode === "video-convert" && sidecarVideoFormats.includes(extension) && options.videoFormat && sidecarVideoFormats.includes(options.videoFormat)) {
    return "convert-video-sidecar";
  }
  return null;
}

export function selectMediaConversionBackend(
  options: MediaBackendSelection
): SidecarBackend {
  const sidecarEligible = Boolean(
    options.enabled
    && isSidecarReady(options.status)
    && options.outputDirectory.kind === "tauri"
    && getSidecarExperimentMode(options)
  );
  const backend = selectConversionBackend({
    family: "media",
    surface: options.isDesktopSurface ? "desktop" : "web",
    hasLocalPath: Boolean(options.sourcePath),
    sidecarReady: sidecarEligible
  });
  return backend === "sidecar" ? "sidecar" : "wasm";
}

export function shouldUseSidecarExperiment(options: MediaBackendSelection) {
  return selectMediaConversionBackend(options) === "sidecar";
}

export function createSidecarConversionFailure(result: SidecarCommandResult) {
  const backendUnavailable = result.status === "sidecar_missing"
    || result.status === "sidecar_checksum_failed";
  return new ConversionFailure({
    code: backendUnavailable ? "backend-unavailable" : "conversion-failed",
    stage: "conversion",
    backend: "sidecar",
    message: backendUnavailable ? "本地媒体引擎不可用" : "本地媒体转换失败",
    action: backendUnavailable
      ? "请检查本地组件后重试，或改用 FFmpeg WASM"
      : "请关闭 sidecar 优先处理并改用 FFmpeg WASM 重试",
    cause: result
  });
}

export function sidecarUnsupportedReason(options: {
  mode: BatchMode;
  fileName: string;
  videoFormat?: string;
  audioFormat?: string;
}) {
  if (getSidecarExperimentMode(options)) return "";
  if (options.mode === "audio-convert") {
    return "sidecar 优先当前仅适用于 WAV 转 FLAC，其他音频输出继续使用 FFmpeg WASM。";
  }
  if (options.mode === "video-convert") {
    return "sidecar 优先支持 MP4、MOV、AVI、MKV、WebM 常用视频转换；当前输入或输出格式不在本地白名单内，继续使用 FFmpeg WASM。";
  }
  if (options.mode === "video-audio") {
    return "视频提取音频不属于 sidecar 优先范围，继续使用 FFmpeg WASM。";
  }
  return "当前功能不属于 sidecar 优先范围。";
}

function extensionOf(name: string) {
  const clean = name.split("?")[0].split("#")[0];
  const index = clean.lastIndexOf(".");
  return index >= 0 ? clean.slice(index + 1).toLowerCase() : "";
}
