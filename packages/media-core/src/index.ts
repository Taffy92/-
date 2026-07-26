import type { ProgressReporter } from "@doctool/shared";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

export const videoOutputFormats = ["mp4", "mov", "avi", "mkv", "webm"] as const;
export type VideoOutputFormat = (typeof videoOutputFormats)[number];

export const audioOutputFormats = ["mp3", "wav", "aac", "m4a", "flac"] as const;
export type AudioOutputFormat = (typeof audioOutputFormats)[number];

export const extractedAudioOutputFormats = ["mp3", "wav", "m4a", "aac"] as const;
export type ExtractedAudioOutputFormat = (typeof extractedAudioOutputFormats)[number];

export const mediaQualityOptions = ["balanced", "small", "high"] as const;
export type MediaQuality = (typeof mediaQualityOptions)[number];

export const videoSizeOptions = ["original", "1080p", "720p", "480p"] as const;
export type VideoSizeOption = (typeof videoSizeOptions)[number];

export const audioBitrateOptions = ["96k", "128k", "192k", "256k"] as const;
export type AudioBitrateOption = (typeof audioBitrateOptions)[number];

export interface MediaCapabilityReport {
  canUseFfmpeg: boolean;
  canUseWorkers: boolean;
  canUseWebAssembly: boolean;
  videoFormats: VideoOutputFormat[];
  audioFormats: AudioOutputFormat[];
  extractedAudioFormats: ExtractedAudioOutputFormat[];
  videoSizes: VideoSizeOption[];
  audioBitrates: AudioBitrateOption[];
  warnings: string[];
}

export interface VideoConversionOptions {
  format: VideoOutputFormat;
  quality: MediaQuality;
  videoSize?: VideoSizeOption;
  audioBitrate?: AudioBitrateOption;
  stripMetadata?: boolean;
  onProgress?: ProgressReporter;
  signal?: AbortSignal;
}

export interface AudioConversionOptions {
  format: AudioOutputFormat;
  quality: MediaQuality;
  audioBitrate?: AudioBitrateOption;
  stripMetadata?: boolean;
  onProgress?: ProgressReporter;
  signal?: AbortSignal;
}

export interface ExtractAudioOptions {
  format: ExtractedAudioOutputFormat;
  quality: MediaQuality;
  audioBitrate?: AudioBitrateOption;
  stripMetadata?: boolean;
  onProgress?: ProgressReporter;
  signal?: AbortSignal;
}

interface MediaStreamInfo {
  hasVideo: boolean;
  hasAudio: boolean;
  videoWidth?: number;
  videoHeight?: number;
}

const ffmpegAssetBase = "/ffmpeg";
const ffmpegWasmParts = (process.env.NEXT_PUBLIC_FFMPEG_WASM_PARTS || "")
  .split(",")
  .map((part) => part.trim())
  .filter(Boolean);

const videoMimeByFormat: Record<VideoOutputFormat, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm"
};

const audioMimeByFormat: Record<AudioOutputFormat | ExtractedAudioOutputFormat, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  m4a: "audio/mp4",
  flac: "audio/flac"
};

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoading: Promise<FFmpeg> | null = null;

export function getMediaCapabilityReport(): MediaCapabilityReport {
  const canUseWorkers = typeof Worker !== "undefined";
  const canUseWebAssembly = typeof WebAssembly !== "undefined";
  const canUseFfmpeg = typeof window !== "undefined" && typeof Blob !== "undefined" && canUseWorkers && canUseWebAssembly;
  const warnings: string[] = [];

  if (!canUseWebAssembly) warnings.push("当前环境不支持 WebAssembly，无法运行本地音视频转换核心。");
  if (!canUseWorkers) warnings.push("当前环境不支持 Web Worker，无法在后台运行本地音视频转换任务。");
  if (typeof window === "undefined") warnings.push("音视频转换需要在浏览器或离线桌面程序界面中运行。");
  if (typeof Blob === "undefined") warnings.push("当前环境缺少 Blob 文件能力，无法生成本地转换结果。");

  return {
    canUseFfmpeg,
    canUseWorkers,
    canUseWebAssembly,
    videoFormats: canUseFfmpeg ? [...videoOutputFormats] : [],
    audioFormats: canUseFfmpeg ? [...audioOutputFormats] : [],
    extractedAudioFormats: canUseFfmpeg ? [...extractedAudioOutputFormats] : [],
    videoSizes: canUseFfmpeg ? [...videoSizeOptions] : [],
    audioBitrates: canUseFfmpeg ? [...audioBitrateOptions] : [],
    warnings
  };
}

export function getVideoMime(format: VideoOutputFormat): string {
  return videoMimeByFormat[format];
}

export function getAudioMime(format: AudioOutputFormat | ExtractedAudioOutputFormat): string {
  return audioMimeByFormat[format];
}

