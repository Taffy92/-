"use client";

import { useRef, useState } from "react";
import {
  convertImage,
  readImageMetadata,
  stripImageMetadata,
  transformImage
} from "@doctool/image-core";
import type { ImageMetadataSummary } from "@doctool/image-core";
import {
  decoratePdf,
  extractPdfPages,
  getPdfPageCount,
  imagesToPdf,
  mergePdfFiles,
  parsePageSelection,
  rearrangePdfPages,
  splitPdfPages
} from "@doctool/pdf-core";
import type { PdfPageNumberPosition, PdfWatermarkPosition } from "@doctool/pdf-core";
import {
  captureVideoFrame,
  concatAudioFiles,
  enhanceAudio,
  muteVideo,
  trimMedia,
  videoToGif
} from "@doctool/media-core";
import type { AudioOutputFormat, VideoOutputFormat } from "@doctool/media-core";
import { exportEditableOcrWord, recognizeLocalDocument } from "@doctool/ocr-core";
import type { OcrLanguage } from "@doctool/ocr-core";
import {
  audioAccept,
  fileNameWithSuffix,
  imageAccept,
  pdfAccept,
  safeBaseName,
  videoAccept
} from "@doctool/shared";
import type { ExportImageFormat } from "@doctool/shared";
import type { DesktopLicenseStatus } from "@/lib/desktopLicense";
import { sanitizeWindowsPathSegment } from "@/lib/conversion/desktopOutput";

export type LocalToolId =
  | "image-convert"
  | "image-transform"
  | "image-metadata"
  | "images-pdf"
  | "pdf-merge"
  | "pdf-split"
  | "pdf-pages"
  | "pdf-decorate"
  | "media-trim"
  | "video-mute"
  | "video-frame"
  | "video-gif"
  | "audio-enhance"
  | "ocr";

export type LocalToolOutput = {
  name: string;
  blob: Blob;
  folder?: string;
  savedPath?: string;
};

export type LocalToolStatus = "idle" | "running" | "done" | "error" | "cancelled";

type TauriApi = {
  dialog?: {
    open(options: { directory: true; multiple: false; recursive: true; title: string }): Promise<string | string[] | null>;
  };
  fs?: {
    createDir(path: string, options: { recursive: boolean }): Promise<void>;
    writeBinaryFile(file: { path: string; contents: Uint8Array }): Promise<void>;
  };
};

type UseLocalToolControllerOptions = {
  desktop: boolean;
  tool: LocalToolId;
  imageFormat: ExportImageFormat;
  imageQuality: number;
  rotation: 0 | 90 | 180 | 270;
  flipHorizontal: boolean;
  flipVertical: boolean;
  pdfPageMode: "a4" | "image-size";
  pageSelection: string;
  pdfSplitMode: "files" | "merged";
  pageOrder: string;
  rotatePages: string;
  pdfRotation: 0 | 90 | 180 | 270;
  watermarkText: string;
  watermarkKind: "text" | "image";
  watermarkImage: File | null;
  watermarkPosition: PdfWatermarkPosition;
  watermarkRotation: number;
  watermarkScale: number;
  watermarkColor: string;
  watermarkOpacity: number;
  watermarkSize: number;
  pageNumberEnabled: boolean;
  pageNumberPosition: PdfPageNumberPosition;
  headerText: string;
  footerText: string;
  startTime: number;
  setStartTime: (value: number) => void;
  endTime: number;
  setEndTime: (value: number) => void;
  trimMode: "fast" | "precise";
  videoFormat: VideoOutputFormat;
  audioFormat: AudioOutputFormat;
  frameFormat: ExportImageFormat;
  frameBatch: boolean;
  frameInterval: number;
  gifWidth: number;
  gifFps: number;
  audioMode: "trim" | "concat" | "enhance";
  volume: number;
  fadeIn: number;
  fadeOut: number;
  ocrLanguage: OcrLanguage;
  onDesktopLicenseStatusChange: (status: DesktopLicenseStatus) => void;
};

const desktopBuildMode = process.env.NEXT_PUBLIC_APP_MODE === "desktop";

async function loadDesktopLicenseApi() {
  if (!desktopBuildMode) return null;
  return import("@/lib/desktopLicense");
}

