"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Download,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileAudio,
  FileImage,
  FilePlus2,
  FileText,
  HardDrive,
  HeartHandshake,
  Loader2,
  Play,
  ShieldCheck,
  Square,
  Trash2
} from "lucide-react";
import Link from "next/link";
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
import type {
  PdfPageNumberPosition,
  PdfWatermarkPosition
} from "@doctool/pdf-core";
import {
  captureVideoFrame,
  concatAudioFiles,
  enhanceAudio,
  muteVideo,
  trimMedia,
  videoToGif
} from "@doctool/media-core";
import type {
  AudioOutputFormat,
  VideoOutputFormat
} from "@doctool/media-core";
import {
  createOcrTextBlob,
  exportEditableOcrWord,
  exportImageOcrWord,
  recognizeLocalDocument
} from "@doctool/ocr-core";
import type { OcrLanguage } from "@doctool/ocr-core";
import {
  audioAccept,
  fileNameWithSuffix,
  formatBytes,
  imageAccept,
  pdfAccept,
  safeBaseName,
  videoAccept
} from "@doctool/shared";
import type { ExportImageFormat } from "@doctool/shared";
import { isDesktopApp } from "@/config/appMode";
import { currentReleaseVersion } from "@/config/version";
import { MatrixLogo } from "@/components/layout/MatrixLogo";
import { SupportDialog } from "@/components/support/SupportDialog";
import { UnifiedDesktopSidebar, UnifiedToolDialog } from "@/components/tools/UnifiedToolCatalog";
import { getUnifiedToolCategory, getUnifiedToolHref } from "@/config/toolCatalog";
import type { UnifiedToolItem } from "@/config/toolCatalog";
import type { DesktopLicenseStatus } from "@/lib/desktopLicense";

type LocalToolId =
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

type OutputItem = {
  name: string;
  blob: Blob;
  folder?: string;
  savedPath?: string;
};

type TauriApi = {
  dialog?: {
    open(options: { directory: true; multiple: false; title: string }): Promise<string | string[] | null>;
  };
  fs?: {
    createDir(path: string, options: { recursive: boolean }): Promise<void>;
    writeBinaryFile(file: { path: string; contents: Uint8Array }): Promise<void>;
  };
};

const tools: Array<{
  id: LocalToolId;
  group: string;
  label: string;
  description: string;
}> = [
  { id: "image-convert", group: "图片工具", label: "图片格式转换", description: "JPG、PNG、WebP、BMP 转 JPG、PNG、WebP" },
  { id: "image-transform", group: "图片工具", label: "旋转与翻转", description: "90°、180°旋转以及水平、垂直翻转" },
  { id: "image-metadata", group: "图片工具", label: "EXIF 查看与清理", description: "查看常用拍摄信息并清除全部元数据" },
  { id: "images-pdf", group: "PDF 工具", label: "图片合成 PDF", description: "每张图片生成一页，支持 A4 适配" },
  { id: "pdf-merge", group: "PDF 工具", label: "PDF 合并", description: "按照文件列表顺序合并多个 PDF" },
  { id: "pdf-split", group: "PDF 工具", label: "PDF 拆分与提取", description: "按页码拆分，或把选定页合并为新 PDF" },
  { id: "pdf-pages", group: "PDF 工具", label: "PDF 页面管理", description: "重新排序、删除未选页并旋转页面" },
  { id: "pdf-decorate", group: "PDF 工具", label: "PDF 水印与页码", description: "文字水印、页码、页眉和页脚" },
  { id: "media-trim", group: "音视频工具", label: "音视频裁剪", description: "快速复制或精确重新编码片段" },
  { id: "video-mute", group: "音视频工具", label: "视频静音", description: "移除全部音轨并保留视频画面" },
  { id: "video-frame", group: "音视频工具", label: "视频截图", description: "从指定时间点导出 JPG、PNG 或 WebP" },
  { id: "video-gif", group: "音视频工具", label: "视频转 GIF", description: "设置起止时间、宽度和帧率" },
  { id: "audio-enhance", group: "音视频工具", label: "音频编辑", description: "裁剪、顺序拼接、音量和淡入淡出" },
  { id: "ocr", group: "OCR 工具", label: "图片 / PDF 文字识别", description: "中文、英文、中英混合，导出 TXT 或 Word" }
];

type DesktopLicenseGateComponent = ComponentType<{
  status: DesktopLicenseStatus;
  onStatusChange: (status: DesktopLicenseStatus) => void;
}>;

const desktopBuildMode = process.env.NEXT_PUBLIC_APP_MODE === "desktop";

async function loadDesktopLicenseApi() {
  if (!desktopBuildMode) return null;
  return import("@/lib/desktopLicense");
}

async function loadLicenseGateComponent(): Promise<DesktopLicenseGateComponent | null> {
  if (!desktopBuildMode) return null;
  const mod = await import("@/components/tools/LicenseGate");
  return mod.LicenseGate;
}