export async function convertVideoFormat(file: File, options: VideoConversionOptions): Promise<Blob> {
  const outputName = `output.${options.format}`;
  const sameFormatStreamCopy = shouldStreamCopyVideo(file, options);
  const args = [
    ...inputArgs(file),
    ...(sameFormatStreamCopy ? streamCopyVideoArgs() : videoArgs(options)),
    ...metadataArgs(options.stripMetadata),
    outputName
  ];
  return runFfmpegConversion(file, outputName, args, getVideoMime(options.format), {
    signal: options.signal,
    onProgress: options.onProgress,
    loadingMessage: "正在加载本地视频转换核心",
    runningMessage: "正在本地转换视频格式"
  });
}

export async function convertAudioFormat(file: File, options: AudioConversionOptions): Promise<Blob> {
  const outputName = `output.${options.format}`;
  const args = [
    ...inputArgs(file),
    ...audioArgs(options.format, options.quality, options.audioBitrate),
    ...metadataArgs(options.stripMetadata),
    outputName
  ];
  return runFfmpegConversion(file, outputName, args, getAudioMime(options.format), {
    signal: options.signal,
    onProgress: options.onProgress,
    loadingMessage: "正在加载本地音频转换核心",
    runningMessage: "正在本地转换音频格式"
  });
}

export async function extractAudioFromVideo(file: File, options: ExtractAudioOptions): Promise<Blob> {
  const outputName = `output.${options.format}`;
  const args = [
    ...inputArgs(file),
    "-map",
    "0:a:0",
    ...audioArgs(options.format, options.quality, options.audioBitrate),
    ...metadataArgs(options.stripMetadata),
    outputName
  ];
  return runFfmpegConversion(file, outputName, args, getAudioMime(options.format), {
    signal: options.signal,
    onProgress: options.onProgress,
    loadingMessage: "正在加载本地音频提取核心",
    runningMessage: "正在从视频中提取音频"
  });
}

async function runFfmpegConversion(
  file: File,
  outputName: string,
  args: string[],
  mimeType: string,
  options: {
    signal?: AbortSignal;
    onProgress?: ProgressReporter;
    loadingMessage: string;
    runningMessage: string;
  }
) {
  ensureFfmpegEnvironment();
  if (options.signal?.aborted) throw new Error("用户取消处理。");

  const inputName = inputFileName(file);
  const ffmpeg = await loadFfmpeg(options.onProgress, options.loadingMessage, options.signal);
  const { fetchFile } = await import("@ffmpeg/util");
  const logs: string[] = [];

  const onProgress = ({ progress }: { progress: number }) => {
    const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(0.98, progress)) : 0;
    options.onProgress?.(0.18 + safeProgress * 0.8, options.runningMessage);
  };
  const onLog = ({ message }: { message: string }) => {
    const nextMessage = message.trim();
    if (!nextMessage) return;
    logs.push(nextMessage);
    if (logs.length > 20) logs.shift();
  };
  const onAbort = () => {
    ffmpeg.terminate();
    ffmpegInstance = null;
    ffmpegLoading = null;
  };

  ffmpeg.on("progress", onProgress);
  ffmpeg.on("log", onLog);
  options.signal?.addEventListener("abort", onAbort, { once: true });

  try {
    options.onProgress?.(0.12, "正在把文件写入浏览器本地内存");
    await ffmpeg.writeFile(inputName, await fetchFile(file), { signal: options.signal });
    let argsToRun = args;
    if (file.type.startsWith("video/")) {
      const streamInfo = await probeMediaStreams(ffmpeg, inputName, options.signal);
      if (!streamInfo.hasAudio && mimeType.startsWith("audio/")) {
        throw new Error("该视频没有可提取的音频轨道。");
      }
      if (!streamInfo.hasAudio) argsToRun = argsForVideoWithoutAudio(args);
      if (needsVideoTranscode(argsToRun) && isTinyVideo(streamInfo)) {
        throw new Error("当前浏览器无法转码小于 32x32 的超小视频，请优先导出为 MP4、MOV、AVI、MKV，或改用 Windows 离线专业版。");
      }
    }
    options.onProgress?.(0.18, options.runningMessage);
    const code = await ffmpeg.exec(argsToRun, undefined, { signal: options.signal });
    if (code !== 0) {
      throw new Error(logs.at(-1) || "本地转换失败，请更换输出格式、降低质量或使用离线版重试。");
    }
    const data = await ffmpeg.readFile(outputName, undefined, { signal: options.signal });
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const resultBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    options.onProgress?.(1, "本地转换完成");
    return new Blob([resultBuffer], { type: mimeType });
  } catch (error) {
    if (options.signal?.aborted) throw new Error("用户取消处理。");
    throw toFriendlyFfmpegError(error, logs);
  } finally {
    ffmpeg.off("progress", onProgress);
    ffmpeg.off("log", onLog);
    options.signal?.removeEventListener("abort", onAbort);
    await ffmpeg.deleteFile(inputName).catch(() => undefined);
    await ffmpeg.deleteFile(outputName).catch(() => undefined);
  }
}