export function useLocalToolController(options: UseLocalToolControllerOptions) {
  const {
    desktop,
    tool,
    imageFormat,
    imageQuality,
    rotation,
    flipHorizontal,
    flipVertical,
    pdfPageMode,
    pageSelection,
    pdfSplitMode,
    pageOrder,
    rotatePages,
    pdfRotation,
    watermarkText,
    watermarkKind,
    watermarkImage,
    watermarkPosition,
    watermarkRotation,
    watermarkScale,
    watermarkColor,
    watermarkOpacity,
    watermarkSize,
    pageNumberEnabled,
    pageNumberPosition,
    headerText,
    footerText,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    trimMode,
    videoFormat,
    audioFormat,
    frameFormat,
    frameBatch,
    frameInterval,
    gifWidth,
    gifFps,
    audioMode,
    volume,
    fadeIn,
    fadeOut,
    ocrLanguage,
    onDesktopLicenseStatusChange
  } = options;
  const abortRef = useRef<AbortController | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [outputs, setOutputs] = useState<LocalToolOutput[]>([]);
  const [status, setStatus] = useState<LocalToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("等待选择文件");
  const [error, setError] = useState("");
  const [outputRoot, setOutputRoot] = useState("");
  const [metadata, setMetadata] = useState<ImageMetadataSummary | null>(null);
  const [mediaDuration, setMediaDuration] = useState(0);

  const multiple = supportsMultipleFiles(tool, desktop, audioMode);
  const accept = acceptForTool(tool);
  const requiresDesktopFolder = desktop && (
    files.length > 1
    || (tool === "pdf-split" && pdfSplitMode === "files")
    || (tool === "ocr" && files.some((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")))
    || (tool === "video-frame" && frameBatch)
  );

  function resetToolState() {
    abortRef.current?.abort();
    abortRef.current = null;
    setFiles([]);
    setOutputs([]);
    setMetadata(null);
    setMediaDuration(0);
    setStatus("idle");
    setProgress(0);
    setMessage("等待选择文件");
    setError("");
  }

  async function handleFiles(list: FileList | File[] | null) {
    const selected = list ? Array.from(list) : [];
    if (!selected.length) return;
    const accepted = multiple ? selected : selected.slice(0, 1);
    setFiles(accepted);
    setOutputs([]);
    setError("");
    setStatus("idle");
    setMessage(`已选择 ${accepted.length} 个本地文件`);
    if (tool === "image-metadata") {
      try {
        setMetadata(await readImageMetadata(accepted[0]));
      } catch (reason) {
        setMetadata(null);
        setError(friendlyLocalToolError(reason));
      }
    }
    if (isMediaTool(tool) || tool === "audio-enhance") {
      try {
        const duration = await readMediaDuration(accepted[0]);
        setMediaDuration(duration);
        setStartTime(0);
        setEndTime(Math.min(duration, tool === "video-gif" ? 5 : duration));
      } catch {
        setMediaDuration(0);
      }
    }
  }

  async function selectOutputFolder() {
    setError("");
    const tauri = getTauriApi();
    if (tauri?.dialog?.open) {
      const selected = await tauri.dialog.open({
        directory: true,
        multiple: false,
        recursive: true,
        title: "选择新增工具输出目录"
      });
      if (typeof selected === "string" && selected) {
        setOutputRoot(selected);
        setMessage(`输出目录：${selected}`);
      }
      return;
    }
    setError("离线批量输出需要在桌面程序中选择本地文件夹。");
  }

  async function run() {
    if (!files.length) {
      setError("请先选择文件。");
      return;
    }
    if (requiresDesktopFolder && !outputRoot) {
      setError("离线批量或多页任务必须先选择输出目录。");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("running");
    setProgress(0);
    setError("");
    setOutputs([]);
    try {
      if (desktop) {
        const api = await loadDesktopLicenseApi();
        if (api?.hasDesktopLicenseApi()) {
          const nextStatus = await api.getDesktopLicenseStatus({ force: true });
          onDesktopLicenseStatusChange(nextStatus);
          if (!nextStatus.allowed) throw new Error(nextStatus.reason || "当前授权状态不可用。");
        }
      }
      const nextOutputs = await executeTool(controller.signal);
      const saved = desktop && nextOutputs.length
        ? await saveDesktopOutputs(nextOutputs, outputRoot)
        : nextOutputs;
      setOutputs(saved);
      setProgress(1);
      setStatus("done");
      setMessage(saved.some((item) => item.savedPath) ? "处理完成，结果已写入本地输出文件夹" : "处理完成，可以下载结果");
    } catch (reason) {
      const cancelled = controller.signal.aborted;
      setStatus(cancelled ? "cancelled" : "error");
      setError(cancelled ? "任务已取消。" : friendlyLocalToolError(reason));
      setMessage(cancelled ? "已取消当前本地任务" : "处理失败");
    } finally {
      abortRef.current = null;
    }
  }

  async function executeTool(signal: AbortSignal): Promise<LocalToolOutput[]> {
    const first = files[0];
    const report = (value: number, text?: string) => {
      setProgress(value);
      if (text) setMessage(text);
    };
    switch (tool) {
      case "image-convert": {
        const results: LocalToolOutput[] = [];
        for (const [index, file] of files.entries()) {
          ensureActive(signal);
          results.push({
            name: fileNameWithSuffix(file.name, "converted", imageFormat),
            blob: await convertImage(file, { format: imageFormat, quality: imageQuality / 100 })
          });
          report((index + 1) / files.length, `已转换 ${index + 1}/${files.length} 张图片`);
        }
        return results;
      }
      case "image-transform": {
        const result = await transformImage(first, {
          rotation,
          flipHorizontal,
          flipVertical,
          format: imageFormat,
          quality: imageQuality / 100
        });
        return [{ name: fileNameWithSuffix(first.name, "transformed", imageFormat), blob: result.blob }];
      }
      case "image-metadata": {
        const results: LocalToolOutput[] = [];
        for (const [index, file] of files.entries()) {
          ensureActive(signal);
          results.push({
            name: fileNameWithSuffix(file.name, "metadata-clean", imageFormat),
            blob: await stripImageMetadata(file, { format: imageFormat, quality: imageQuality / 100 })
          });
          report((index + 1) / files.length, `已清理 ${index + 1}/${files.length} 张图片`);
        }
        return results;
      }
      case "images-pdf":
        return [{
          name: `${safeBaseName(first.name)}_images.pdf`,
          blob: await imagesToPdf(files, { pageMode: pdfPageMode })
        }];
      case "pdf-merge":
        return [{ name: "merged.pdf", blob: await mergePdfFiles(files) }];
      case "pdf-split": {
        const total = await getPdfPageCount(first);
        const pages = parsePageSelection(pageSelection, total);
        if (!pages.length) throw new Error("页码范围无效。");
        if (pdfSplitMode === "merged") {
          return [{
            name: `${safeBaseName(first.name)}_selected.pdf`,
            blob: await extractPdfPages(first, pages)
          }];
        }
        const split = await splitPdfPages(first, pages);
        return split.map((item) => ({
          name: `${safeBaseName(first.name)}_${String(item.pageNumber).padStart(3, "0")}.pdf`,
          blob: item.blob,
          folder: safeBaseName(first.name)
        }));
      }
      case "pdf-pages": {
        const total = await getPdfPageCount(first);
        const order = parseOrderedPages(pageOrder, total);
        const selectedForRotation = rotatePages.trim() ? parsePageSelection(rotatePages, total) : [];
        const rotations = Object.fromEntries(selectedForRotation.map((page) => [page, pdfRotation])) as Record<number, 0 | 90 | 180 | 270>;
        return [{
          name: `${safeBaseName(first.name)}_pages.pdf`,
          blob: await rearrangePdfPages(first, { pageOrder: order, rotations })
        }];
      }
      case "pdf-decorate": {
        const total = await getPdfPageCount(first);
        const pages = parsePageSelection(pageSelection, total);
        const watermark = watermarkKind === "text"
          ? watermarkText.trim()
            ? {
                kind: "text" as const,
                text: watermarkText.trim(),
                opacity: watermarkOpacity / 100,
                size: watermarkSize,
                color: watermarkColor,
                rotation: watermarkRotation,
                position: watermarkPosition
              }
            : undefined
          : watermarkImage
            ? {
                kind: "image" as const,
                image: watermarkImage,
                opacity: watermarkOpacity / 100,
                scale: watermarkScale / 100,
                rotation: watermarkRotation,
                position: watermarkPosition
              }
            : undefined;
        if (watermarkKind === "image" && !watermarkImage) {
          throw new Error("请选择水印图片。");
        }
        return [{
          name: `${safeBaseName(first.name)}_decorated.pdf`,
          blob: await decoratePdf(first, {
            pages,
            watermark,
            pageNumber: pageNumberEnabled ? { position: pageNumberPosition, startAt: 1 } : undefined,
            header: headerText,
            footer: footerText
          })
        }];
      }
      case "media-trim": {
        const kind = first.type.startsWith("audio/") ? "audio" : "video";
        const format = kind === "video" ? videoFormat : audioFormat;
        const blob = await trimMedia(first, {
          start: startTime,
          end: endTime,
          totalDuration: mediaDuration || undefined,
          kind,
          mode: trimMode,
          outputFormat: format,
          signal,
          onProgress: report
        });
        return [{ name: `${safeBaseName(first.name)}_trimmed.${format}`, blob }];
      }
      case "video-mute":
        return [{
          name: `${safeBaseName(first.name)}_muted.${videoFormat}`,
          blob: await muteVideo(first, { format: videoFormat, signal, onProgress: report })
        }];
      case "video-frame": {
        if (!desktop || !frameBatch) {
          return [{
            name: `${safeBaseName(first.name)}_${formatTimeForName(startTime)}.${frameFormat}`,
            blob: await captureVideoFrame(first, { time: startTime, format: frameFormat, quality: imageQuality / 100 })
          }];
        }
        if (!mediaDuration) throw new Error("无法读取视频时长，不能执行间隔截图。");
        if (!Number.isFinite(frameInterval) || frameInterval <= 0) throw new Error("截图间隔必须大于 0 秒。");
        const frameCount = Math.ceil(mediaDuration / frameInterval);
        if (frameCount > 500) throw new Error("一次最多导出 500 张截图，请增大截图间隔。");
        const frames: LocalToolOutput[] = [];
        for (let index = 0; index < frameCount; index += 1) {
          ensureActive(signal);
          const time = Math.min(index * frameInterval, Math.max(0, mediaDuration - 0.01));
          frames.push({
            name: `${safeBaseName(first.name)}_${String(index + 1).padStart(3, "0")}_${formatTimeForName(time)}.${frameFormat}`,
            blob: await captureVideoFrame(first, { time, format: frameFormat, quality: imageQuality / 100 }),
            folder: safeBaseName(first.name)
          });
          report((index + 1) / frameCount, `已提取 ${index + 1}/${frameCount} 帧`);
        }
        return frames;
      }
      case "video-gif":
        return [{
          name: `${safeBaseName(first.name)}.gif`,
          blob: await videoToGif(first, {
            start: startTime,
            end: endTime,
            totalDuration: mediaDuration || undefined,
            width: gifWidth,
            fps: gifFps,
            signal,
            onProgress: report
          })
        }];
      case "audio-enhance": {
        if (audioMode === "concat") {
          return [{
            name: `audio_joined.${audioFormat}`,
            blob: await concatAudioFiles(files, { format: audioFormat, signal, onProgress: report })
          }];
        }
        if (audioMode === "trim") {
          return [{
            name: `${safeBaseName(first.name)}_trimmed.${audioFormat}`,
            blob: await trimMedia(first, {
              start: startTime,
              end: endTime,
              totalDuration: mediaDuration || undefined,
              kind: "audio",
              mode: trimMode,
              outputFormat: audioFormat,
              signal,
              onProgress: report
            })
          }];
        }
        return [{
          name: `${safeBaseName(first.name)}_enhanced.${audioFormat}`,
          blob: await enhanceAudio(first, {
            format: audioFormat,
            volume,
            fadeIn,
            fadeOut,
            duration: mediaDuration,
            signal,
            onProgress: report
          })
        }];
      }
      case "ocr": {
        const results: LocalToolOutput[] = [];
        for (const [index, file] of files.entries()) {
          ensureActive(signal);
          const document = await recognizeLocalDocument(file, {
            language: ocrLanguage,
            signal,
            onProgress: (value, text) => report((index + value) / files.length, text)
          });
          if (!document.pages.some((page) => page.text.trim() || page.layout?.some((box) => box.text.trim()))) {
            throw new Error("未识别到可导出的文字，请检查图片清晰度、页面方向或识别语言后重试。");
          }
          const base = safeBaseName(file.name);
          const blob = await exportEditableOcrWord(document.pages);
          results.push({
            name: `${base}_ocr.docx`,
            blob,
            folder: files.length > 1 || file.type === "application/pdf" ? base : undefined
          });
        }
        return results;
      }
    }
    throw new Error("未知工具。");
  }

  function cancel() {
    abortRef.current?.abort();
  }

  function clear() {
    abortRef.current?.abort();
    setFiles([]);
    setOutputs([]);
    setMetadata(null);
    setStatus("idle");
    setProgress(0);
    setError("");
    setMessage("等待选择文件");
  }


  return {
    files,
    setFiles,
    outputs,
    status,
    progress,
    message,
    error,
    outputRoot,
    metadata,
    mediaDuration,
    multiple,
    accept,
    resetToolState,
    handleFiles,
    reportError: (reason: unknown) => setError(friendlyLocalToolError(reason)),
    selectOutputFolder,
    run,
    cancel,
    clear
  };
}

function supportsMultipleFiles(tool: LocalToolId, desktop: boolean, audioMode: "trim" | "concat" | "enhance") {
  if (tool === "images-pdf" || tool === "pdf-merge") return true;
  if (tool === "audio-enhance") return audioMode === "concat";
  if (tool === "ocr" || tool === "image-convert" || tool === "image-metadata") return desktop;
  return false;
}

function acceptForTool(tool: LocalToolId) {
  if (tool.startsWith("image-") || tool === "images-pdf") return imageAccept;
  if (tool.startsWith("pdf-")) return pdfAccept;
  if (tool === "ocr") return `${imageAccept},${pdfAccept}`;
  if (tool === "audio-enhance") return audioAccept;
  if (tool === "media-trim") return `${videoAccept},${audioAccept}`;
  return videoAccept;
}

function isMediaTool(tool: LocalToolId) {
  return tool === "media-trim" || tool === "video-mute" || tool === "video-frame" || tool === "video-gif";
}

function parseOrderedPages(value: string, total: number) {
  const pages = value.split(",").map((item) => Number(item.trim())).filter((item) => Number.isInteger(item));
  if (!pages.length) throw new Error("请输入页面顺序，例如 3,1,2。");
  if (pages.some((page) => page < 1 || page > total)) throw new Error(`页面顺序超出范围 1-${total}。`);
  if (new Set(pages).size !== pages.length) throw new Error("页面顺序不能包含重复页码。");
  return pages;
}

async function readMediaDuration(file: File) {
  const url = URL.createObjectURL(file);
  const media = document.createElement(file.type.startsWith("audio/") ? "audio" : "video");
  media.preload = "metadata";
  try {
    const loaded = new Promise<void>((resolve, reject) => {
      media.onloadedmetadata = () => resolve();
      media.onerror = () => reject(new Error("无法读取媒体时长。"));
    });
    media.src = url;
    await loaded;
    return Number.isFinite(media.duration) ? media.duration : 0;
  } finally {
    media.removeAttribute("src");
    media.load();
    URL.revokeObjectURL(url);
  }
}

async function saveDesktopOutputs(outputs: LocalToolOutput[], outputRoot: string) {
  if (!outputRoot) return outputs;
  const tauri = getTauriApi();
  if (!tauri?.fs?.createDir || !tauri.fs.writeBinaryFile) {
    throw new Error("当前离线环境无法写入输出目录。");
  }
  const batchRoot = joinLocalPath(outputRoot, batchFolderName());
  await tauri.fs.createDir(batchRoot, { recursive: true });
  const saved: LocalToolOutput[] = [];
  for (const item of outputs) {
    const directory = item.folder ? joinLocalPath(batchRoot, item.folder) : batchRoot;
    await tauri.fs.createDir(directory, { recursive: true });
    const path = joinLocalPath(directory, item.name);
    await tauri.fs.writeBinaryFile({ path, contents: await readBlobBytes(item.blob) });
    saved.push({ ...item, savedPath: path });
  }
  return saved;
}

function getTauriApi(): TauriApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { __TAURI__?: TauriApi }).__TAURI__;
}

async function readBlobBytes(blob: Blob): Promise<Uint8Array> {
  const modernBlob = blob as Blob & { arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof modernBlob.arrayBuffer === "function") {
    return new Uint8Array(await modernBlob.arrayBuffer());
  }
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("读取本地结果失败。"));
    reader.onload = () => reader.result instanceof ArrayBuffer
      ? resolve(reader.result)
      : reject(new Error("读取本地结果失败。"));
    reader.readAsArrayBuffer(blob);
  });
  return new Uint8Array(buffer);
}

function joinLocalPath(directory: string, name: string) {
  const separator = directory.includes("\\") ? "\\" : "/";
  return `${directory.replace(/[\\/]+$/, "")}${separator}${sanitizeWindowsPathSegment(name)}`;
}

function batchFolderName(now = new Date()) {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "_",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");
  return `万能格式转换器_新增工具结果_${stamp}`;
}

function formatTimeForName(seconds: number) {
  return `${Math.max(0, Math.round(seconds * 1000))}ms`;
}

function ensureActive(signal: AbortSignal) {
  if (signal.aborted) throw new Error("任务已取消。");
}

export function friendlyLocalToolError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason || "");
  if (/password|encrypt/i.test(message)) return "PDF 已加密，不能绕过密码保护。";
  if (/memory|allocation/i.test(message)) return "本机可用内存不足，请减少文件数量、缩短媒体片段或改用离线版。";
  if (/cancel|abort/i.test(message)) return "任务已取消。";
  return message || "处理失败，请检查文件后重试。";
}