export function LocalToolsClient({ surface = isDesktopApp ? "desktop" : "web" }: { surface?: "desktop" | "web" }) {
  const desktop = surface === "desktop";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [tool, setTool] = useState<LocalToolId>("image-convert");
  const [files, setFiles] = useState<File[]>([]);
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error" | "cancelled">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("等待选择文件");
  const [error, setError] = useState("");
  const [outputRoot, setOutputRoot] = useState("");
  const [metadata, setMetadata] = useState<ImageMetadataSummary | null>(null);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [desktopLicenseStatus, setDesktopLicenseStatus] = useState<DesktopLicenseStatus | null>(null);
  const [desktopLicenseGate, setDesktopLicenseGate] = useState<DesktopLicenseGateComponent | null>(null);
  const [isToolSwitching, startToolTransition] = useTransition();

  const [imageFormat, setImageFormat] = useState<ExportImageFormat>("jpg");
  const [imageQuality, setImageQuality] = useState(90);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(90);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [pdfPageMode, setPdfPageMode] = useState<"a4" | "image-size">("a4");
  const [pageSelection, setPageSelection] = useState("all");
  const [pdfSplitMode, setPdfSplitMode] = useState<"files" | "merged">("files");
  const [pageOrder, setPageOrder] = useState("1");
  const [rotatePages, setRotatePages] = useState("");
  const [pdfRotation, setPdfRotation] = useState<0 | 90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState("LOCAL");
  const [watermarkKind, setWatermarkKind] = useState<"text" | "image">("text");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkPosition, setWatermarkPosition] = useState<PdfWatermarkPosition>("center");
  const [watermarkRotation, setWatermarkRotation] = useState(-35);
  const [watermarkScale, setWatermarkScale] = useState(25);
  const [watermarkColor, setWatermarkColor] = useState("#64748b");
  const [watermarkOpacity, setWatermarkOpacity] = useState(25);
  const [watermarkSize, setWatermarkSize] = useState(42);
  const [pageNumberEnabled, setPageNumberEnabled] = useState(true);
  const [pageNumberPosition, setPageNumberPosition] = useState<PdfPageNumberPosition>("bottom-center");
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [trimMode, setTrimMode] = useState<"fast" | "precise">("fast");
  const [videoFormat, setVideoFormat] = useState<VideoOutputFormat>("mp4");
  const [audioFormat, setAudioFormat] = useState<AudioOutputFormat>("mp3");
  const [frameFormat, setFrameFormat] = useState<ExportImageFormat>("png");
  const [frameBatch, setFrameBatch] = useState(false);
  const [frameInterval, setFrameInterval] = useState(5);
  const [gifWidth, setGifWidth] = useState(480);
  const [gifFps, setGifFps] = useState(12);
  const [audioMode, setAudioMode] = useState<"trim" | "concat" | "enhance">("enhance");
  const [volume, setVolume] = useState(1);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>("chi_sim+eng");
  const [ocrExport, setOcrExport] = useState<"txt" | "editable-word" | "image-word">("txt");

  useEffect(() => {
    const applyToolFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedTool = params.get("tool") as LocalToolId | null;
      if (requestedTool && tools.some((item) => item.id === requestedTool)) {
        resetToolState();
        setTool(requestedTool);
      }
      if (params.get("catalog") === "1") setCatalogOpen(true);
    };
    applyToolFromUrl();
    window.addEventListener("popstate", applyToolFromUrl);
    return () => window.removeEventListener("popstate", applyToolFromUrl);
  }, []);

  useEffect(() => {
    if (!desktop) {
      setDesktopLicenseStatus(null);
      setDesktopLicenseGate(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const api = await loadDesktopLicenseApi();
        const Gate = await loadLicenseGateComponent();
        if (cancelled) return;
        if (!api || !Gate || !api.hasDesktopLicenseApi()) {
          setDesktopLicenseStatus(null);
          setDesktopLicenseGate(null);
          return;
        }
        setDesktopLicenseGate(() => Gate);
        const nextStatus = await api.getDesktopLicenseStatus();
        if (!cancelled) setDesktopLicenseStatus(nextStatus);
      } catch {
        if (!cancelled) {
          setDesktopLicenseStatus(null);
          setDesktopLicenseGate(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [desktop]);

  const currentTool = useMemo(() => tools.find((item) => item.id === tool) || tools[0], [tool]);
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

  function selectDesktopTool(nextTool: UnifiedToolItem) {
    if (!desktop || nextTool.route !== "local-tools" || !tools.some((item) => item.id === nextTool.id)) return false;
    startToolTransition(() => {
      resetToolState();
      setTool(nextTool.id as LocalToolId);
    });
    window.history.pushState({}, "", getUnifiedToolHref(nextTool));
    return true;
  }

  async function handleFiles(list: FileList | null) {
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
        setError(friendlyError(reason));
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
          setDesktopLicenseStatus(nextStatus);
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
      setError(cancelled ? "任务已取消。" : friendlyError(reason));
      setMessage(cancelled ? "已取消当前本地任务" : "处理失败");
    } finally {
      abortRef.current = null;
    }
  }

  async function executeTool(signal: AbortSignal): Promise<OutputItem[]> {
    const first = files[0];
    const report = (value: number, text?: string) => {
      setProgress(value);
      if (text) setMessage(text);
    };
    switch (tool) {
      case "image-convert": {
        const results: OutputItem[] = [];
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
        const results: OutputItem[] = [];
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
        const frames: OutputItem[] = [];
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
        const results: OutputItem[] = [];
        for (const [index, file] of files.entries()) {
          ensureActive(signal);
          const document = await recognizeLocalDocument(file, {
            language: ocrLanguage,
            includePageImages: ocrExport === "image-word",
            signal,
            onProgress: (value, text) => report((index + value) / files.length, text)
          });
          const base = safeBaseName(file.name);
          const blob = ocrExport === "txt"
            ? createOcrTextBlob(document.pages)
            : ocrExport === "editable-word"
              ? await exportEditableOcrWord(document.pages)
              : await exportImageOcrWord(document.pages);
          results.push({
            name: `${base}_ocr.${ocrExport === "txt" ? "txt" : "docx"}`,
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

  const toolControls = (
    <ToolControls
      tool={tool}
      imageFormat={imageFormat} setImageFormat={setImageFormat}
      imageQuality={imageQuality} setImageQuality={setImageQuality}
      rotation={rotation} setRotation={setRotation}
      flipHorizontal={flipHorizontal} setFlipHorizontal={setFlipHorizontal}
      flipVertical={flipVertical} setFlipVertical={setFlipVertical}
      pdfPageMode={pdfPageMode} setPdfPageMode={setPdfPageMode}
      pageSelection={pageSelection} setPageSelection={setPageSelection}
      pdfSplitMode={pdfSplitMode} setPdfSplitMode={setPdfSplitMode}
      pageOrder={pageOrder} setPageOrder={setPageOrder}
      rotatePages={rotatePages} setRotatePages={setRotatePages}
      pdfRotation={pdfRotation} setPdfRotation={setPdfRotation}
      watermarkText={watermarkText} setWatermarkText={setWatermarkText}
      watermarkKind={watermarkKind} setWatermarkKind={setWatermarkKind}
      watermarkImage={watermarkImage} setWatermarkImage={setWatermarkImage}
      watermarkPosition={watermarkPosition} setWatermarkPosition={setWatermarkPosition}
      watermarkRotation={watermarkRotation} setWatermarkRotation={setWatermarkRotation}
      watermarkScale={watermarkScale} setWatermarkScale={setWatermarkScale}
      watermarkColor={watermarkColor} setWatermarkColor={setWatermarkColor}
      watermarkOpacity={watermarkOpacity} setWatermarkOpacity={setWatermarkOpacity}
      watermarkSize={watermarkSize} setWatermarkSize={setWatermarkSize}
      pageNumberEnabled={pageNumberEnabled} setPageNumberEnabled={setPageNumberEnabled}
      pageNumberPosition={pageNumberPosition} setPageNumberPosition={setPageNumberPosition}
      headerText={headerText} setHeaderText={setHeaderText}
      footerText={footerText} setFooterText={setFooterText}
      startTime={startTime} setStartTime={setStartTime}
      endTime={endTime} setEndTime={setEndTime}
      mediaDuration={mediaDuration}
      trimMode={trimMode} setTrimMode={setTrimMode}
      videoFormat={videoFormat} setVideoFormat={setVideoFormat}
      audioFormat={audioFormat} setAudioFormat={setAudioFormat}
      frameFormat={frameFormat} setFrameFormat={setFrameFormat}
      frameBatch={frameBatch} setFrameBatch={setFrameBatch}
      frameInterval={frameInterval} setFrameInterval={setFrameInterval}
      gifWidth={gifWidth} setGifWidth={setGifWidth}
      gifFps={gifFps} setGifFps={setGifFps}
      audioMode={audioMode} setAudioMode={setAudioMode}
      volume={volume} setVolume={setVolume}
      fadeIn={fadeIn} setFadeIn={setFadeIn}
      fadeOut={fadeOut} setFadeOut={setFadeOut}
      ocrLanguage={ocrLanguage} setOcrLanguage={setOcrLanguage}
      ocrExport={ocrExport} setOcrExport={setOcrExport}
      desktop={desktop}
    />
  );

  if (desktop && desktopLicenseStatus && !desktopLicenseStatus.allowed) {
    if (!desktopLicenseGate) {
      return (
        <main className="desktop-a-license-loading">
          <Loader2 className="animate-spin" aria-hidden="true" size={20} />
          正在加载激活面板…
        </main>
      );
    }
    const LicenseGateComponent = desktopLicenseGate;
    return <LicenseGateComponent status={desktopLicenseStatus} onStatusChange={setDesktopLicenseStatus} />;
  }

  if (desktop) {
    return (
      <>
        <main className={`desktop-a-shell desktop-a-local-tools${isToolSwitching ? " is-tool-switching" : ""}`} aria-busy={isToolSwitching}>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(event) => {
              void handleFiles(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
          <header className="desktop-a-titlebar">
            <div className="desktop-a-brand">
              <MatrixLogo />
              <div>
                <strong>万能格式转换器</strong>
                <span>离线专业版 · v{currentReleaseVersion} · 本地处理</span>
              </div>
            </div>
            <div className="desktop-a-title-actions">
              <button type="button" onClick={() => inputRef.current?.click()}>
                <FilePlus2 aria-hidden="true" size={15} />添加文件
              </button>
              <button type="button" onClick={clear}>
                <Trash2 aria-hidden="true" size={14} />清空
              </button>
              <button className="desktop-a-current-tool" type="button" onClick={() => setCatalogOpen(true)}>
                {getUnifiedToolCategory(tool)?.label} / {currentTool.label}
              </button>
            </div>
            <div className="desktop-a-output">
              <span title={outputRoot || "尚未选择输出目录"}>输出到：{outputRoot || "请选择输出目录"}</span>
              <button type="button" onClick={() => void selectOutputFolder()}>浏览</button>
              <button className="primary" type="button" disabled={!files.length || status === "running"} onClick={() => void run()}>
                {status === "running" ? <Loader2 className="animate-spin" aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
                开始处理
              </button>
              <button className="danger" type="button" disabled={status !== "running"} onClick={cancel}>
                <Square aria-hidden="true" size={14} />停止
              </button>
            </div>
          </header>

          <div className="desktop-a-body">
            <UnifiedDesktopSidebar currentToolId={tool} onSelectTool={selectDesktopTool} />
            <section className="desktop-a-task-canvas">
              <header>
                <div>
                  <h1>任务画布{files.length ? `（${files.length}）` : ""}</h1>
                  <p>{currentTool.label} · {currentTool.description}</p>
                </div>
              </header>
              <div className="desktop-a-local-canvas">
                {files.length ? (
                  <div className="local-toolkit-file-grid" aria-label="已选文件预览">
                    {files.map((file) => (
                      <LocalFilePreview file={file} key={`${file.name}-${file.size}-${file.lastModified}`} />
                    ))}
                  </div>
                ) : (
                  <button className="desktop-a-empty" type="button" onClick={() => inputRef.current?.click()}>
                    <FileImage aria-hidden="true" size={26} />
                    <strong>添加要处理的文件</strong>
                    <span>{multiple ? "可以一次选择多个文件" : "当前工具每次处理一个文件"}</span>
                  </button>
                )}
                {metadata ? <MetadataView metadata={metadata} /> : null}
                <OutputList outputs={outputs} />
              </div>
            </section>
            <aside className="desktop-a-inspector">
              <header>
                <p>当前工具</p>
                <h2>{currentTool.label}</h2>
              </header>
              <div className="desktop-a-control-panel">{toolControls}</div>
              <div className="desktop-a-output-panel">
                <label>输出目录</label>
                <button type="button" title={outputRoot || "尚未选择输出目录"} onClick={() => void selectOutputFolder()}>
                  <HardDrive aria-hidden="true" size={15} />
                  <span>{outputRoot || "选择输出目录"}</span>
                </button>
              </div>
              <button className="desktop-a-support" type="button" onClick={() => setSupportOpen(true)}>
                <HeartHandshake aria-hidden="true" size={15} />支持作者
              </button>
              {error ? <p className="desktop-a-error">处理失败：{error}</p> : null}
            </aside>
          </div>
          <footer className="desktop-a-statusbar" aria-live="polite">
            <div className="desktop-a-total-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            <span>总进度 {Math.round(progress * 100)}%</span>
            <span>{message}</span>
            <span>任务 {files.length}</span>
            <span>结果 {outputs.length}</span>
            <span>本地授权：{desktopLicenseStatus?.mode === "trial" ? "试用中" : "已授权"}</span>
          </footer>
        </main>
        <SupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} desktop />
        <UnifiedToolDialog open={catalogOpen} currentToolId={tool} desktop onSelectTool={selectDesktopTool} onClose={() => setCatalogOpen(false)} />
      </>
    );
  }

  return (
    <>
      <main className="a2-online-tools a2-local-tools-page">
        <section className="a2-tool-shell">
          <header className="a2-tool-header">
            <div>
              <nav className="a2-tool-breadcrumb" aria-label="面包屑">
                <Link href="/tools">在线工具</Link><ChevronRight aria-hidden="true" size={12} />
                <span>{getUnifiedToolCategory(tool)?.label}</span><ChevronRight aria-hidden="true" size={12} />
                <span>{currentTool.label}</span>
              </nav>
              <h1>{currentTool.label}</h1>
              <span>{currentTool.description}。文件只在当前设备处理，不上传服务器。</span>
            </div>
            <div className="a2-tool-header-actions">
              <span className="a2-local-status"><ShieldCheck aria-hidden="true" size={14} />在线 · 本地处理</span>
            </div>
          </header>

          <div className="a2-workbench">
            <section className="a2-main-column">
              <div className="a2-step-heading"><span>1</span><strong>选择文件</strong></div>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(event) => {
                  void handleFiles(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
              <button className="a2-dropzone" type="button" onClick={() => inputRef.current?.click()}>
                <FileImage aria-hidden="true" size={22} />
                <span>
                  <strong>选择{multiple ? "一个或多个" : "一个"}本地文件</strong>
                  <small>支持格式：{accept.replaceAll(",", "、")}</small>
                </span>
              </button>
              {files.length ? (
                <div className="a2-local-file-list">
                  {files.map((file) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`}>
                      <span title={file.name}>{file.name}</span>
                      <small>{formatBytes(file.size)}</small>
                      {files.length > 1 ? (
                        <span>
                          <button type="button" aria-label={`上移 ${file.name}`} disabled={files[0] === file} onClick={() => moveFile(file, -1, files, setFiles)}><ChevronUp size={14} /></button>
                          <button type="button" aria-label={`下移 ${file.name}`} disabled={files[files.length - 1] === file} onClick={() => moveFile(file, 1, files, setFiles)}><ChevronDown size={14} /></button>
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
              {metadata ? <MetadataView metadata={metadata} /> : null}
              <div className="a2-step-heading a2-preview-heading"><span>2</span><strong>处理状态与结果</strong></div>
              <div className={`a2-task-status is-${status}`} aria-live="polite">
                <div className="a2-task-status-copy"><div><strong>{message}</strong><span>{error || currentTool.description}</span></div><span>{Math.round(progress * 100)}%</span></div>
                <div className="a2-progress-track"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
                {error ? <p className="a2-status-error">处理失败：{error}</p> : null}
                <div className="a2-task-actions">
                  <button className="a2-button-secondary" type="button" onClick={clear}><Trash2 aria-hidden="true" size={15} />清空</button>
                  <button className="a2-button-danger" type="button" disabled={status !== "running"} onClick={cancel}><Square aria-hidden="true" size={15} />停止</button>
                  <button className="a2-button-primary" type="button" disabled={!files.length || status === "running"} onClick={() => void run()}>
                    {status === "running" ? <Loader2 className="animate-spin" aria-hidden="true" size={16} /> : <Play aria-hidden="true" size={16} />}
                    {tool === "image-metadata" ? "清除元数据" : tool === "ocr" ? "开始识别" : "开始处理"}
                  </button>
                </div>
              </div>
              <OutputList outputs={outputs} />
            </section>
            <aside className="a2-parameter-panel">
              <header><p>处理参数</p><h2>{currentTool.label}</h2><span>{currentTool.description}</span></header>
              <div className="a2-control-panel">{toolControls}</div>
              <p className="a2-parameter-note"><ShieldCheck aria-hidden="true" size={14} />文件、OCR 内容和结果不会上传服务器。</p>
            </aside>
          </div>
        </section>
      </main>
      <UnifiedToolDialog open={catalogOpen} currentToolId={tool} onClose={() => setCatalogOpen(false)} />
    </>
  );
}

function LocalFilePreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  return (
    <article className="local-file-preview">
      <div className="local-file-preview-visual">
        {isImage && url ? <img src={url} alt="" /> : null}
        {isVideo && url ? <video src={url} muted preload="metadata" /> : null}
        {isPdf && url ? <object data={`${url}#page=1&view=FitH`} type="application/pdf" aria-label={`${file.name} 第一页预览`} /> : null}
        {!isImage && !isVideo && !isPdf ? (
          isAudio ? <FileAudio aria-hidden="true" /> : <FileText aria-hidden="true" />
        ) : null}
      </div>
      <div>
        <strong title={file.name}>{file.name}</strong>
        <span>{file.name.split(".").pop()?.toUpperCase() || "文件"} · {formatBytes(file.size)}</span>
        <small>已加入任务</small>
      </div>
    </article>
  );
}

type ControlProps = {
  tool: LocalToolId;
  imageFormat: ExportImageFormat; setImageFormat: (value: ExportImageFormat) => void;
  imageQuality: number; setImageQuality: (value: number) => void;
  rotation: 0 | 90 | 180 | 270; setRotation: (value: 0 | 90 | 180 | 270) => void;
  flipHorizontal: boolean; setFlipHorizontal: (value: boolean) => void;
  flipVertical: boolean; setFlipVertical: (value: boolean) => void;
  pdfPageMode: "a4" | "image-size"; setPdfPageMode: (value: "a4" | "image-size") => void;
  pageSelection: string; setPageSelection: (value: string) => void;
  pdfSplitMode: "files" | "merged"; setPdfSplitMode: (value: "files" | "merged") => void;
  pageOrder: string; setPageOrder: (value: string) => void;
  rotatePages: string; setRotatePages: (value: string) => void;
  pdfRotation: 0 | 90 | 180 | 270; setPdfRotation: (value: 0 | 90 | 180 | 270) => void;
  watermarkText: string; setWatermarkText: (value: string) => void;
  watermarkKind: "text" | "image"; setWatermarkKind: (value: "text" | "image") => void;
  watermarkImage: File | null; setWatermarkImage: (value: File | null) => void;
  watermarkPosition: PdfWatermarkPosition; setWatermarkPosition: (value: PdfWatermarkPosition) => void;
  watermarkRotation: number; setWatermarkRotation: (value: number) => void;
  watermarkScale: number; setWatermarkScale: (value: number) => void;
  watermarkColor: string; setWatermarkColor: (value: string) => void;
  watermarkOpacity: number; setWatermarkOpacity: (value: number) => void;
  watermarkSize: number; setWatermarkSize: (value: number) => void;
  pageNumberEnabled: boolean; setPageNumberEnabled: (value: boolean) => void;
  pageNumberPosition: PdfPageNumberPosition; setPageNumberPosition: (value: PdfPageNumberPosition) => void;
  headerText: string; setHeaderText: (value: string) => void;
  footerText: string; setFooterText: (value: string) => void;
  startTime: number; setStartTime: (value: number) => void;
  endTime: number; setEndTime: (value: number) => void;
  mediaDuration: number;
  trimMode: "fast" | "precise"; setTrimMode: (value: "fast" | "precise") => void;
  videoFormat: VideoOutputFormat; setVideoFormat: (value: VideoOutputFormat) => void;
  audioFormat: AudioOutputFormat; setAudioFormat: (value: AudioOutputFormat) => void;
  frameFormat: ExportImageFormat; setFrameFormat: (value: ExportImageFormat) => void;
  frameBatch: boolean; setFrameBatch: (value: boolean) => void;
  frameInterval: number; setFrameInterval: (value: number) => void;
  gifWidth: number; setGifWidth: (value: number) => void;
  gifFps: number; setGifFps: (value: number) => void;
  audioMode: "trim" | "concat" | "enhance"; setAudioMode: (value: "trim" | "concat" | "enhance") => void;
  volume: number; setVolume: (value: number) => void;
  fadeIn: number; setFadeIn: (value: number) => void;
  fadeOut: number; setFadeOut: (value: number) => void;
  ocrLanguage: OcrLanguage; setOcrLanguage: (value: OcrLanguage) => void;
  ocrExport: "txt" | "editable-word" | "image-word"; setOcrExport: (value: "txt" | "editable-word" | "image-word") => void;
  desktop: boolean;
};

function ToolControls(props: ControlProps) {
  const imageExport = (
    <>
      <SelectField label="输出格式" value={props.imageFormat} onChange={(value) => props.setImageFormat(value as ExportImageFormat)} options={[
        ["jpg", "JPG"], ["png", "PNG"], ["webp", "WebP"]
      ]} />
      <RangeField label="输出质量" value={props.imageQuality} min={10} max={100} onChange={props.setImageQuality} />
    </>
  );
  if (props.tool === "image-convert" || props.tool === "image-metadata") return imageExport;
  if (props.tool === "image-transform") return (
    <>
      <SelectField label="旋转角度" value={String(props.rotation)} onChange={(value) => props.setRotation(Number(value) as 0 | 90 | 180 | 270)} options={[
        ["0", "不旋转"], ["90", "右转 90°"], ["180", "旋转 180°"], ["270", "左转 90°"]
      ]} />
      <CheckField label="水平翻转" checked={props.flipHorizontal} onChange={props.setFlipHorizontal} />
      <CheckField label="垂直翻转" checked={props.flipVertical} onChange={props.setFlipVertical} />
      {imageExport}
    </>
  );
  if (props.tool === "images-pdf") return <SelectField label="页面模式" value={props.pdfPageMode} onChange={(value) => props.setPdfPageMode(value as "a4" | "image-size")} options={[["a4", "A4 适配"], ["image-size", "跟随图片尺寸"]]} />;
  if (props.tool === "pdf-split") return (
    <>
      <TextField label="页码" value={props.pageSelection} onChange={props.setPageSelection} placeholder="all 或 1,3,5-8" />
      <SelectField label="导出方式" value={props.pdfSplitMode} onChange={(value) => props.setPdfSplitMode(value as "files" | "merged")} options={[["files", "每页独立 PDF"], ["merged", "选中页合并为一个 PDF"]]} />
    </>
  );
  if (props.tool === "pdf-pages") return (
    <>
      <TextField label="保留及排序页码" value={props.pageOrder} onChange={props.setPageOrder} placeholder="例如 3,1,2" />
      <TextField label="需要旋转的页码" value={props.rotatePages} onChange={props.setRotatePages} placeholder="例如 1,3-5；留空不旋转" />
      <SelectField label="旋转角度" value={String(props.pdfRotation)} onChange={(value) => props.setPdfRotation(Number(value) as 0 | 90 | 180 | 270)} options={[["90", "右转 90°"], ["180", "旋转 180°"], ["270", "左转 90°"]]} />
    </>
  );
  if (props.tool === "pdf-decorate") return (
    <>
      <TextField label="应用页码" value={props.pageSelection} onChange={props.setPageSelection} placeholder="all 或 1,3,5-8" />
      <SelectField label="水印类型" value={props.watermarkKind} onChange={(value) => props.setWatermarkKind(value as "text" | "image")} options={[["text", "文字水印"], ["image", "图片水印"]]} />
      {props.watermarkKind === "text" ? (
        <TextField label="文字水印" value={props.watermarkText} onChange={props.setWatermarkText} placeholder="留空不添加水印" />
      ) : (
        <FieldLabel label="水印图片">
          <input className="form-input h-auto py-2" type="file" accept={imageAccept} onChange={(event) => props.setWatermarkImage(event.currentTarget.files?.[0] || null)} />
          {props.watermarkImage ? <span className="mt-1 block truncate text-xs text-slate-500">{props.watermarkImage.name}</span> : null}
        </FieldLabel>
      )}
      <SelectField label="水印位置" value={props.watermarkPosition} onChange={(value) => props.setWatermarkPosition(value as PdfWatermarkPosition)} options={[
        ["center", "居中"], ["top-left", "左上"], ["top-right", "右上"], ["bottom-left", "左下"], ["bottom-right", "右下"]
      ]} />
      <FieldLabel label="水印颜色"><input className="form-input h-11" type="color" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /></FieldLabel>
      <RangeField label="水印透明度" value={props.watermarkOpacity} min={5} max={100} onChange={props.setWatermarkOpacity} />
      {props.watermarkKind === "text"
        ? <NumberField label="水印字号" value={props.watermarkSize} min={6} onChange={props.setWatermarkSize} />
        : <RangeField label="图片宽度占页面比例" value={props.watermarkScale} min={5} max={90} onChange={props.setWatermarkScale} />}
      <NumberField label="水印旋转角度" value={props.watermarkRotation} min={-180} max={180} onChange={props.setWatermarkRotation} />
      <CheckField label="添加页码" checked={props.pageNumberEnabled} onChange={props.setPageNumberEnabled} />
      {props.pageNumberEnabled ? <SelectField label="页码位置" value={props.pageNumberPosition} onChange={(value) => props.setPageNumberPosition(value as PdfPageNumberPosition)} options={[
        ["bottom-left", "左下"], ["bottom-center", "底部居中"], ["bottom-right", "右下"]
      ]} /> : null}
      <TextField label="页眉" value={props.headerText} onChange={props.setHeaderText} placeholder="可选，单行文字" />
      <TextField label="页脚" value={props.footerText} onChange={props.setFooterText} placeholder="可选，单行文字" />
    </>
  );
  if (props.tool === "media-trim") return (
    <>
      <TimeFields {...props} />
      <SelectField label="裁剪模式" value={props.trimMode} onChange={(value) => props.setTrimMode(value as "fast" | "precise")} options={[["fast", "快速复制"], ["precise", "精确裁剪"]]} />
      <SelectField label="视频输出" value={props.videoFormat} onChange={(value) => props.setVideoFormat(value as VideoOutputFormat)} options={["mp4", "mov", "avi", "mkv", "webm"].map((value) => [value, value.toUpperCase()])} />
      <SelectField label="音频输出" value={props.audioFormat} onChange={(value) => props.setAudioFormat(value as AudioOutputFormat)} options={["mp3", "wav", "aac", "m4a", "flac"].map((value) => [value, value.toUpperCase()])} />
    </>
  );
  if (props.tool === "video-mute") return <SelectField label="输出格式" value={props.videoFormat} onChange={(value) => props.setVideoFormat(value as VideoOutputFormat)} options={["mp4", "mov", "avi", "mkv", "webm"].map((value) => [value, value.toUpperCase()])} />;
  if (props.tool === "video-frame") return (
    <>
      <NumberField label="截图时间（秒）" value={props.startTime} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setStartTime} />
      <SelectField label="输出格式" value={props.frameFormat} onChange={(value) => props.setFrameFormat(value as ExportImageFormat)} options={[["jpg", "JPG"], ["png", "PNG"], ["webp", "WebP"]]} />
      {props.desktop ? (
        <>
          <CheckField label="按固定间隔批量截图" checked={props.frameBatch} onChange={props.setFrameBatch} />
          {props.frameBatch ? <NumberField label="截图间隔（秒）" value={props.frameInterval} min={0.1} step={0.1} onChange={props.setFrameInterval} /> : null}
        </>
      ) : null}
    </>
  );
  if (props.tool === "video-gif") return (
    <>
      <TimeFields {...props} />
      <NumberField label="GIF 宽度" value={props.gifWidth} min={64} max={1920} onChange={props.setGifWidth} />
      <NumberField label="帧率" value={props.gifFps} min={1} max={30} onChange={props.setGifFps} />
    </>
  );
  if (props.tool === "audio-enhance") return (
    <>
      <SelectField label="处理方式" value={props.audioMode} onChange={(value) => props.setAudioMode(value as "trim" | "concat" | "enhance")} options={[["enhance", "音量与淡入淡出"], ["trim", "音频裁剪"], ["concat", "多段音频拼接"]]} />
      {props.audioMode === "trim" ? <><TimeFields {...props} /><SelectField label="裁剪模式" value={props.trimMode} onChange={(value) => props.setTrimMode(value as "fast" | "precise")} options={[["fast", "快速复制"], ["precise", "精确裁剪"]]} /></> : null}
      {props.audioMode === "enhance" ? (
        <>
          <RangeField label="音量倍数 ×100" value={Math.round(props.volume * 100)} min={0} max={400} onChange={(value) => props.setVolume(value / 100)} />
          <NumberField label="淡入时长（秒）" value={props.fadeIn} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setFadeIn} />
          <NumberField label="淡出时长（秒）" value={props.fadeOut} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setFadeOut} />
        </>
      ) : null}
      <SelectField label="输出格式" value={props.audioFormat} onChange={(value) => props.setAudioFormat(value as AudioOutputFormat)} options={["mp3", "wav", "aac", "m4a", "flac"].map((value) => [value, value.toUpperCase()])} />
    </>
  );
  if (props.tool === "ocr") return (
    <>
      <SelectField label="识别语言" value={props.ocrLanguage} onChange={(value) => props.setOcrLanguage(value as OcrLanguage)} options={[["chi_sim+eng", "中文 + 英文"], ["chi_sim", "简体中文"], ["eng", "英文"]]} />
      <SelectField label="导出方式" value={props.ocrExport} onChange={(value) => props.setOcrExport(value as "txt" | "editable-word" | "image-word")} options={[["txt", "TXT 纯文本"], ["editable-word", "可编辑 Word"], ["image-word", "原样 Word（页面图像）"]]} />
      <p className="text-xs leading-6 text-slate-500">可编辑 Word 会重建段落，复杂表格、公式和多栏可能与原稿不同；原样 Word 优先保持视觉版式，但正文主要以页面图像呈现。</p>
    </>
  );
  return <p className="text-sm leading-6 text-slate-500">该工具无需额外参数，结果按文件列表顺序生成。</p>;
}

function TimeFields(props: Pick<ControlProps, "startTime" | "setStartTime" | "endTime" | "setEndTime" | "mediaDuration">) {
  return (
    <>
      <NumberField label="开始时间（秒）" value={props.startTime} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setStartTime} />
      <NumberField label="结束时间（秒）" value={props.endTime} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setEndTime} />
      {props.mediaDuration ? <p className="text-xs text-slate-500">媒体总时长：{props.mediaDuration.toFixed(2)} 秒</p> : null}
    </>
  );
}

function MetadataView({ metadata }: { metadata: ImageMetadataSummary }) {
  const rows = [
    ["拍摄时间", metadata.capturedAt],
    ["相机 / 设备", metadata.camera],
    ["软件信息", metadata.software],
    ["GPS", metadata.gps],
    ["方向", metadata.orientation],
    ["尺寸", metadata.dimensions]
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <div className="mt-4 grid gap-2 border border-slate-800 bg-slate-950 p-4 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => <p key={label}><span className="text-slate-500">{label}：</span>{value}</p>)}
      {!rows.length ? <p className="text-slate-500">没有读取到常用 EXIF 元数据。</p> : null}
    </div>
  );
}

function OutputList({ outputs }: { outputs: OutputItem[] }) {
  if (!outputs.length) return null;
  return (
    <div className="mt-5 border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
      <h3 className="font-semibold text-emerald-200">处理结果</h3>
      <div className="mt-3 space-y-2">
        {outputs.map((item, index) => (
          <div className="flex items-center justify-between gap-3 border border-slate-800 bg-slate-950/70 px-3 py-2" key={`${item.name}-${index}`}>
            <div className="min-w-0">
              <p className="truncate text-sm">{item.name}</p>
              <p className="truncate text-xs text-slate-500">{item.savedPath || formatBytes(item.blob.size)}</p>
            </div>
            <button className="btn-secondary inline-flex shrink-0 items-center gap-2 px-3 py-2 text-xs" type="button" onClick={() => downloadBlob(item.blob, item.name)}>
              <Download className="h-3.5 w-3.5" />下载
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return <label className="mb-4 block text-sm text-slate-300"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <FieldLabel label={label}><input className="form-input" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></FieldLabel>;
}

function NumberField({ label, value, min, max, step, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; onChange: (value: number) => void }) {
  return <FieldLabel label={label}><input className="form-input" type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></FieldLabel>;
}

function RangeField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <FieldLabel label={`${label}：${value}`}><input className="w-full" type="range" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} /></FieldLabel>;
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="mb-4 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <FieldLabel label={label}>
      <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </FieldLabel>
  );
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

function moveFile(
  file: File,
  offset: -1 | 1,
  files: File[],
  setFiles: (value: File[]) => void
) {
  const index = files.indexOf(file);
  const nextIndex = index + offset;
  if (index < 0 || nextIndex < 0 || nextIndex >= files.length) return;
  const next = [...files];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  setFiles(next);
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

async function saveDesktopOutputs(outputs: OutputItem[], outputRoot: string) {
  if (!outputRoot) return outputs;
  const tauri = getTauriApi();
  if (!tauri?.fs?.createDir || !tauri.fs.writeBinaryFile) {
    throw new Error("当前离线环境无法写入输出目录。");
  }
  const batchRoot = joinLocalPath(outputRoot, batchFolderName());
  await tauri.fs.createDir(batchRoot, { recursive: true });
  const saved: OutputItem[] = [];
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
  return `${directory.replace(/[\\/]+$/, "")}${separator}${name.replace(/[\\/:*?"<>|]+/g, "_")}`;
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

function friendlyError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason || "");
  if (/password|encrypt/i.test(message)) return "PDF 已加密，不能绕过密码保护。";
  if (/memory|allocation/i.test(message)) return "本机可用内存不足，请减少文件数量、缩短媒体片段或改用离线版。";
  if (/cancel|abort/i.test(message)) return "任务已取消。";
  return message || "处理失败，请检查文件后重试。";
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