async function loadFfmpeg(onProgress?: ProgressReporter, message = "正在加载本地转换核心", signal?: AbortSignal) {
  if (ffmpegInstance?.loaded) return ffmpegInstance;
  if (!ffmpegLoading) {
    ffmpegLoading = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = new FFmpeg();
      const wasmAsset = await resolveFfmpegWasmAsset(signal);
      onProgress?.(0.03, message);
      try {
        await ffmpeg.load(
          {
            coreURL: assetUrl(`${ffmpegAssetBase}/ffmpeg-core.js`),
            wasmURL: wasmAsset.url
          },
          { signal }
        );
      } finally {
        wasmAsset.revoke?.();
      }
      ffmpegInstance = ffmpeg;
      onProgress?.(0.1, "本地转换核心加载完成");
      return ffmpeg;
    })().finally(() => {
      ffmpegLoading = null;
    });
  }
  return ffmpegLoading;
}

function ensureFfmpegEnvironment() {
  const report = getMediaCapabilityReport();
  if (!report.canUseFfmpeg) {
    throw new Error(report.warnings[0] || "当前环境无法运行本地音视频转换核心。");
  }
}

function inputArgs(file: File) {
  return ["-hide_banner", "-nostdin", "-y", "-i", inputFileName(file)];
}

function inputFileName(file: File) {
  const extension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "bin";
  return `input.${extension}`;
}

function shouldStreamCopyVideo(file: File, options: VideoConversionOptions) {
  const sourceFormat = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if ((options.videoSize || "original") !== "original") return false;
  if (options.quality !== "balanced") return sourceFormat === options.format;
  if (options.audioBitrate && options.audioBitrate !== "128k") return sourceFormat === options.format;
  return options.format !== "webm";
}

function streamCopyVideoArgs() {
  return ["-map", "0:v:0", "-map", "0:a?", "-c:v", "copy", "-c:a", "copy"];
}

function videoArgs(options: VideoConversionOptions) {
  const quality = mediaQuality(options.quality);
  const audioBitrate = options.audioBitrate || quality.audioBitrate;
  const commonMap = ["-map", "0:v:0", "-map", "0:a?", ...scaleArgs(options.videoSize), "-shortest"];

  if (options.format === "webm") {
    return [...commonMap, "-c:v", "libvpx-vp9", "-b:v", quality.videoBitrate, "-deadline", "realtime", "-cpu-used", "5", "-c:a", "libopus", "-b:a", audioBitrate];
  }

  if (options.format === "avi") {
    return [...commonMap, "-c:v", "mpeg4", "-q:v", quality.qscale, "-c:a", "libmp3lame", "-b:a", audioBitrate];
  }

  return [...commonMap, "-c:v", "mpeg4", "-q:v", quality.qscale, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", audioBitrate];
}

function argsForVideoWithoutAudio(args: string[]) {
  const nextArgs: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    const nextValue = args[index + 1];
    if (value === "-map" && nextValue === "0:a?") {
      index += 1;
      continue;
    }
    if ((value === "-c:a" || value === "-b:a") && typeof nextValue === "string") {
      index += 1;
      continue;
    }
    if (value === "-shortest") continue;
    nextArgs.push(value);
  }
  return nextArgs;
}

function audioArgs(format: AudioOutputFormat | ExtractedAudioOutputFormat, quality: MediaQuality, bitrate?: AudioBitrateOption) {
  const audioBitrate = bitrate || mediaQuality(quality).audioBitrate;
  const base = ["-vn", "-ac", "2", "-ar", "44100"];

  if (format === "wav") return [...base, "-c:a", "pcm_s16le"];
  if (format === "flac") return [...base, "-c:a", "flac", "-compression_level", "5"];
  if (format === "mp3") return [...base, "-c:a", "libmp3lame", "-b:a", audioBitrate];
  if (format === "aac") return [...base, "-c:a", "aac", "-b:a", audioBitrate, "-f", "adts"];
  return [...base, "-c:a", "aac", "-b:a", audioBitrate];
}

function scaleArgs(size: VideoSizeOption = "original") {
  if (size === "original") {
    return ["-vf", "scale=trunc(iw*max(1\\,32/min(iw\\,ih))/2)*2:trunc(ih*max(1\\,32/min(iw\\,ih))/2)*2"];
  }
  const height = size === "1080p" ? 1080 : size === "720p" ? 720 : 480;
  return ["-vf", `scale=-2:'min(${height},ih)'`];
}

function metadataArgs(stripMetadata = true) {
  return stripMetadata ? ["-map_metadata", "-1", "-map_chapters", "-1"] : [];
}

async function probeMediaStreams(ffmpeg: FFmpeg, inputName: string, signal?: AbortSignal): Promise<MediaStreamInfo> {
  const outputName = `${inputName}.streams.txt`;
  try {
    const code = await ffmpeg.ffprobe(
      [
        "-v",
        "error",
        "-show_entries",
        "stream=codec_type,width,height",
        "-of",
        "json",
        inputName,
        "-o",
        outputName
      ],
      undefined,
      { signal }
    );
    if (code !== 0) return { hasVideo: true, hasAudio: true };
    const data = await ffmpeg.readFile(outputName, "utf8", { signal });
    const payload = JSON.parse(String(data)) as {
      streams?: Array<{ codec_type?: string; width?: number; height?: number }>;
    };
    const streams = payload.streams || [];
    const videoStream = streams.find((stream) => String(stream.codec_type).toLowerCase() === "video");
    return {
      hasVideo: streams.some((stream) => String(stream.codec_type).toLowerCase() === "video"),
      hasAudio: streams.some((stream) => String(stream.codec_type).toLowerCase() === "audio"),
      videoWidth: typeof videoStream?.width === "number" ? videoStream.width : undefined,
      videoHeight: typeof videoStream?.height === "number" ? videoStream.height : undefined
    };
  } catch {
    return { hasVideo: true, hasAudio: true };
  } finally {
    await ffmpeg.deleteFile(outputName).catch(() => undefined);
  }
}

function needsVideoTranscode(args: string[]) {
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "-c:v") return args[index + 1] !== "copy";
  }
  return true;
}

function isTinyVideo(streamInfo: MediaStreamInfo) {
  return Boolean(streamInfo.videoWidth && streamInfo.videoHeight && (streamInfo.videoWidth < 32 || streamInfo.videoHeight < 32));
}

function mediaQuality(quality: MediaQuality) {
  if (quality === "high") return { crf: "20", qscale: "3", videoBitrate: "5000k", audioBitrate: "192k" as AudioBitrateOption };
  if (quality === "small") return { crf: "32", qscale: "8", videoBitrate: "1200k", audioBitrate: "96k" as AudioBitrateOption };
  return { crf: "26", qscale: "5", videoBitrate: "2500k", audioBitrate: "128k" as AudioBitrateOption };
}

function assetUrl(path: string) {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.href).toString();
}

async function resolveFfmpegWasmAsset(signal?: AbortSignal) {
  if (ffmpegWasmParts.length === 0) {
    return { url: assetUrl(`${ffmpegAssetBase}/ffmpeg-core.wasm`) };
  }

  const buffers = await Promise.all(
    ffmpegWasmParts.map(async (part) => {
      const response = await fetch(assetUrl(part), { signal });
      if (!response.ok) throw new Error(`本地转换核心分片加载失败（HTTP ${response.status}）。`);
      return response.arrayBuffer();
    })
  );
  const url = URL.createObjectURL(new Blob(buffers, { type: "application/wasm" }));
  return { url, revoke: () => URL.revokeObjectURL(url) };
}

function toFriendlyFfmpegError(error: unknown, logs: string[] = []) {
  const message = error instanceof Error ? error.message : String(error);
  if (/AbortError|signal.*aborted|cancelled by user|user cancelled/i.test(message)) return new Error("用户取消处理。");
  const logText = logs.join("\n");
  const diagnosticText = `${message}\n${logText}`;
  if (/Stream map ['"]?0:a(?::0)?['"]? matches no streams|does not contain any stream|Output file does not contain any stream/i.test(diagnosticText)) {
    return new Error("该视频没有可提取的音频轨道。");
  }
  if (/Image too small, temporary buffers cannot function|get_buffer\(\) failed to allocate context scratch buffers/i.test(logText)) {
    return new Error("当前浏览器无法转码过小的视频分辨率，请优先导出为 MP4、MOV、AVI、MKV，或改用 Windows 离线专业版。");
  }
  if (/Conversion failed!|Aborted\(\)/i.test(message)) {
    return new Error("当前浏览器本地视频转码失败，请尝试切换输出格式或改用 Windows 离线专业版。");
  }
  if (/memory|allocation/i.test(message)) return new Error("浏览器内存不足，请换用较小文件、降低输出质量，或使用离线版处理。");
  if (/Invalid data|could not find codec|Decoder|demux/i.test(message)) {
    return new Error("本地转换核心无法读取该文件编码，请换用常见清晰文件，或先用原软件重新导出后再转换。");
  }
  if (/encoder|codec|muxer|format/i.test(message)) return new Error("当前输出格式编码失败，请换用其他输出格式或降低质量后重试。");
  return error instanceof Error ? error : new Error(message || "本地音视频转换失败。");
}
