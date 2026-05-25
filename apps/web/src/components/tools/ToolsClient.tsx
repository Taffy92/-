"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdSlot } from "@doctool/ui";
import Cropper from "cropperjs";
import JSZip from "jszip";
import { CheckCircle2, Copy, Crop, Download, ExternalLink, FileImage, FileText, Files, FolderOpen, Image, Loader2, Maximize2, Music, Play, RotateCcw, Scissors, Square, Table2, Trash2, Type, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { addImageWatermark, addTextWatermark, canvasToBlob, compressImage, loadImageElement, resizeImage } from "@doctool/image-core";
import { combineImagePages, imagePagesToZip, renderDocxToImagePages, renderExcelToImagePages } from "@doctool/export-core";
import { getPdfPageCount, parsePageSelection, renderPdfPageToBlob, renderPdfPages, renderPdfPagesToZip } from "@doctool/pdf-core";
import { audioBitrateOptions, audioOutputFormats, convertAudioFormat, convertVideoFormat, extractAudioFromVideo, extractedAudioOutputFormats, getMediaCapabilityReport, videoOutputFormats, videoSizeOptions } from "@doctool/media-core";
import type { AudioBitrateOption, AudioOutputFormat, ExtractedAudioOutputFormat, MediaCapabilityReport, MediaQuality, VideoOutputFormat, VideoSizeOption } from "@doctool/media-core";
import { audioAccept, excelAccept, fileNameWithSuffix, formatBytes, imageAccept, isAudioFile, isExcelFile, isImageFile, isPdfFile, isVideoFile, isWordFile, maxOnlineFileSize, pdfAccept, pdfBoundaryNotice, privacyNotice, safeBaseName, videoAccept, wordAccept } from "@doctool/shared";
import type { ExportImageFormat, FileSummary, PdfOutputFormat, ProcessState } from "@doctool/shared";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { batchHistoryStorageKey, batchModeLabel, batchTaskStatusLabel, buildBatchLog, buildImportSummary, createBatchTask, defaultOutputDirectory, filterBatchHistory, getBatchCounts, getSupportedExtensions, isSupportedBatchName, mergeBatchHistory, parseBatchHistory, sanitizeLocalPath, toBatchHistoryEntry } from "@/lib/batchQueue";
import type { BatchHistoryEntry, BatchHistoryFilter, BatchImportSummary, BatchMode, BatchOutputDirectory, BatchTask, BatchTaskStatus } from "@/lib/batchQueue";
import { getSidecarExperimentMode, isSidecarReady, shouldUseSidecarExperiment, sidecarExperimentStorageKey, sidecarStatusText, sidecarUnsupportedReason } from "@/lib/sidecarFfmpeg";
import type { SidecarCheckResult, SidecarCommandMode, SidecarCommandResult } from "@/lib/sidecarFfmpeg";

export type TabId =
  | "crop" | "resize" | "watermark" | "compress"
  | "pdf-images" | "word-images" | "excel-images"
  | "video-convert" | "audio-convert" | "video-audio" | "batch-gate" | "batch" | "download";

type ToolTab = {
  id: TabId;
  label: string;
  description: string;
  kind: "image" | "pdf" | "word" | "excel" | "video" | "audio" | "batch" | "download";
  icon: LucideIcon;
  featured?: boolean;
};

const webTabs: ToolTab[] = [
  { id: "crop", label: "图片裁切", description: "拖动裁切框", kind: "image", icon: Crop, featured: true },
  { id: "resize", label: "尺寸调整", description: "百分比 / 像素", kind: "image", icon: Maximize2, featured: true },
  { id: "watermark", label: "添加水印", description: "文字 / 图片水印", kind: "image", icon: Type, featured: true },
  { id: "compress", label: "图片压缩", description: "压缩成 JPG", kind: "image", icon: FileImage, featured: true },
  { id: "pdf-images", label: "PDF 转图片", description: "逐页 / 合成", kind: "pdf", icon: Image },
  { id: "word-images", label: "Word 转图片", description: "DOCX 转图片", kind: "word", icon: FileText },
  { id: "excel-images", label: "Excel 转图片", description: "表格转图片", kind: "excel", icon: Table2 },
  { id: "video-convert", label: "视频格式转换", description: "MP4/MOV 等", kind: "video", icon: Video },
  { id: "audio-convert", label: "音频格式转换", description: "MP3/WAV 等", kind: "audio", icon: Music },
  { id: "video-audio", label: "视频提取音频", description: "导出音轨", kind: "video", icon: Scissors },
  { id: "batch-gate", label: "批量处理", description: "离线专业版功能", kind: "download", icon: Files },
  { id: "download", label: "下载离线版", description: "断网可用", kind: "download", icon: Download }
];

const desktopTabs: ToolTab[] = [
  ...webTabs.filter((tab) => tab.id !== "download" && tab.id !== "batch-gate"),
  { id: "batch", label: "离线批量处理", description: "多文件打包导出", kind: "batch", icon: Files, featured: true }
];

const cropRatioOptions = [
  { value: "free", label: "自由裁切" },
  { value: "avatar", label: "头像 1:1" },
  { value: "landscape-16-9", label: "16:9 横屏" },
  { value: "portrait-9-16", label: "9:16 竖屏" },
  { value: "landscape-4-3", label: "4:3 横图" },
  { value: "portrait-3-4", label: "3:4 竖图" },
  { value: "id-photo-one", label: "一寸证件照 25x35" },
  { value: "id-photo-two", label: "二寸证件照 35x49" },
  { value: "wechat-cover", label: "公众号封面 900x383" },
  { value: "redbook-cover", label: "小红书封面 3:4" },
  { value: "short-video-cover", label: "短视频封面 9:16" }
] as const;

const aspectOptions = cropRatioOptions;

const cropAspectRatioMap: Record<string, number | null> = {
  free: null,
  avatar: 1,
  "landscape-16-9": 16 / 9,
  "portrait-9-16": 9 / 16,
  "landscape-4-3": 4 / 3,
  "portrait-3-4": 3 / 4,
  "id-photo-one": 25 / 35,
  "id-photo-two": 35 / 49,
  "wechat-cover": 900 / 383,
  "redbook-cover": 3 / 4,
  "short-video-cover": 9 / 16
};

function getCropAspectRatio(value: string) {
  const mapped = cropAspectRatioMap[value];
  if (mapped === null || mapped === undefined) return NaN;
  return mapped;
}

const onlineFileSizeLimits = {
  image: 50 * 1024 * 1024,
  document: maxOnlineFileSize,
  media: 200 * 1024 * 1024
};

function getOnlineFileSizeLimit(file: File) {
  if (isImageFile(file)) return { bytes: onlineFileSizeLimits.image, label: "图片" };
  if (isPdfFile(file)) return { bytes: onlineFileSizeLimits.document, label: "PDF" };
  if (isWordFile(file)) return { bytes: onlineFileSizeLimits.document, label: "Word" };
  if (isExcelFile(file)) return { bytes: onlineFileSizeLimits.document, label: "Excel" };
  if (isVideoFile(file)) return { bytes: onlineFileSizeLimits.media, label: "视频" };
  if (isAudioFile(file)) return { bytes: onlineFileSizeLimits.media, label: "音频" };
  return { bytes: maxOnlineFileSize, label: "文件" };
}

function getOnlineFileSizeLimitMessage(file: File) {
  const limit = getOnlineFileSizeLimit(file);
  if (file.size <= limit.bytes) return "";
  return `当前${limit.label}文件为 ${formatBytes(file.size)}，已超过在线版 ${formatBytes(limit.bytes)} 的处理限制。当前文件较大，在线版可能受浏览器内存限制。请使用 Windows 离线专业版进行大文件或批量处理，文件仍在本机处理，不上传服务器。`;
}

export function ToolsClient({ surface = isDesktopApp ? "desktop" : "web" }: { surface?: "web" | "desktop" }) {
  const isDesktopSurface = surface === "desktop";
  const tabs = isDesktopSurface ? desktopTabs : webTabs;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const cancelRef = useRef(false);
  const mediaAbortRef = useRef<AbortController | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>("crop");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [summary, setSummary] = useState<FileSummary | null>(null);
  const [status, setStatus] = useState<ProcessState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [compressionStats, setCompressionStats] = useState("");

  const [cropFormat, setCropFormat] = useState<ExportImageFormat>("jpg");
  const [cropQuality, setCropQuality] = useState(90);
  const [cropRatio, setCropRatio] = useState("free");
  const [cropPreviewKey, setCropPreviewKey] = useState(0);
  const [cropScaleX, setCropScaleX] = useState(1);
  const [cropScaleY, setCropScaleY] = useState(1);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(800);
  const [resizeMode, setResizeMode] = useState<"percent" | "pixel">("percent");
  const [resizePercent, setResizePercent] = useState(50);
  const [resizeKeepRatio, setResizeKeepRatio] = useState(true);
  const [resizeFormat, setResizeFormat] = useState<ExportImageFormat>("jpg");
  const [resizeQuality, setResizeQuality] = useState(88);
  const [watermarkText, setWatermarkText] = useState("仅供授权使用");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkMode, setWatermarkMode] = useState<"text" | "image">("text");
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");
  const [watermarkOpacity, setWatermarkOpacity] = useState(55);
  const [watermarkFontSize, setWatermarkFontSize] = useState(42);
  const [watermarkColor, setWatermarkColor] = useState("#111827");
  const [watermarkFormat, setWatermarkFormat] = useState<ExportImageFormat>("jpg");
  const [compressStrength, setCompressStrength] = useState("recommended");
  const [compressQuality, setCompressQuality] = useState(72);
  const [targetSize, setTargetSize] = useState("200KB");
  const [maxSize, setMaxSize] = useState(1920);
  const [keepOriginalSize, setKeepOriginalSize] = useState(false);
  const [pdfPages, setPdfPages] = useState("all");
  const [pdfImageFormat, setPdfImageFormat] = useState<PdfOutputFormat>("png");
  const [pdfScale, setPdfScale] = useState("high");
  const [pdfImageMode, setPdfImageMode] = useState<"pages" | "combined">("pages");
  const [officeImageMode, setOfficeImageMode] = useState<"pages" | "combined">("pages");
  const [officeImageFormat, setOfficeImageFormat] = useState<ExportImageFormat>("png");
  const [mediaReport] = useState<MediaCapabilityReport>(() => getMediaCapabilityReport());
  const [videoFormat, setVideoFormat] = useState<VideoOutputFormat>("mp4");
  const [audioFormat, setAudioFormat] = useState<AudioOutputFormat>("mp3");
  const [extractedAudioFormat, setExtractedAudioFormat] = useState<ExtractedAudioOutputFormat>("mp3");
  const [mediaQuality, setMediaQuality] = useState<MediaQuality>("balanced");
  const [videoSize, setVideoSize] = useState<VideoSizeOption>("original");
  const [audioBitrate, setAudioBitrate] = useState<AudioBitrateOption>("128k");
  const [stripMetadata, setStripMetadata] = useState(true);
  const [batchMode, setBatchMode] = useState<BatchMode>("compress");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState("");
  const [outputDirectory, setOutputDirectory] = useState<BatchOutputDirectory>(() => defaultOutputDirectory());
  const [importSummary, setImportSummary] = useState<BatchImportSummary | null>(null);
  const [batchLogMessage, setBatchLogMessage] = useState("");
  const [batchHistory, setBatchHistory] = useState<BatchHistoryEntry[]>([]);
  const [batchHistoryFilter, setBatchHistoryFilter] = useState<BatchHistoryFilter>("all");
  const [sidecarExperimentEnabled, setSidecarExperimentEnabled] = useState(false);
  const [sidecarStatus, setSidecarStatus] = useState<SidecarCheckResult | null>(null);

  const activeKind = tabs.find((tab) => tab.id === activeTab)?.kind;
  const accept = useMemo(() => {
    if (activeTab === "batch") {
      if (batchMode === "word-images") return wordAccept;
      if (batchMode === "excel-images") return excelAccept;
      if (batchMode === "video-convert" || batchMode === "video-audio") return videoAccept;
      if (batchMode === "audio-convert") return audioAccept;
      return imageAccept;
    }
    if (activeKind === "pdf") return pdfAccept;
    if (activeKind === "word") return wordAccept;
    if (activeKind === "excel") return excelAccept;
    if (activeKind === "video") return videoAccept;
    if (activeKind === "audio") return audioAccept;
    return imageAccept;
  }, [activeKind, activeTab, batchMode]);

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!isDesktopSurface) return;
    setBatchHistory(parseBatchHistory(window.localStorage.getItem(batchHistoryStorageKey)));
    setSidecarExperimentEnabled(window.localStorage.getItem(sidecarExperimentStorageKey) === "enabled");
    void refreshSidecarStatus();
    const tauri = getTauriApi();
    if (!tauri?.path?.downloadDir) return;
    void tauri.path.downloadDir().then((pathValue: string) => {
      if (!pathValue) return;
      setOutputDirectory({ kind: "tauri", path: pathValue, label: sanitizeLocalPath(pathValue) });
    }).catch(() => {
      setOutputDirectory(defaultOutputDirectory());
    });
  }, [isDesktopSurface]);

  useEffect(() => {
    const shouldCreateCropper = activeTab === "crop" && file && isImageFile(file) && fileUrl && cropImageRef.current;
    if (!shouldCreateCropper) {
      cropperRef.current?.destroy();
      cropperRef.current = null;
      return;
    }

    const image = cropImageRef.current;
    if (!image || !image.complete || image.naturalWidth === 0) return;

    cropperRef.current?.destroy();
    cropperRef.current = new Cropper(image, {
      viewMode: 1,
      dragMode: "crop",
      aspectRatio: getCropAspectRatio(cropRatio),
      autoCrop: true,
      autoCropArea: 0.82,
      responsive: true,
      restore: false,
      checkOrientation: true,
      background: false,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: true
    });

    return () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, [activeTab, file, fileUrl, cropPreviewKey]);

  useEffect(() => {
    cropperRef.current?.setAspectRatio(getCropAspectRatio(cropRatio));
  }, [cropRatio]);

  useEffect(() => {
    if (!file || !isImageFile(file) || (activeTab !== "resize" && activeTab !== "watermark")) {
      setPreviewMessage("");
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setPreviewMessage("正在生成预览...");
          let blob: Blob;
          if (activeTab === "resize") {
            const dimensions = resolveResizeDimensions();
            blob = await resizeImage(file, { width: dimensions.width, height: dimensions.height, format: resizeFormat, quality: resizeQuality / 100 });
            if (!cancelled) setPreviewMessage(`预览尺寸：${dimensions.width} x ${dimensions.height}`);
          } else {
            const position = watermarkPosition as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tile";
            if (watermarkMode === "image") {
              if (!watermarkImage) {
                if (!cancelled) {
                  setPreviewUrl((current) => {
                    if (current) URL.revokeObjectURL(current);
                    return "";
                  });
                  setPreviewMessage("上传水印图片后可实时预览。");
                }
                return;
              }
              blob = await addImageWatermark(file, { watermark: watermarkImage, scale: 0.18, opacity: watermarkOpacity / 100, rotate: 0, position }, watermarkFormat, 0.9);
            } else {
              blob = await addTextWatermark(file, {
                text: watermarkText,
                fontSize: watermarkFontSize,
                color: watermarkColor,
                opacity: watermarkOpacity / 100,
                bold: true,
                rotate: -18,
                position
              }, watermarkFormat, 0.9);
            }
            if (!cancelled) setPreviewMessage("水印预览已更新。");
          }
          const nextUrl = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(nextUrl);
            return;
          }
          setPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current);
            return nextUrl;
          });
        } catch {
          if (!cancelled) setPreviewMessage("预览生成失败，请调整参数或更换图片。");
        }
      })();
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    activeTab,
    file,
    resizeMode,
    resizePercent,
    resizeWidth,
    resizeHeight,
    resizeFormat,
    resizeQuality,
    watermarkMode,
    watermarkText,
    watermarkImage,
    watermarkPosition,
    watermarkOpacity,
    watermarkFontSize,
    watermarkColor,
    watermarkFormat,
    summary?.image?.width,
    summary?.image?.height
  ]);

  async function handleFile(nextFile?: File) {
    if (!nextFile) return;
    setError("");
    setResultBlob(null);
    setResultName("");
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    setPreviewMessage("");
    setCompressionStats("");
    setCropScaleX(1);
    setCropScaleY(1);
    const clearCurrentFile = () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFile(null);
      setFileUrl("");
      setSummary(null);
    };
    if (!isImageFile(nextFile) && !isPdfFile(nextFile) && !isWordFile(nextFile) && !isExcelFile(nextFile) && !isVideoFile(nextFile) && !isAudioFile(nextFile)) {
      clearCurrentFile();
      setError("暂不支持该文件格式，请选择图片、PDF、Word、Excel、视频或音频文件。");
      return;
    }
    const onlineLimitMessage = isDesktopSurface ? "" : getOnlineFileSizeLimitMessage(nextFile);
    if (onlineLimitMessage) {
      clearCurrentFile();
      setError(onlineLimitMessage);
      return;
    }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(nextFile);
    setFileUrl(URL.createObjectURL(nextFile));
    const nextSummary = await summarizeFile(nextFile);
    setSummary(nextSummary);
    if (nextSummary.image) {
      setResizeWidth(nextSummary.image.width);
      setResizeHeight(nextSummary.image.height);
    }
  }

  function handleBatchFiles(fileList?: FileList | null) {
    if (!fileList?.length) return;
    setError("");
    setResultBlob(null);
    setResultName("");
    setCompressionStats("");
    const allFiles = Array.from(fileList);
    const nextFiles = allFiles.filter((item) => isBatchFileAllowed(item, batchMode));
    if (!nextFiles.length) {
      setImportSummary(buildImportSummary(allFiles.length, 0, "files"));
      setError("没有找到当前批量功能支持的文件，请重新选择。");
      return;
    }
    appendBatchFiles(nextFiles, "files");
    setImportSummary(buildImportSummary(allFiles.length, nextFiles.length, "files"));
    setProgressMessage(`已添加 ${nextFiles.length} 个文件，点击开始处理后会按顺序执行。`);
  }

  function appendBatchFiles(files: File[], source: BatchImportSummary["source"], sourcePaths?: string[]) {
    const tasks = files.map((item, index) => createBatchTask(item, batchMode, getBatchOutputFormatLabel(batchMode, {
      compressFormat: "jpg",
      watermarkFormat,
      officeImageFormat,
      videoFormat,
      audioFormat,
      extractedAudioFormat
    }), sourcePaths?.[index] || getNativeFilePath(item)));
    setBatchFiles((current) => [...current, ...files]);
    setBatchTasks((current) => [...current, ...tasks]);
    setImportSummary(buildImportSummary(files.length, files.length, source));
  }

  function handleFolderInputFiles(fileList?: FileList | null) {
    if (!fileList?.length) return;
    const allFiles = Array.from(fileList);
    const supported = allFiles.filter((item) => isBatchFileAllowed(item, batchMode));
    const sourcePaths = supported.map((item) => getFileRelativePath(item));
    if (!supported.length) {
      setImportSummary(buildImportSummary(allFiles.length, 0, "folder"));
      setError(`文件夹中没有找到当前功能支持的文件。支持格式：${getSupportedExtensions(batchMode).join(", ")}`);
      return;
    }
    appendBatchFiles(supported, "folder", sourcePaths);
    setProgressMessage(`已从文件夹导入 ${supported.length} 个文件，跳过 ${allFiles.length - supported.length} 个不支持的文件。`);
  }

  async function summarizeFile(source: File): Promise<FileSummary> {
    const base: FileSummary = { name: source.name, size: source.size, type: source.type || "未知", extension: source.name.split(".").pop()?.toLowerCase() || "" };
    if (isImageFile(source)) {
      const image = await loadImageElement(source);
      return { ...base, image: { width: image.naturalWidth, height: image.naturalHeight } };
    }
    if (isPdfFile(source)) {
      try {
        return { ...base, pdf: { pages: await getPdfPageCount(source) } };
      } catch {
        return { ...base, pdf: { pages: 0 } };
      }
    }
    if (isWordFile(source)) return { ...base, document: { kind: "word" } };
    if (isExcelFile(source)) return { ...base, document: { kind: "excel" } };
    if (isVideoFile(source)) return { ...base, media: { kind: "video", duration: await maybeProbeMediaDuration(source) } };
    if (isAudioFile(source)) return { ...base, media: { kind: "audio", duration: await maybeProbeMediaDuration(source) } };
    return base;
  }

  async function maybeProbeMediaDuration(source: File) {
    if (!isDesktopSurface || !sidecarExperimentEnabled || !isSidecarReady(sidecarStatus || undefined)) return undefined;
    const sourcePath = getNativeFilePath(source);
    if (!sourcePath) return undefined;
    try {
      const result = await runSidecarExperiment("probe-duration", { inputPath: sourcePath });
      const duration = Number((result.stdoutPreview || "").trim());
      return Number.isFinite(duration) && duration > 0 ? duration : undefined;
    } catch {
      return undefined;
    }
  }

  async function runCurrentTask() {
    setStatus("running");
    setProgress(0);
    setError("");
    setResultBlob(null);
    setResultName("");
    cancelRef.current = false;
    try {
      switch (activeTab) {
        case "crop": await runCrop(); break;
        case "resize": await runResize(); break;
        case "watermark": await runWatermark(); break;
        case "compress": await runCompress(); break;
        case "pdf-images": await runPdfImages(); break;
        case "word-images": await runWordImages(); break;
        case "excel-images": await runExcelImages(); break;
        case "video-convert": await runVideoConvert(); break;
        case "audio-convert": await runAudioConvert(); break;
        case "video-audio": await runVideoExtractAudio(); break;
        case "batch-gate": window.location.href = "/download"; return;
        case "batch": await runBatch(); break;
        case "download": window.location.href = "/download"; return;
      }
      setProgress(1);
      setStatus("done");
    } catch (reason) {
      setStatus(cancelRef.current ? "cancelled" : "error");
      setError(friendlyError(reason));
    } finally {
      if (activeTab === "batch") setActiveTaskId("");
    }
  }

  function cancelTask() {
    cancelRef.current = true;
    mediaAbortRef.current?.abort();
    setProgressMessage("已请求取消，当前任务会在安全节点停止。");
  }

  async function selectOutputDirectory() {
    setError("");
    const tauri = getTauriApi();
    if (tauri?.dialog?.open) {
      const selected = await tauri.dialog.open({ directory: true, multiple: false, title: "选择批量结果输出目录" });
      if (typeof selected === "string" && selected) {
        setOutputDirectory({ kind: "tauri", path: selected, label: sanitizeLocalPath(selected) });
        setProgressMessage(`输出目录已设置为：${sanitizeLocalPath(selected)}`);
      }
      return;
    }

    const picker = (window as any).showDirectoryPicker;
    if (typeof picker === "function") {
      const handle = await picker.call(window, { mode: "readwrite" });
      setOutputDirectory({ kind: "browser", handle, label: handle.name || "已选择本地目录" });
      setProgressMessage(`输出目录已设置为：${handle.name || "本地目录"}`);
      return;
    }

    setError("当前环境不支持直接选择输出目录。下一步：处理完成后请使用下载结果按钮保存文件。");
  }

  async function importFolder() {
    setError("");
    const tauri = getTauriApi();
    if (tauri?.dialog?.open && tauri?.fs?.readDir && tauri?.fs?.readBinaryFile) {
      const selected = await tauri.dialog.open({ directory: true, multiple: false, title: "选择需要导入的文件夹" });
      if (typeof selected !== "string" || !selected) return;
      const result = await readTauriFolderFiles(selected, batchMode);
      if (!result.files.length) {
        setImportSummary(buildImportSummary(result.total, 0, "folder"));
        setError(`文件夹中没有找到当前功能支持的文件。支持格式：${getSupportedExtensions(batchMode).join(", ")}`);
        return;
      }
      appendBatchFiles(result.files, "folder", result.paths);
      setImportSummary(buildImportSummary(result.total, result.files.length, "folder"));
      setProgressMessage(`已从 ${sanitizeLocalPath(selected)} 导入 ${result.files.length} 个文件，跳过 ${result.total - result.files.length} 个不支持的文件。`);
      return;
    }

    folderInputRef.current?.click();
  }

  async function openOutputDirectory() {
    const tauri = getTauriApi();
    if (outputDirectory.kind === "tauri" && tauri?.shell?.open) {
      await tauri.shell.open(outputDirectory.path);
      return;
    }
    setProgressMessage("当前环境不能直接打开系统目录。请在结果列表中复制输出路径，或使用下载结果保存。");
  }

  async function openResultFile(task: BatchTask) {
    const tauri = getTauriApi();
    if (!tauri?.shell?.open) {
      setProgressMessage("当前环境不能直接打开本地结果文件。请使用下载结果或复制输出路径后手动打开。");
      return;
    }
    if (task.status !== "success" || !task.outputPath || !isLocalFilePath(task.outputPath)) {
      setError("结果文件不存在，请重新处理或检查输出目录。");
      return;
    }
    try {
      if (tauri.fs?.exists) {
        const exists = await tauri.fs.exists(task.outputPath);
        if (!exists) {
          setError("结果文件不存在，请重新处理或检查输出目录。");
          return;
        }
      }
      await tauri.shell.open(task.outputPath);
      setProgressMessage(`已打开结果文件：${sanitizeLocalPath(task.outputPath)}`);
    } catch {
      setError("结果文件不存在，请重新处理或检查输出目录。");
    }
  }

  async function copyText(value?: string) {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    setProgressMessage("已复制输出路径。");
  }

  async function refreshSidecarStatus() {
    if (!isDesktopSurface) return;
    try {
      const status = await invokeTauri<SidecarCheckResult>("check_ffmpeg_sidecar");
      setSidecarStatus(status);
      if (!isSidecarReady(status)) {
        setSidecarExperimentEnabled(false);
        window.localStorage.setItem(sidecarExperimentStorageKey, "disabled");
        return;
      }
      const manuallyDisabled = window.localStorage.getItem(sidecarExperimentStorageKey) === "disabled";
      setSidecarExperimentEnabled(!manuallyDisabled);
      window.localStorage.setItem(sidecarExperimentStorageKey, manuallyDisabled ? "disabled" : "enabled");
    } catch {
      setSidecarStatus({ status: "sidecar_missing", message: "sidecar 未配置", sha256Verified: false });
      setSidecarExperimentEnabled(false);
      window.localStorage.setItem(sidecarExperimentStorageKey, "disabled");
    }
  }

  function toggleSidecarExperiment(enabled: boolean) {
    if (!enabled) {
      setSidecarExperimentEnabled(false);
      window.localStorage.setItem(sidecarExperimentStorageKey, "disabled");
      setProgressMessage("已关闭 sidecar 低风险优先处理，音视频批量处理继续使用 FFmpeg WASM。");
      return;
    }

    if (!isSidecarReady(sidecarStatus || undefined)) {
      setError("sidecar 当前不可用或校验失败，不能启用低风险优先处理。下一步：请刷新检测状态或检查离线专业版资源。");
      setSidecarExperimentEnabled(false);
      window.localStorage.setItem(sidecarExperimentStorageKey, "disabled");
      return;
    }

    setSidecarExperimentEnabled(true);
    window.localStorage.setItem(sidecarExperimentStorageKey, "enabled");
    setProgressMessage("已开启 sidecar 低风险优先处理。仅 WAV 转 FLAC、MP4 转 WebM 和媒体信息读取会优先使用 sidecar，其余仍使用 FFmpeg WASM。");
  }

  function retryBatchTask(id: string) {
    setBatchTasks((current) => current.map((task) => task.id === id ? {
      ...task,
      status: "queued",
      progress: 0,
      error: undefined,
      completedAt: undefined,
      outputPath: undefined,
      resultName: undefined,
      backend: undefined
    } : task));
    setStatus("idle");
    setProgressMessage("失败任务已放回等待队列。");
  }

  function saveBatchHistory(tasks: BatchTask | BatchTask[]) {
    if (!isDesktopSurface) return;
    const entries = (Array.isArray(tasks) ? tasks : [tasks])
      .map((task) => toBatchHistoryEntry(task))
      .filter((entry): entry is BatchHistoryEntry => Boolean(entry));
    if (!entries.length) return;
    setBatchHistory((current) => {
      const next = mergeBatchHistory(current, entries);
      window.localStorage.setItem(batchHistoryStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function clearBatchHistory() {
    setBatchHistory([]);
    window.localStorage.removeItem(batchHistoryStorageKey);
    setProgressMessage("已清空本机批量任务历史。");
  }

  function cancelBatchTask(id: string) {
    if (activeTaskId === id) cancelTask();
    const completedAt = Date.now();
    const target = batchTasks.find((task) => task.id === id && (task.status === "queued" || task.status === "running"));
    if (target) saveBatchHistory({
      ...target,
      status: "cancelled",
      completedAt,
      error: "用户取消处理"
    });
    setBatchTasks((current) => current.map((task) => task.id === id && (task.status === "queued" || task.status === "running") ? {
      ...task,
      status: "cancelled",
      completedAt,
      error: "用户取消处理"
    } : task));
  }

  function clearCompletedBatchTasks() {
    setBatchTasks((current) => current.filter((task) => task.status !== "success"));
    setBatchFiles((current) => current.filter((file) => !batchTasks.some((task) => task.status === "success" && task.file === file)));
    setProgressMessage("已清空已完成任务。");
  }

  function clearAllBatchTasks() {
    setBatchFiles([]);
    setBatchTasks([]);
    setImportSummary(null);
    setActiveTaskId("");
    setStatus("idle");
    setProgress(0);
    setProgressMessage("已清空全部任务。");
  }

  async function exportBatchLog() {
    const content = buildBatchLog(batchTasks);
    const blob = new Blob([content || "暂无批量处理日志。"], { type: "text/plain;charset=utf-8" });
    const name = `万能格式转换器_处理日志_${Date.now()}.txt`;
    const outputPath = await saveBatchResult(blob, name);
    if (!outputPath) {
      downloadBlob(blob, name);
      return;
    }
    setBatchLogMessage(`处理日志已导出：${sanitizeLocalPath(outputPath)}`);
  }

  function ensureFile(kind: "image" | "pdf" | "word" | "excel" | "video" | "audio") {
    if (!file) throw new Error("请先选择文件。");
    if (kind === "image" && !isImageFile(file)) throw new Error("当前功能需要选择图片文件。");
    if (kind === "pdf" && !isPdfFile(file)) throw new Error("当前功能需要选择 PDF 文件。");
    if (kind === "word" && !isWordFile(file)) throw new Error("当前功能需要选择 .docx Word 文件。");
    if (kind === "excel" && !isExcelFile(file)) throw new Error("当前功能需要选择 Excel 文件。");
    if (kind === "video" && !isVideoFile(file)) throw new Error("当前功能需要选择视频文件。");
    if (kind === "audio" && !isAudioFile(file)) throw new Error("当前功能需要选择音频文件。");
    return file;
  }

  function finishTask(blob: Blob, name: string, message = "处理完成，可以下载结果。") {
    setResultBlob(blob);
    setResultName(name);
    setProgressMessage(message);
  }

  async function runCrop() {
    const source = ensureFile("image");
    const cropper = cropperRef.current;
    if (!cropper) throw new Error("请先在预览图中拖动裁切框，选择需要保留的区域。");
    const canvas = cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high"
    });
    if (!canvas) throw new Error("裁切区域生成失败，请重新选择裁切区域后再试。");
    const mime = cropFormat === "png" ? "image/png" : cropFormat === "webp" ? "image/webp" : "image/jpeg";
    const blob = await canvasToBlob(canvas, mime, cropQuality / 100);
    finishTask(blob, fileNameWithSuffix(source.name, "cropped", cropFormat));
  }

  function rotateCrop(degrees: number) {
    cropperRef.current?.rotate(degrees);
  }

  function flipCrop(axis: "x" | "y") {
    if (axis === "x") {
      const next = cropScaleX * -1;
      cropperRef.current?.scaleX(next);
      setCropScaleX(next);
      return;
    }
    const next = cropScaleY * -1;
    cropperRef.current?.scaleY(next);
    setCropScaleY(next);
  }

  function resetCrop() {
    cropperRef.current?.reset();
    setCropScaleX(1);
    setCropScaleY(1);
  }

  function resolveResizeDimensions() {
    const sourceWidth = Math.max(1, summary?.image?.width || resizeWidth || 1);
    const sourceHeight = Math.max(1, summary?.image?.height || resizeHeight || 1);
    if (resizeMode === "percent") {
      const scale = Math.max(1, resizePercent) / 100;
      return {
        width: Math.max(1, Math.round(sourceWidth * scale)),
        height: Math.max(1, Math.round(sourceHeight * scale))
      };
    }
    return {
      width: Math.max(1, Math.round(resizeWidth || sourceWidth)),
      height: Math.max(1, Math.round(resizeHeight || sourceHeight))
    };
  }

  function updateResizeWidth(width: number) {
    const nextWidth = Math.max(1, Math.round(width || 1));
    setResizeWidth(nextWidth);
    if (resizeKeepRatio && summary?.image) {
      setResizeHeight(Math.max(1, Math.round(nextWidth * (summary.image.height / summary.image.width))));
    }
  }

  function updateResizeHeight(height: number) {
    const nextHeight = Math.max(1, Math.round(height || 1));
    setResizeHeight(nextHeight);
    if (resizeKeepRatio && summary?.image) {
      setResizeWidth(Math.max(1, Math.round(nextHeight * (summary.image.width / summary.image.height))));
    }
  }

  async function runResize() {
    const source = ensureFile("image");
    const dimensions = resolveResizeDimensions();
    const blob = await resizeImage(source, { width: dimensions.width, height: dimensions.height, format: resizeFormat, quality: resizeQuality / 100 });
    finishTask(blob, fileNameWithSuffix(source.name, "resized", resizeFormat));
  }

  async function runWatermark() {
    const source = ensureFile("image");
    const position = watermarkPosition as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tile";
    const blob = watermarkMode === "image" && watermarkImage
      ? await addImageWatermark(source, { watermark: watermarkImage, scale: 0.18, opacity: watermarkOpacity / 100, rotate: 0, position }, watermarkFormat, 0.9)
      : await addTextWatermark(source, { text: watermarkText, fontSize: watermarkFontSize, color: watermarkColor, opacity: watermarkOpacity / 100, bold: true, rotate: -18, position }, watermarkFormat, 0.9);
    finishTask(blob, fileNameWithSuffix(source.name, "watermarked", watermarkFormat));
  }

  async function runCompress() {
    const source = ensureFile("image");
    const qualityByStrength: Record<string, number> = { light: 86, recommended: compressQuality, extreme: 45 };
    const blob = await compressImage(source, {
      quality: qualityByStrength[compressStrength] || compressQuality,
      targetSizeBytes: parseTargetSize(targetSize),
      keepOriginalSize,
      maxWidthOrHeight: maxSize,
      format: "jpg",
      onProgress: (value, message) => {
        setProgress(value);
        setProgressMessage(message || "正在压缩图片");
      }
    });
    const rate = Math.max(0, 100 - (blob.size / source.size) * 100);
    setCompressionStats(`压缩前 ${formatBytes(source.size)}，压缩后 ${formatBytes(blob.size)}，体积减少 ${rate.toFixed(1)}%。`);
    finishTask(blob, fileNameWithSuffix(source.name, "compressed", "jpg"));
  }

  async function selectedPdfPages(source: File) {
    const total = summary?.pdf?.pages || await getPdfPageCount(source);
    const pages = parsePageSelection(pdfPages, total);
    if (!pages.length) throw new Error("页码范围无效，请输入 all 或类似 1-3,5 的页码。");
    return pages;
  }

  async function runPdfImages() {
    const source = ensureFile("pdf");
    const pages = await selectedPdfPages(source);
    const scale = pdfScale === "ultra" ? 3 : pdfScale === "high" ? 2 : 1.2;
    if (pdfImageMode === "combined") {
      const rendered = await renderPdfPages(source, { pages, format: pdfImageFormat, scale, onProgress: (value, message) => {
        setProgress(value * 0.7);
        setProgressMessage(message || "正在渲染 PDF 页面");
      } });
      const blob = await combineImagePages(rendered.map((page) => ({
        pageNumber: page.pageNumber,
        label: `第 ${page.pageNumber} 页`,
        blob: page.blob
      })), pdfImageFormat, (value, message) => {
        setProgress(0.7 + value * 0.3);
        setProgressMessage(message || "正在合成一页图片");
      });
      finishTask(blob, `${safeBaseName(source.name)}_combined.${pdfImageFormat}`, "PDF 已合成为一张长图，可以下载。");
      return;
    }
    if (pages.length === 1) {
      const blob = await renderPdfPageToBlob(source, pages[0], pdfImageFormat, scale);
      finishTask(blob, `${safeBaseName(source.name)}_page_${String(pages[0]).padStart(3, "0")}.${pdfImageFormat}`);
      return;
    }
    const blob = await renderPdfPagesToZip(source, { pages, format: pdfImageFormat, scale, onProgress: (value) => setProgress(value) }, safeBaseName(source.name));
    finishTask(blob, `${safeBaseName(source.name)}_pages.zip`);
  }

  async function runWordImages() {
    const source = ensureFile("word");
    const pages = await renderDocxToImagePages(source, { format: officeImageFormat, onProgress: (value, message) => {
      setProgress(value * 0.7);
      setProgressMessage(message || "正在渲染 Word 文档");
    } });
    if (officeImageMode === "combined") {
      const blob = await combineImagePages(pages, officeImageFormat, (value, message) => {
        setProgress(0.7 + value * 0.3);
        setProgressMessage(message || "正在合成一页图片");
      });
      finishTask(blob, fileNameWithSuffix(source.name, "combined", officeImageFormat), "Word 已合成为一张长图，可以下载。");
      return;
    }
    if (pages.length === 1) {
      finishTask(pages[0].blob, fileNameWithSuffix(source.name, "page_001", officeImageFormat));
      return;
    }
    const blob = await imagePagesToZip(pages, safeBaseName(source.name), officeImageFormat, (value) => setProgress(0.7 + value * 0.3));
    finishTask(blob, `${safeBaseName(source.name)}_pages.zip`, "Word 已逐页导出并打包，可以下载。");
  }

  async function runExcelImages() {
    const source = ensureFile("excel");
    const pages = await renderExcelToImagePages(source, { format: officeImageFormat, onProgress: (value, message) => {
      setProgress(value * 0.7);
      setProgressMessage(message || "正在渲染 Excel 工作表");
    } });
    if (officeImageMode === "combined") {
      const blob = await combineImagePages(pages, officeImageFormat, (value, message) => {
        setProgress(0.7 + value * 0.3);
        setProgressMessage(message || "正在合成一页图片");
      });
      finishTask(blob, fileNameWithSuffix(source.name, "combined", officeImageFormat), "Excel 已合成为一张长图，可以下载。");
      return;
    }
    if (pages.length === 1) {
      finishTask(pages[0].blob, fileNameWithSuffix(source.name, "sheet_001", officeImageFormat));
      return;
    }
    const blob = await imagePagesToZip(pages, safeBaseName(source.name), officeImageFormat, (value) => setProgress(0.7 + value * 0.3));
    finishTask(blob, `${safeBaseName(source.name)}_sheets.zip`, "Excel 已逐页导出并打包，可以下载。");
  }

  async function runVideoConvert() {
    const source = ensureFile("video");
    const controller = new AbortController();
    mediaAbortRef.current = controller;
    const blob = await convertVideoFormat(source, { format: videoFormat, quality: mediaQuality, videoSize, audioBitrate, stripMetadata, signal: controller.signal, onProgress: (value) => setProgress(value) }).finally(() => { mediaAbortRef.current = null; });
    finishTask(blob, fileNameWithSuffix(source.name, "converted", videoFormat), "视频已在本机转换完成，可以下载。");
  }

  async function runAudioConvert() {
    const source = ensureFile("audio");
    const controller = new AbortController();
    mediaAbortRef.current = controller;
    const blob = await convertAudioFormat(source, { format: audioFormat, quality: mediaQuality, audioBitrate, stripMetadata, signal: controller.signal, onProgress: (value) => setProgress(value) }).finally(() => { mediaAbortRef.current = null; });
    finishTask(blob, fileNameWithSuffix(source.name, "converted", audioFormat), "音频已在本机转换完成，可以下载。");
  }

  async function runVideoExtractAudio() {
    const source = ensureFile("video");
    const controller = new AbortController();
    mediaAbortRef.current = controller;
    const blob = await extractAudioFromVideo(source, { format: extractedAudioFormat, quality: mediaQuality, audioBitrate, stripMetadata, signal: controller.signal, onProgress: (value) => setProgress(value) }).finally(() => { mediaAbortRef.current = null; });
    finishTask(blob, fileNameWithSuffix(source.name, "audio", extractedAudioFormat), "音频已从视频中提取完成，可以下载。");
  }

  async function runBatch() {
    if (!isDesktopSurface) throw new Error("批量处理仅在离线安装版中提供。");
    const tasks = batchTasks.filter((task) => task.status === "queued" || task.status === "failed" || task.status === "cancelled");
    if (!tasks.length) throw new Error("请先添加需要批量处理的文件，或重试失败任务。");
    setProgressMessage(`准备批量处理 ${tasks.length} 个任务。`);
    const fallbackZip = new JSZip();
    let fallbackCount = 0;
    let failedInRun = 0;

    for (const [index, task] of tasks.entries()) {
      if (cancelRef.current) {
        markRemainingTasksCancelled(tasks.slice(index));
        throw new Error("用户取消处理。");
      }

      setActiveTaskId(task.id);
      updateBatchTask(task.id, { status: "running", progress: 0, error: undefined });
      const baseProgress = index / tasks.length;
      const segment = 1 / tasks.length;
      const setBatchProgress = (value: number, message?: string) => {
        const safeValue = Math.max(0, Math.min(1, value));
        setProgress(Math.min(0.98, baseProgress + safeValue * segment));
        setProgressMessage(message || `正在处理：${task.fileName}`);
        updateBatchTask(task.id, { progress: safeValue });
      };

      try {
        const result = await processBatchTask(task, setBatchProgress);
        let outputPath = result.outputPath || "";
        if (!outputPath && result.blob) {
          outputPath = await saveBatchResult(result.blob, result.name);
        }
        if (!outputPath && result.blob) {
          fallbackZip.file(result.name, result.blob);
          fallbackCount += 1;
        }
        const completedAt = Date.now();
        const nextTask: BatchTask = {
          ...task,
          status: "success",
          progress: 1,
          resultName: result.name,
          outputPath: outputPath || `浏览器下载包/${result.name}`,
          backend: result.backend,
          completedAt
        };
        updateBatchTask(task.id, nextTask);
        saveBatchHistory(nextTask);
      } catch (reason) {
        const message = friendlyError(reason);
        const failureBackend = getFailureBackend(reason) || task.backend || "wasm";
        failedInRun += 1;
        const completedAt = Date.now();
        const nextTask: BatchTask = {
          ...task,
          status: cancelRef.current ? "cancelled" : "failed",
          progress: 0,
          error: message,
          backend: failureBackend,
          completedAt
        };
        updateBatchTask(task.id, nextTask);
        saveBatchHistory(nextTask);
        if (cancelRef.current) throw reason;
      }
    }

    setActiveTaskId("");
    if (fallbackCount > 0) {
      const blob = await fallbackZip.generateAsync({ type: "blob" }, (metadata) => {
        setProgress(0.98 + (metadata.percent / 100) * 0.02);
        setProgressMessage("正在打包未写入目录的批量处理结果");
      });
      finishTask(blob, `万能格式转换器_批量处理结果_${Date.now()}.zip`, `已完成批量任务，部分结果已打包为 ZIP。`);
    } else {
      setProgressMessage(`批量任务处理完成。结果目录：${outputDirectory.label}`);
    }
    setProgress(1);
    if (failedInRun > 0) setError("部分任务处理失败，请在任务队列中查看失败原因并重试。");
  }

  async function processBatchTask(task: BatchTask, onProgress: (value: number, message?: string) => void): Promise<{ blob?: Blob; name: string; outputPath?: string; backend: "wasm" | "sidecar" }> {
    const item = task.file;
    const mode = task.mode;
    const sidecarResult = await maybeRunSidecarBatchTask(task, onProgress);
    if (sidecarResult) return sidecarResult;

    if (mode === "compress") {
      const qualityByStrength: Record<string, number> = { light: 86, recommended: compressQuality, extreme: 45 };
      const blob = await compressImage(item, {
        quality: qualityByStrength[compressStrength] || compressQuality,
        targetSizeBytes: parseTargetSize(targetSize),
        keepOriginalSize,
        maxWidthOrHeight: maxSize,
        format: "jpg",
        onProgress
      });
      return { blob, name: fileNameWithSuffix(item.name, "compressed", "jpg"), backend: "wasm" };
    }

    if (mode === "watermark") {
      const position = watermarkPosition as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tile";
      onProgress(0.2, `正在添加水印：${item.name}`);
      const blob = watermarkMode === "image" && watermarkImage
        ? await addImageWatermark(item, { watermark: watermarkImage, scale: 0.18, opacity: watermarkOpacity / 100, rotate: 0, position }, watermarkFormat, 0.9)
        : await addTextWatermark(item, { text: watermarkText, fontSize: watermarkFontSize, color: watermarkColor, opacity: watermarkOpacity / 100, bold: true, rotate: -18, position }, watermarkFormat, 0.9);
      onProgress(1, `已完成：${item.name}`);
      return { blob, name: fileNameWithSuffix(item.name, "watermarked", watermarkFormat), backend: "wasm" };
    }

    if (mode === "word-images") {
      const pages = await renderDocxToImagePages(item, { format: officeImageFormat, onProgress });
      if (officeImageMode === "combined") {
        const blob = await combineImagePages(pages, officeImageFormat, onProgress);
        return { blob, name: fileNameWithSuffix(item.name, "combined", officeImageFormat), backend: "wasm" };
      }
      if (pages.length === 1) return { blob: pages[0].blob, name: fileNameWithSuffix(item.name, "page_001", officeImageFormat), backend: "wasm" };
      const blob = await imagePagesToZip(pages, safeBaseName(item.name), officeImageFormat, onProgress);
      return { blob, name: `${safeBaseName(item.name)}_pages.zip`, backend: "wasm" };
    }

    if (mode === "excel-images") {
      const pages = await renderExcelToImagePages(item, { format: officeImageFormat, onProgress });
      if (officeImageMode === "combined") {
        const blob = await combineImagePages(pages, officeImageFormat, onProgress);
        return { blob, name: fileNameWithSuffix(item.name, "combined", officeImageFormat), backend: "wasm" };
      }
      if (pages.length === 1) return { blob: pages[0].blob, name: fileNameWithSuffix(item.name, "sheet_001", officeImageFormat), backend: "wasm" };
      const blob = await imagePagesToZip(pages, safeBaseName(item.name), officeImageFormat, onProgress);
      return { blob, name: `${safeBaseName(item.name)}_sheets.zip`, backend: "wasm" };
    }

    if (mode === "video-convert") {
      const controller = new AbortController();
      mediaAbortRef.current = controller;
      const blob = await convertVideoFormat(item, { format: videoFormat, quality: mediaQuality, videoSize, audioBitrate, stripMetadata, signal: controller.signal, onProgress }).finally(() => { mediaAbortRef.current = null; });
      return { blob, name: fileNameWithSuffix(item.name, "converted", videoFormat), backend: "wasm" };
    }

    if (mode === "video-audio") {
      const controller = new AbortController();
      mediaAbortRef.current = controller;
      const blob = await extractAudioFromVideo(item, { format: extractedAudioFormat, quality: mediaQuality, audioBitrate, stripMetadata, signal: controller.signal, onProgress }).finally(() => { mediaAbortRef.current = null; });
      return { blob, name: fileNameWithSuffix(item.name, "audio", extractedAudioFormat), backend: "wasm" };
    }

    const controller = new AbortController();
    mediaAbortRef.current = controller;
    const blob = await convertAudioFormat(item, { format: audioFormat, quality: mediaQuality, audioBitrate, stripMetadata, signal: controller.signal, onProgress }).finally(() => { mediaAbortRef.current = null; });
    return { blob, name: fileNameWithSuffix(item.name, "converted", audioFormat), backend: "wasm" };
  }

  async function maybeRunSidecarBatchTask(task: BatchTask, onProgress: (value: number, message?: string) => void) {
    const sourcePath = task.sourcePath || getNativeFilePath(task.file);
    const sidecarMode = getSidecarExperimentMode({
      mode: task.mode,
      fileName: task.fileName,
      videoFormat,
      audioFormat
    });

    if (!shouldUseSidecarExperiment({
      isDesktopSurface,
      enabled: sidecarExperimentEnabled,
      status: sidecarStatus || undefined,
      outputDirectory,
      sourcePath,
      mode: task.mode,
      fileName: task.fileName,
      videoFormat,
      audioFormat
    })) {
      if (sidecarExperimentEnabled && (task.mode === "audio-convert" || task.mode === "video-convert" || task.mode === "video-audio")) {
        onProgress(0.02, sidecarUnsupportedReason({ mode: task.mode, fileName: task.fileName, videoFormat, audioFormat }));
      }
      return null;
    }

    if (!sidecarMode || outputDirectory.kind !== "tauri" || !sourcePath) return null;
    onProgress(0.05, `sidecar 低风险优先处理中：${task.fileName}`);
    const result = await runSidecarExperiment(sidecarMode, {
      inputPath: sourcePath,
      outputDir: outputDirectory.path,
      outputName: safeBaseName(task.fileName)
    });
    if (result.status !== "ok" || !result.outputPath) {
      const sidecarError = new Error(`${result.message || "sidecar FFmpeg 处理失败"}。当前文件没有上传服务器。你可以关闭 sidecar 优先处理，改用 FFmpeg WASM 后重试。`) as Error & { backend?: "sidecar" };
      sidecarError.backend = "sidecar";
      throw sidecarError;
    }
    onProgress(1, `sidecar 低风险优先完成：${result.sanitizedOutputPath || task.fileName}`);
    return {
      name: fileNameFromPath(result.outputPath),
      outputPath: result.outputPath,
      backend: "sidecar" as const
    };
  }

  function updateBatchTask(id: string, patch: Partial<BatchTask>) {
    setBatchTasks((current) => current.map((task) => task.id === id ? { ...task, ...patch } : task));
  }

  function markRemainingTasksCancelled(tasks: BatchTask[]) {
    const ids = new Set(tasks.map((task) => task.id));
    const completedAt = Date.now();
    saveBatchHistory(tasks
      .filter((task) => task.status === "queued")
      .map((task) => ({
        ...task,
        status: "cancelled" as const,
        error: "用户取消处理",
        completedAt
      })));
    setBatchTasks((current) => current.map((task) => ids.has(task.id) && task.status === "queued" ? {
      ...task,
      status: "cancelled",
      error: "用户取消处理",
      completedAt
    } : task));
  }

  async function saveBatchResult(blob: Blob, name: string) {
    if (outputDirectory.kind === "tauri") {
      const tauri = getTauriApi();
      if (!tauri?.fs?.writeBinaryFile) return "";
      const outputPath = joinLocalPath(outputDirectory.path, name);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      await tauri.fs.writeBinaryFile({ path: outputPath, contents: bytes });
      return outputPath;
    }

    if (outputDirectory.kind === "browser") {
      const fileHandle = await outputDirectory.handle.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return `${outputDirectory.label}/${name}`;
    }

    return "";
  }

  function handleDownload() {
    if (!resultBlob || !resultName) return;
    downloadBlob(resultBlob, resultName);
  }

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const batchCounts = getBatchCounts(batchTasks);
  const taskCount = activeTab === "batch" ? batchCounts.total : file ? 1 : 0;
  const successCount = activeTab === "batch" ? batchCounts.success : status === "done" ? 1 : 0;
  const failureCount = activeTab === "batch" ? batchCounts.failed : status === "error" ? 1 : 0;
  const runnableBatchCount = batchTasks.filter((task) => task.status === "queued" || task.status === "failed" || task.status === "cancelled").length;
  const canStartTask = activeTab === "batch" ? runnableBatchCount > 0 && status !== "running" : taskCount > 0 && status !== "running";
  const desktopStatusText = getDesktopStatusText(status);
  const progressText = getProgressText(progress, taskCount, progressMessage);
  const outputFormat = getOutputFormatLabel({
    activeTab,
    batchMode,
    cropFormat,
    resizeFormat,
    watermarkFormat,
    pdfImageFormat,
    officeImageFormat,
    videoFormat,
    audioFormat,
    extractedAudioFormat
  });
  const controlPanel = (
    <ControlPanel
      activeTab={activeTab}
      cropFormat={cropFormat} setCropFormat={setCropFormat} cropQuality={cropQuality} setCropQuality={setCropQuality} cropRatio={cropRatio} setCropRatio={setCropRatio} cropRatioOptions={cropRatioOptions} rotateCrop={rotateCrop} flipCrop={flipCrop} resetCrop={resetCrop}
      resizeMode={resizeMode} setResizeMode={setResizeMode} resizePercent={resizePercent} setResizePercent={setResizePercent} resizeKeepRatio={resizeKeepRatio} setResizeKeepRatio={setResizeKeepRatio} resizeWidth={resizeWidth} setResizeWidth={updateResizeWidth} resizeHeight={resizeHeight} setResizeHeight={updateResizeHeight} resizeFormat={resizeFormat} setResizeFormat={setResizeFormat} resizeQuality={resizeQuality} setResizeQuality={setResizeQuality}
      watermarkText={watermarkText} setWatermarkText={setWatermarkText} watermarkMode={watermarkMode} setWatermarkMode={setWatermarkMode} setWatermarkImage={setWatermarkImage} watermarkPosition={watermarkPosition} setWatermarkPosition={setWatermarkPosition} watermarkOpacity={watermarkOpacity} setWatermarkOpacity={setWatermarkOpacity} watermarkFontSize={watermarkFontSize} setWatermarkFontSize={setWatermarkFontSize} watermarkColor={watermarkColor} setWatermarkColor={setWatermarkColor} watermarkFormat={watermarkFormat} setWatermarkFormat={setWatermarkFormat}
      compressStrength={compressStrength} setCompressStrength={setCompressStrength} compressQuality={compressQuality} setCompressQuality={setCompressQuality} targetSize={targetSize} setTargetSize={setTargetSize} maxSize={maxSize} setMaxSize={setMaxSize} keepOriginalSize={keepOriginalSize} setKeepOriginalSize={setKeepOriginalSize}
      pdfPages={pdfPages} setPdfPages={setPdfPages} pdfImageFormat={pdfImageFormat} setPdfImageFormat={setPdfImageFormat} pdfScale={pdfScale} setPdfScale={setPdfScale} pdfImageMode={pdfImageMode} setPdfImageMode={setPdfImageMode}
      officeImageMode={officeImageMode} setOfficeImageMode={setOfficeImageMode} officeImageFormat={officeImageFormat} setOfficeImageFormat={setOfficeImageFormat}
      mediaReport={mediaReport} videoFormat={videoFormat} setVideoFormat={setVideoFormat} audioFormat={audioFormat} setAudioFormat={setAudioFormat} extractedAudioFormat={extractedAudioFormat} setExtractedAudioFormat={setExtractedAudioFormat} mediaQuality={mediaQuality} setMediaQuality={setMediaQuality} videoSize={videoSize} setVideoSize={setVideoSize} audioBitrate={audioBitrate} setAudioBitrate={setAudioBitrate} stripMetadata={stripMetadata} setStripMetadata={setStripMetadata}
      batchMode={batchMode} setBatchMode={setBatchMode} batchFiles={batchFiles}
    />
  );

  if (isDesktopSurface) {
    const navGroups = [
      { label: "首页工作台", tab: "crop" as TabId },
      { label: "图片工具", tab: "compress" as TabId },
      { label: "文档工具", tab: "pdf-images" as TabId },
      { label: "音视频工具", tab: "video-convert" as TabId },
      { label: "批量任务", tab: "batch" as TabId },
      { label: "结果管理", href: "#results-panel" },
      { label: "使用教程", href: "/tutorials" },
      { label: "隐私政策", href: "/privacy" },
      { label: "开源许可证", href: "/licenses" },
      { label: "设置中心", href: "#settings-panel" },
      { label: "关于我们", href: "/about" }
    ];

    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#050b14] text-slate-100">
        <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_340px]">
          <aside className="border-b border-cyan-300/15 bg-slate-950 px-4 py-4 md:border-b-0 md:border-r md:py-6">
            <div className="mb-5 hidden md:block">
              <p className="text-xs font-semibold text-cyan-300">离线专业版</p>
              <h1 className="mt-1 text-xl font-bold text-slate-50">万能格式转换器</h1>
              <p className="mt-2 text-xs leading-5 text-slate-400">断网可用，文件不上传服务器。</p>
            </div>
            <nav className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto pb-1 md:grid-flow-row md:auto-cols-auto md:overflow-visible md:pb-0">
              {navGroups.map((item) => {
                const active = "tab" in item && item.tab === activeTab;
                if ("href" in item) {
                  return (
                    <a key={item.label} href={item.href} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-cyan-400/10 hover:text-cyan-100">
                      {item.label}
                    </a>
                  );
                }
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${active ? "bg-cyan-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.22)]" : "text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-100"}`}
                    onClick={() => setActiveTab(item.tab)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-7">
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DesktopMetric label="任务总数" value={taskCount} />
              <DesktopMetric label="成功" value={successCount} tone="success" />
              <DesktopMetric label="失败" value={failureCount} tone="danger" />
              <DesktopMetric label="当前功能" value={currentTab.label} />
            </div>

            <div className="rounded-xl tech-panel p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-50">专业工作台</h2>
                  <p className="mt-1 text-sm text-slate-400">添加文件后按任务队列处理，所有文件仅在本机运行，不调用云端转换 API。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none" type="button" disabled={!canStartTask} onClick={() => void runCurrentTask()} title={taskCount ? undefined : "请先添加文件后再开始处理"}>
                    {status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
                    开始处理
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100" type="button" onClick={cancelTask}>
                    <Square className="h-4 w-4 fill-current" />
                    取消
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-cyan-400/10" type="button" onClick={() => void selectOutputDirectory()}>
                    <FolderOpen className="h-4 w-4" />
                    输出目录
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-cyan-400/10" type="button" onClick={clearCompletedBatchTasks}>
                    <Trash2 className="h-4 w-4" />
                    清空完成
                  </button>
                  <button className="inline-flex items-center justify-center rounded-xl border border-cyan-300/20 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-cyan-400/10" type="button" onClick={clearAllBatchTasks}>
                    清空全部
                  </button>
                </div>
              </div>
              {!taskCount ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">请先添加文件后再开始处理。</p> : null}

              <div
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-cyan-300/35 bg-cyan-950/20 px-4 text-center transition hover:border-cyan-300 hover:bg-cyan-400/10"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (activeTab === "batch") handleBatchFiles(event.dataTransfer.files);
                  else void handleFile(event.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={inputRef}
                  className="hidden"
                  type="file"
                  accept={accept}
                  multiple={activeTab === "batch"}
                  onChange={(event) => activeTab === "batch" ? handleBatchFiles(event.target.files) : void handleFile(event.target.files?.[0])}
                />
                <input
                  ref={folderInputRef}
                  className="hidden"
                  type="file"
                  multiple
                  onChange={(event) => handleFolderInputFiles(event.target.files)}
                  {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
                />
                <p className="text-lg font-semibold text-slate-50">{activeTab === "batch" ? "添加一组文件到批量任务队列" : "添加文件到当前任务"}</p>
                <p className="mt-2 text-sm text-slate-400">支持拖拽或点击选择。断网状态下核心功能仍可使用。</p>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-cyan-300/15">
                <div className="grid min-w-[900px] grid-cols-[minmax(180px,1.4fr)_100px_90px_110px_96px_minmax(150px,1fr)_130px] bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-400">
                  <span>文件名</span>
                  <span>类型</span>
                  <span>大小</span>
                  <span>输出格式</span>
                  <span>状态</span>
                  <span>失败原因</span>
                  <span>操作</span>
                </div>
                <div className="divide-y divide-cyan-300/10 bg-slate-950/50">
                  {activeTab === "batch" && batchTasks.length ? batchTasks.map((task) => (
                    <DesktopBatchTaskRow
                      key={task.id}
                      task={task}
                      active={activeTaskId === task.id}
                      onRetry={() => retryBatchTask(task.id)}
                      onCancel={() => cancelBatchTask(task.id)}
                      onOpenResult={() => void openResultFile(task)}
                      onCopy={() => void copyText(task.outputPath || task.resultName)}
                    />
                  )) : file && summary ? (
                    <DesktopTaskRow name={summary.name} type={currentTab.label} size={formatBytes(summary.size)} outputFormat={outputFormat} status={status} error={error} />
                  ) : (
                    <DesktopEmptyQueue onPickFile={() => inputRef.current?.click()} onPickFolder={() => void importFolder()} onPickOutputDirectory={() => void selectOutputDirectory()} />
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-300/10 bg-slate-900/70 p-4">
                <div className="h-3 overflow-hidden rounded-full bg-slate-950">
                  <div className="h-full rounded-full bg-cyan-400 transition-all shadow-[0_0_18px_rgba(34,211,238,0.45)]" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                  <span>{progressText}</span>
                  <StatusBadge status={status} />
                </div>
                {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">处理失败：{error}。下一步：请检查文件格式、降低文件大小或重新添加文件后再试。</p> : null}
                {resultName ? (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />已生成：{resultName}</span>
                    <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white" type="button" onClick={handleDownload}>下载结果</button>
                  </div>
                ) : null}
              </div>

              <div id="results-panel" className="mt-4 grid scroll-mt-24 gap-4 xl:grid-cols-2">
                {activeTab !== "batch" && summary ? <FileSummaryView summary={summary} /> : <BatchSummaryView files={batchFiles} mode={batchMode} importSummary={importSummary} />}
                <div className="rounded-xl border border-cyan-300/10 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
                  <p className="font-semibold text-slate-50">结果管理</p>
                  <p className="mt-2">成功 {successCount} 个，失败 {failureCount} 个。失败任务可在队列中查看原因并重试。</p>
                  <p className="mt-2">当前输出目录：{outputDirectory.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="rounded-lg border border-cyan-300/20 bg-slate-950 px-3 py-2 font-semibold text-slate-200 hover:bg-cyan-400/10" type="button" onClick={() => void openOutputDirectory()}>打开输出目录</button>
                    <button className="rounded-lg border border-cyan-300/20 bg-slate-950 px-3 py-2 font-semibold text-slate-200 hover:bg-cyan-400/10" type="button" onClick={() => void copyText(outputDirectory.kind === "tauri" ? outputDirectory.path : outputDirectory.label)}>复制输出路径</button>
                    <button className="rounded-lg border border-cyan-300/20 bg-slate-950 px-3 py-2 font-semibold text-slate-200 hover:bg-cyan-400/10" type="button" onClick={() => void exportBatchLog()}>导出处理日志</button>
                  </div>
                  {batchLogMessage ? <p className="mt-2 text-cyan-300">{batchLogMessage}</p> : null}
                </div>
              </div>
              <BatchHistoryPanel history={batchHistory} filter={batchHistoryFilter} onFilterChange={setBatchHistoryFilter} onClear={clearBatchHistory} />
            </div>
          </section>

          <aside id="settings-panel" className="scroll-mt-24 border-t border-cyan-300/15 bg-slate-950 px-4 py-5 md:col-start-2 xl:col-start-auto xl:border-l xl:border-t-0">
            <div className="mb-4">
              <p className="text-xs font-semibold text-cyan-300">参数面板</p>
              <h2 className="mt-1 text-lg font-bold text-slate-50">{currentTab.label}</h2>
              <p className="mt-1 text-sm text-slate-400">{currentTab.description}</p>
            </div>
            <div className="space-y-3">
              <SettingsSection title="当前参数">
                {controlPanel}
              </SettingsSection>
              <SettingsSection title="导出设置">
                <DesktopSettingRow label="输出格式" value={outputFormat} />
                <DesktopSettingRow label="输出目录" value={outputDirectory.label} note="点击顶部“输出目录”可选择本地保存位置" />
                <DesktopSettingRow label="命名规则" value="原文件名 + 功能后缀" note="已用于批量结果命名" />
              </SettingsSection>
              <SettingsSection title="批量设置">
                <DesktopSettingRow label="并发数量" value="1 个任务" note="顺序处理，降低大文件内存占用" />
                <DesktopSettingRow label="覆盖策略" value="覆盖同名结果" note="建议为不同批次选择独立输出目录" />
              </SettingsSection>
              <SettingsSection title="高级设置">
                <DesktopSettingRow label="清理 EXIF" value="按功能参数执行" note="音视频元数据按开关处理" />
                <DesktopSettingRow label="失败处理" value="保留失败原因，可重试" note="失败任务不会影响其他任务继续处理" />
              </SettingsSection>
              <SettingsSection title="本地后端">
                <SidecarExperimentPanel
                  enabled={sidecarExperimentEnabled}
                  status={sidecarStatus}
                  onToggle={toggleSidecarExperiment}
                  onRefresh={() => void refreshSidecarStatus()}
                />
              </SettingsSection>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-950/20 p-4 text-sm leading-6 text-cyan-50">
              <p className="font-semibold text-slate-50">本地处理承诺</p>
              <p className="mt-2">文件仅在本机处理，不上传服务器，不调用云端转换 API。CloudBase 只用于下载授权，不接触用户处理文件。</p>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-cyan-300/15 bg-slate-950/95 px-4 py-2 text-xs text-slate-400 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1">
            <span className="font-semibold text-emerald-700">离线可用</span>
            <span>状态：{desktopStatusText}</span>
            <span>版本 1.0.0</span>
            <span>任务 {taskCount}</span>
            <span>成功 {successCount}</span>
            <span>失败 {failureCount}</span>
            <span>大文件建议分批处理，避免内存占用过高</span>
            <span>输出目录：{outputDirectory.label}</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-transparent text-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-2xl tech-panel p-5 sm:p-7">
          <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">{isDesktopSurface ? "本机离线处理" : "浏览器本地处理"}</div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl">万能格式转换器</h1>
            <p className="mt-3 max-w-6xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              先选功能，再添加文件。所有处理都在当前设备本地完成，文件不上传服务器。
              <span className="hidden sm:inline"> 支持图片、PDF、Word、Excel、视频和音频的常用格式转换。</span>
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-950/25 p-3 text-sm leading-6 text-cyan-50 sm:p-4">
            <p>{isDesktopSurface ? "你的文件只在当前电脑中处理，不需要联网，也不会上传服务器。" : privacyNotice}</p>
            <p className="mt-2">{pdfBoundaryNotice}</p>
            <p className="mt-2">广告脚本不会接收你正在处理的图片、PDF、Word、Excel、音频、视频或转换结果。</p>
          </div>
        </div>
      </section>

      <section id="tool-picker" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-xl tech-panel p-4 sm:p-5">
          <div className="mb-5">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-50">选择功能</h2>
                <p className="mt-1 text-sm text-slate-400">点击下方功能卡片后，再设置参数并开始处理。</p>
              </div>
              <span className="text-xs font-medium text-cyan-300">第 1 步 · 文件本地处理</span>
            </div>
            <p className="mb-2 text-xs font-medium text-cyan-300 md:hidden">左右滑动查看更多工具</p>
            <div className="relative">
              <div className="grid grid-flow-col auto-cols-[minmax(168px,1fr)] gap-3 overflow-x-auto pb-2 pr-8 md:grid-flow-row md:grid-cols-3 md:pr-0 xl:grid-cols-4">
                {tabs.map((tab) => (
                  <ToolTabButton
                    key={tab.id}
                    tab={tab}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-950/95 to-transparent md:hidden" />
            </div>
          </div>
          {activeTab === "batch-gate" ? (
            <BatchGateNotice />
          ) : (
          <>
          <div className="mb-5 rounded-xl border border-cyan-300/15 bg-slate-900/60 p-4 sm:p-5">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-50">添加文件</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {activeTab === "batch" ? "离线版批量处理支持一次添加多个文件，处理完成后统一打包下载。" : "根据当前选择的功能，上传对应的图片、PDF、Word、Excel、视频或音频文件。"}
                </p>
              </div>
              <span className="text-xs font-medium text-cyan-300">第 2 步</span>
            </div>
            <div
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300/35 bg-slate-950/60 px-4 text-center transition hover:border-cyan-300 hover:bg-cyan-400/10"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (activeTab === "batch") handleBatchFiles(event.dataTransfer.files);
                else void handleFile(event.dataTransfer.files[0]);
              }}
            >
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept={accept}
                multiple={activeTab === "batch"}
                onChange={(event) => activeTab === "batch" ? handleBatchFiles(event.target.files) : void handleFile(event.target.files?.[0])}
              />
              <p className="text-xl font-semibold text-slate-50">{activeTab === "batch" ? "点击添加多个文件，或把一组文件拖到这里" : "点击选择文件，或拖拽文件到这里"}</p>
              <p className="mt-2 text-sm text-slate-400">文件只在当前设备处理，不上传服务器</p>
            </div>
            {activeTab === "batch" ? <BatchSummaryView files={batchFiles} mode={batchMode} importSummary={importSummary} /> : summary ? <FileSummaryView summary={summary} /> : null}
            {activeTab !== "batch" && fileUrl && file && isImageFile(file) ? (
              <div className="mt-4">
                <div className="overflow-hidden rounded-xl border border-cyan-300/10 bg-slate-950">
                  <img
                    ref={cropImageRef}
                    className="max-h-[560px] w-full object-contain"
                    src={fileUrl}
                    alt="图片预览"
                    onLoad={() => setCropPreviewKey((value) => value + 1)}
                  />
                </div>
                {activeTab === "crop" ? (
                  <p className="mt-2 text-sm text-slate-300">拖动图片上的裁切框边角或边线即可自由裁切；选择固定比例后，裁切框会按比例锁定。</p>
                ) : null}
              </div>
            ) : null}
            {activeTab !== "batch" && fileUrl && file && isVideoFile(file) ? <video className="mt-4 max-h-96 w-full rounded-xl" src={fileUrl} controls /> : null}
            {activeTab !== "batch" && fileUrl && file && isAudioFile(file) ? <audio className="mt-4 w-full" src={fileUrl} controls /> : null}
          </div>
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="rounded-xl border border-cyan-300/15 bg-slate-900/70 p-4">
              {controlPanel}
            </div>
            <div className="rounded-xl border border-cyan-300/15 bg-slate-900/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="btn-primary inline-flex items-center justify-center gap-2" type="button" disabled={status === "running"} onClick={() => void runCurrentTask()}>
                  {status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
                  开始处理
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100" type="button" onClick={cancelTask}>
                  <Square className="h-5 w-5 fill-current" />
                  取消任务
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-600 px-5 py-3 font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none" type="button" disabled={!resultBlob} onClick={handleDownload}>
                  <Download className="h-5 w-5" />
                  下载结果
                </button>
              </div>
              {!resultBlob ? <p className="mt-2 text-sm text-slate-500">处理完成后可下载。</p> : null}
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950"><div className="h-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.45)]" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
              <div className="mt-2 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <span>{progressText}</span>
                <StatusBadge status={status} />
              </div>
              {compressionStats ? <p className="mt-2 text-sm font-medium text-cyan-300">{compressionStats}</p> : null}
              {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">处理失败：{error}。下一步：请检查文件格式、降低文件大小或重新添加文件后再试。</p> : null}
              {resultName ? <p className="mt-3 inline-flex w-full items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700"><CheckCircle2 className="h-5 w-5" />已生成：{resultName}</p> : null}
              {(activeTab === "resize" || activeTab === "watermark") ? (
                <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-50">{activeTab === "resize" ? "尺寸预览" : "水印预览"}</h3>
                    <span className="text-xs text-slate-400">{previewMessage || "选择图片后自动生成预览"}</span>
                  </div>
                  {previewUrl ? <img className="max-h-[420px] w-full rounded-xl object-contain bg-slate-950" src={previewUrl} alt="处理预览" /> : <div className="flex min-h-40 items-center justify-center rounded-xl bg-slate-950 text-sm text-slate-500">暂无预览</div>}
                </div>
              ) : null}
              <div className="mt-6 rounded-2xl border border-cyan-300/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                <p>PDF、Word、Excel 转图片均在本地完成。逐页导出适合后续分开使用，合成一页适合生成长图预览。</p>
                <p className="mt-2">Word 转图片目前支持标准 .docx 文档；旧版 .doc 请先另存为 .docx 后再处理。</p>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
        {!isDesktopSurface ? (
          <div id="ad-container" className="mt-8">
            <AdSlot config={adsConfig} name="toolBottom" />
          </div>
        ) : null}
      </section>
    </main>
  );
}

function FileSummaryView({ summary }: { summary: FileSummary }) {
  return (
    <div className="mt-4 grid gap-2 rounded-xl border border-cyan-300/10 bg-slate-950/60 p-4 text-sm text-slate-300 sm:grid-cols-2">
      <p>文件名：{summary.name}</p>
      <p>大小：{formatBytes(summary.size)}</p>
      <p>类型：{summary.type}</p>
      {summary.image ? <p>尺寸：{summary.image.width} x {summary.image.height}</p> : null}
      {summary.pdf ? <p>PDF 页数：{summary.pdf.pages || "待解析"}</p> : null}
      {summary.document ? <p>文档类型：{summary.document.kind === "word" ? "Word" : "Excel"}</p> : null}
      {summary.media ? <p>媒体类型：{summary.media.kind === "video" ? "视频" : "音频"}</p> : null}
      {summary.media?.duration ? <p>媒体时长：{formatMediaDuration(summary.media.duration)}</p> : null}
    </div>
  );
}

function BatchSummaryView({ files, mode, importSummary }: { files: File[]; mode: BatchMode; importSummary?: BatchImportSummary | null }) {
  if (!files.length) {
    return <div className="mt-4 rounded-xl border border-cyan-300/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">当前为离线版专属批量处理，请先选择批量功能类型，再一次添加多个对应文件。</div>;
  }
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);
  return (
    <div className="mt-4 rounded-xl border border-cyan-300/10 bg-slate-950/60 p-4 text-sm text-slate-300">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-slate-50">已添加 {files.length} 个文件</p>
        <p>总大小：{formatBytes(totalSize)}</p>
      </div>
      <p className="mt-2">批量类型：{batchModeLabel(mode)}</p>
      {importSummary ? <p className="mt-2">最近导入：共扫描 {importSummary.total} 个，导入 {importSummary.imported} 个，跳过 {importSummary.skipped} 个。</p> : null}
      <div className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-950 p-3">
        {files.slice(0, 20).map((item) => <p className="truncate" key={`${item.name}-${item.size}`}>{item.name} · {formatBytes(item.size)}</p>)}
        {files.length > 20 ? <p className="text-slate-500">还有 {files.length - 20} 个文件未展开显示。</p> : null}
      </div>
    </div>
  );
}

function BatchGateNotice() {
  return (
    <div className="mb-5 rounded-xl border border-cyan-300/15 bg-cyan-950/25 p-4 sm:p-5" data-testid="online-batch-gate">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-cyan-300">专业版能力</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-50">批量处理</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">需要批量处理大量图片、文档、音频或视频？</p>
          <p className="mt-2 text-sm font-semibold text-slate-50">批量处理为离线专业版功能，请下载 Windows 离线专业版使用。</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            离线专业版支持批量任务队列、输出目录选择、失败重试、处理日志、任务历史，所有文件仍然只在本地处理，不上传服务器。
          </p>
        </div>
        <a className="btn-primary inline-flex shrink-0 items-center justify-center gap-2" href="/download">
          <Download className="h-5 w-5" />
          下载离线专业版
        </a>
      </div>
    </div>
  );
}

function DesktopEmptyQueue({ onPickFile, onPickFolder, onPickOutputDirectory }: { onPickFile: () => void; onPickFolder: () => void; onPickOutputDirectory: () => void }) {
  const actions = [
    { label: "添加文件", icon: Files, onClick: onPickFile, note: "选择单个或多个文件", disabled: false },
    { label: "添加文件夹", icon: FolderOpen, onClick: onPickFolder, note: "扫描支持格式，自动跳过不支持文件", disabled: false },
    { label: "选择输出目录", icon: Download, onClick: onPickOutputDirectory, note: "结果将保存到本地目录", disabled: false }
  ];

  return (
    <div className="min-w-[860px] px-4 py-6">
      <div className="rounded-xl border border-dashed border-cyan-300/20 bg-slate-950/60 p-4">
        <p className="text-sm font-semibold text-slate-50">暂无任务</p>
        <p className="mt-1 text-sm text-slate-400">请先添加文件后再开始处理。批量任务会在这里显示状态、失败原因和操作。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} type="button" onClick={action.onClick} disabled={action.disabled} className="rounded-lg border border-cyan-300/15 bg-slate-900 p-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:bg-slate-900/50 disabled:opacity-75">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-50"><Icon className="h-4 w-4 text-cyan-300" />{action.label}</span>
                <span className="mt-1 block text-xs text-slate-400">{action.note}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DesktopBatchTaskRow({ task, active, onRetry, onCancel, onOpenResult, onCopy }: { task: BatchTask; active: boolean; onRetry: () => void; onCancel: () => void; onOpenResult: () => void; onCopy: () => void }) {
  const failureReason = task.status === "failed" || task.status === "cancelled" ? (task.error || "处理失败，请检查文件格式后重试") : "—";
  const canRetry = task.status === "failed" || task.status === "cancelled";
  const canCancel = task.status === "queued" || task.status === "running";
  const canOpen = task.status === "success" && Boolean(task.outputPath);

  return (
    <div
      className={`grid min-w-[900px] grid-cols-[minmax(180px,1.4fr)_100px_90px_110px_96px_minmax(150px,1fr)_130px] items-center gap-2 px-4 py-3 text-sm ${active ? "bg-cyan-400/10" : ""}`}
      data-testid="batch-task-row"
      data-task-id={task.id}
    >
      <span className="min-w-0 truncate font-medium text-slate-50" title={task.sourcePath || task.fileName}>{task.fileName}</span>
      <span className="truncate text-slate-300">{batchModeLabel(task.mode)}</span>
      <span className="truncate text-slate-300">{formatBytes(task.fileSize)}</span>
      <span className="truncate text-slate-300">{task.outputFormat}{task.backend ? ` · ${task.backend === "sidecar" ? "sidecar" : "WASM"}` : ""}</span>
      <BatchStatusBadge status={task.status} progress={task.progress} />
      <span className="min-w-0 truncate text-slate-400" title={failureReason}>{failureReason}</span>
      <span className="flex items-center gap-1">
        {canRetry ? <button type="button" className="rounded-lg border border-cyan-300/15 p-1.5 text-slate-200 hover:bg-cyan-400/10" title="重试" aria-label="重试任务" data-testid="retry-task-button" onClick={onRetry}><RotateCcw className="h-4 w-4" /></button> : null}
        {canCancel ? <button type="button" className="rounded-lg border border-red-300/20 p-1.5 text-red-200 hover:bg-red-400/10" title="取消" onClick={onCancel}><Square className="h-4 w-4 fill-current" /></button> : null}
        {canOpen ? <button type="button" className="rounded-lg border border-cyan-300/15 p-1.5 text-slate-200 hover:bg-cyan-400/10" title="打开结果文件" aria-label="打开结果文件" data-testid="open-result-file-button" onClick={onOpenResult}><ExternalLink className="h-4 w-4" /></button> : null}
        {task.outputPath ? <button type="button" className="rounded-lg border border-cyan-300/15 p-1.5 text-slate-200 hover:bg-cyan-400/10" title="复制输出路径" onClick={onCopy}><Copy className="h-4 w-4" /></button> : null}
      </span>
    </div>
  );
}

function BatchHistoryPanel({ history, filter, onFilterChange, onClear }: { history: BatchHistoryEntry[]; filter: BatchHistoryFilter; onFilterChange: (value: BatchHistoryFilter) => void; onClear: () => void }) {
  const filtered = filterBatchHistory(history, filter);
  const filters: Array<{ value: BatchHistoryFilter; label: string }> = [
    { value: "all", label: "全部" },
    { value: "success", label: "成功" },
    { value: "failed", label: "失败" },
    { value: "cancelled", label: "取消" }
  ];

  return (
    <section className="mt-4 rounded-xl border border-cyan-300/15 bg-slate-950/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-50">任务历史</p>
          <p className="mt-1 text-sm text-slate-400">仅保存在本机浏览器存储中，最多保留最近 100 条，不保存文件内容和完整路径。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${filter === item.value ? "bg-cyan-400 text-slate-950" : "border border-cyan-300/15 bg-slate-900 text-slate-200 hover:bg-cyan-400/10"}`}
              onClick={() => onFilterChange(item.value)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="rounded-lg border border-cyan-300/15 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-cyan-400/10" onClick={onClear}>清空历史</button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-cyan-300/15">
        <div className="grid min-w-[940px] grid-cols-[minmax(160px,1.3fr)_120px_90px_110px_100px_120px_minmax(150px,1fr)] bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-400">
          <span>文件名</span>
          <span>类型</span>
          <span>大小</span>
          <span>输出格式</span>
          <span>状态</span>
          <span>耗时</span>
          <span>结果 / 失败原因</span>
        </div>
        <div className="divide-y divide-cyan-300/10 bg-slate-950/40">
          {filtered.length ? filtered.map((item) => (
            <div key={item.id} className="grid min-w-[940px] grid-cols-[minmax(160px,1.3fr)_120px_90px_110px_100px_120px_minmax(150px,1fr)] items-center gap-2 px-4 py-3 text-sm">
              <span className="truncate font-medium text-slate-50" title={item.fileName}>{item.fileName}</span>
              <span className="truncate text-slate-300">{batchModeLabel(item.mode)}</span>
              <span className="truncate text-slate-300">{formatBytes(item.fileSize)}</span>
              <span className="truncate text-slate-300">{item.outputFormat}{item.backend ? ` · ${item.backend === "sidecar" ? "sidecar" : "WASM"}` : ""}</span>
              <BatchStatusBadge status={item.status} progress={1} />
              <span className="truncate text-slate-300">{formatDuration(item.durationMs)}</span>
              <span className="truncate text-slate-400" title={item.error || item.sanitizedOutputPath || item.resultName || ""}>
                {item.status === "success" ? (item.resultName || item.sanitizedOutputPath || "已完成") : (item.error || "处理失败")}
              </span>
            </div>
          )) : (
            <div className="min-w-[940px] px-4 py-6 text-sm text-slate-400">暂无符合条件的历史记录。</div>
          )}
        </div>
      </div>
    </section>
  );
}

function DesktopMetric({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "success" | "danger" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "danger" ? "text-red-300" : "text-slate-50";
  return (
    <div className="rounded-xl border border-cyan-300/15 bg-slate-950/70 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DesktopTaskRow({ name, type, size, outputFormat, status, error }: { name: string; type: string; size: string; outputFormat: string; status: ProcessState; error?: string }) {
  const failureReason = status === "error" ? (error || "处理失败，请检查文件格式后重试") : "—";

  return (
    <div className="grid min-w-[860px] grid-cols-[minmax(180px,1.4fr)_100px_90px_110px_96px_minmax(150px,1fr)_90px] items-center gap-2 px-4 py-3 text-sm">
      <span className="min-w-0 truncate font-medium text-slate-50" title={name}>{name}</span>
      <span className="truncate text-slate-300">{type}</span>
      <span className="truncate text-slate-300">{size}</span>
      <span className="truncate text-slate-300">{outputFormat}</span>
      <StatusBadge status={status} />
      <span className="min-w-0 truncate text-slate-400" title={failureReason}>{failureReason}</span>
      <button type="button" className="w-fit rounded-lg border border-cyan-300/15 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-cyan-400/10">
        重试
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: ProcessState }) {
  const statusText: Record<ProcessState, string> = {
    idle: "等待中",
    running: "处理中",
    done: "成功",
    error: "失败",
    cancelled: "已暂停"
  };
  const statusClass = status === "done"
    ? "bg-emerald-400/12 text-emerald-200 ring-1 ring-emerald-300/25"
    : status === "error"
      ? "bg-red-400/12 text-red-200 ring-1 ring-red-300/25"
      : status === "running"
        ? "bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/25"
        : status === "cancelled"
          ? "bg-amber-400/12 text-amber-200 ring-1 ring-amber-300/25"
          : "bg-slate-800 text-slate-300 ring-1 ring-slate-700";

  return <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{statusText[status]}</span>;
}

function BatchStatusBadge({ status, progress }: { status: BatchTaskStatus; progress: number }) {
  const statusClass = status === "success"
    ? "bg-emerald-400/12 text-emerald-200 ring-1 ring-emerald-300/25"
    : status === "failed"
      ? "bg-red-400/12 text-red-200 ring-1 ring-red-300/25"
      : status === "running"
        ? "bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/25"
        : status === "cancelled"
          ? "bg-amber-400/12 text-amber-200 ring-1 ring-amber-300/25"
          : "bg-slate-800 text-slate-300 ring-1 ring-slate-700";
  const suffix = status === "running" ? ` · ${Math.round(progress * 100)}%` : "";
  return <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{batchTaskStatusLabel(status)}{suffix}</span>;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-cyan-300/10 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function DesktopSettingRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-cyan-300/10 bg-slate-950/70 p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-slate-400">{label}</span>
        <span className="text-right font-semibold text-slate-100">{value}</span>
      </div>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}

function SidecarExperimentPanel({ enabled, status, onToggle, onRefresh }: { enabled: boolean; status: SidecarCheckResult | null; onToggle: (enabled: boolean) => void; onRefresh: () => void }) {
  const ready = isSidecarReady(status || undefined);
  return (
    <div className="rounded-lg border border-cyan-300/10 bg-slate-950/70 p-3 text-sm" data-testid="sidecar-experiment-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-50">使用本地 sidecar FFmpeg 优先处理低风险格式</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            当前仅适用于 WAV 转 FLAC、MP4 转 WebM 和媒体信息读取。其他音视频格式仍使用 FFmpeg WASM。所有文件仍在本机处理，不上传服务器。
          </p>
        </div>
        <label className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-200">
          <input
            type="checkbox"
            checked={enabled}
            disabled={!ready}
            aria-label="使用本地 sidecar FFmpeg 优先处理低风险格式"
            data-testid="sidecar-experiment-toggle"
            onChange={(event) => onToggle(event.target.checked)}
          />
          {enabled ? "低风险优先" : "已关闭"}
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ready ? "bg-emerald-400/12 text-emerald-200" : status?.status === "sidecar_checksum_failed" ? "bg-red-400/12 text-red-200" : "bg-slate-800 text-slate-300"}`}>
          {sidecarStatusText(status || undefined)}
        </span>
        <button type="button" className="rounded-lg border border-cyan-300/15 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-cyan-400/10" onClick={onRefresh}>
          刷新检测
        </button>
      </div>
      {status?.checksumFailures?.length ? <p className="mt-2 text-xs leading-5 text-red-700">{status.checksumFailures[0]}</p> : null}
      <p className="mt-2 text-xs leading-5 text-slate-400">
        BtbN 候选 FFmpeg 仍未完成商业许可证最终复核。如遇兼容问题，可关闭此选项后使用 FFmpeg WASM 重试。
      </p>
    </div>
  );
}

function ToolTabButton({ tab, active, onClick }: { tab: ToolTab; active: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  const activeClass = active
    ? "border-cyan-300 bg-cyan-400/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)] ring-2 ring-cyan-400/10"
    : tab.featured
      ? "border-cyan-300/18 bg-slate-900/75 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-400/10 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]"
      : "border-cyan-300/12 bg-slate-950/55 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/32 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]";
  const iconClass = active
    ? "bg-cyan-400 text-slate-950"
    : tab.featured
      ? "bg-cyan-400/12 text-cyan-200"
      : "bg-slate-800 text-slate-300";

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`group min-h-[104px] rounded-xl border p-4 text-left transition duration-200 active:scale-[0.98] ${activeClass}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-6">{tab.label}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-400">{tab.description}</span>
        </span>
      </div>
      {tab.featured ? <span className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">常用</span> : null}
    </button>
  );
}

type ControlPanelProps = any;

function ControlPanel(props: ControlPanelProps) {
  if (props.activeTab === "crop") return <Panel title="图片裁切" note="拖动预览图上的裁切框即可自由裁切，也可以选择头像、证件照、横屏封面、竖屏封面等常用比例。"><Select label="裁切比例" value={props.cropRatio} onChange={props.setCropRatio} options={props.cropRatioOptions} /><div className="grid grid-cols-2 gap-2"><button className="btn-secondary" type="button" onClick={() => props.rotateCrop(-90)}>左转 90°</button><button className="btn-secondary" type="button" onClick={() => props.rotateCrop(90)}>右转 90°</button><button className="btn-secondary" type="button" onClick={() => props.flipCrop("x")}>水平翻转</button><button className="btn-secondary" type="button" onClick={() => props.flipCrop("y")}>垂直翻转</button></div><button className="btn-secondary w-full" type="button" onClick={props.resetCrop}>重置裁切框</button><ImageFormat value={props.cropFormat} onChange={props.setCropFormat} /><Range label="导出质量" value={props.cropQuality} min={10} max={100} onChange={props.setCropQuality} /></Panel>;
  if (props.activeTab === "resize") return <Panel title="尺寸调整" note="可按百分比快速缩放，也可以输入像素宽高。右侧会自动显示处理预览。"><Select label="调整方式" value={props.resizeMode} onChange={props.setResizeMode} options={[{ value: "percent", label: "按百分比" }, { value: "pixel", label: "按像素" }]} />{props.resizeMode === "percent" ? <Field label="缩放比例"><select className="form-input" value={String(props.resizePercent)} onChange={(event) => props.setResizePercent(Number(event.target.value))}><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option><option value="125">125%</option><option value="150">150%</option><option value="200">200%</option></select></Field> : <><NumberField label="宽度（像素）" value={props.resizeWidth} onChange={props.setResizeWidth} /><NumberField label="高度（像素）" value={props.resizeHeight} onChange={props.setResizeHeight} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.resizeKeepRatio} onChange={(event) => props.setResizeKeepRatio(event.target.checked)} />锁定原图比例</label></>}<ImageFormat value={props.resizeFormat} onChange={props.setResizeFormat} /><Range label="导出质量" value={props.resizeQuality} min={10} max={100} onChange={props.setResizeQuality} /></Panel>;
  if (props.activeTab === "watermark") return <Panel title="添加水印" note="文字或图片水印均在本地合成，不上传图片。文字水印支持字号、颜色和透明度预览。"><Select label="水印类型" value={props.watermarkMode} onChange={props.setWatermarkMode} options={["text", "image"]} />{props.watermarkMode === "image" ? <Field label="水印图片"><input type="file" accept={imageAccept} onChange={(event) => props.setWatermarkImage(event.target.files?.[0] || null)} /></Field> : <><Field label="水印文字"><input className="form-input" value={props.watermarkText} onChange={(event) => props.setWatermarkText(event.target.value)} /></Field><Range label="文字大小" value={props.watermarkFontSize} min={12} max={160} onChange={props.setWatermarkFontSize} /><Field label="文字颜色"><div className="flex gap-2"><input className="h-11 w-14 rounded-xl border border-cyan-300/20 bg-slate-950 p-1" type="color" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /><input className="form-input" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /></div></Field></>}<Select label="位置" value={props.watermarkPosition} onChange={props.setWatermarkPosition} options={["top-left", "top-right", "bottom-left", "bottom-right", "center", "tile"]} /><Range label="透明度" value={props.watermarkOpacity} min={5} max={100} onChange={props.setWatermarkOpacity} /><ImageFormat value={props.watermarkFormat} onChange={props.setWatermarkFormat} /></Panel>;
  if (props.activeTab === "compress") return <Panel title="图片压缩" note="固定导出 JPG，目标大小为 200KB、100KB、50KB、25KB。"><Select label="压缩强度" value={props.compressStrength} onChange={props.setCompressStrength} options={["light", "recommended", "extreme"]} /><Field label="目标大小"><select className="form-input" value={props.targetSize} onChange={(event) => props.setTargetSize(event.target.value)}><option value="200KB">200KB</option><option value="100KB">100KB</option><option value="50KB">50KB</option><option value="25KB">25KB</option></select></Field><Range label="质量" value={props.compressQuality} min={10} max={100} onChange={props.setCompressQuality} /><NumberField label="最大宽高" value={props.maxSize} onChange={props.setMaxSize} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.keepOriginalSize} onChange={(event) => props.setKeepOriginalSize(event.target.checked)} />保留原尺寸</label></Panel>;
  if (props.activeTab === "pdf-images") return <Panel title="PDF 转图片" note="PDF.js 本地渲染，可选择逐页导出 ZIP，也可以把所选页合成为一张长图。"><PdfPageField value={props.pdfPages} onChange={props.setPdfPages} /><Select label="导出方式" value={props.pdfImageMode} onChange={props.setPdfImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><Select label="图片格式" value={props.pdfImageFormat} onChange={props.setPdfImageFormat} options={["png", "jpg", "webp"]} /><Select label="清晰度" value={props.pdfScale} onChange={props.setPdfScale} options={["normal", "high", "ultra"]} /></Panel>;
  if (props.activeTab === "word-images") return <Panel title="Word 转图片" note="支持标准 .docx 文档，按页面导出图片或合成为一张长图，所有解析和渲染都在本地完成。"><Select label="导出方式" value={props.officeImageMode} onChange={props.setOfficeImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><ImageFormat value={props.officeImageFormat} onChange={props.setOfficeImageFormat} /></Panel>;
  if (props.activeTab === "excel-images") return <Panel title="Excel 转图片" note="支持 xlsx、csv。旧版 xls 请先另存为 xlsx 后再转换，以降低浏览器解析风险。"><Select label="导出方式" value={props.officeImageMode} onChange={props.setOfficeImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><ImageFormat value={props.officeImageFormat} onChange={props.setOfficeImageFormat} /></Panel>;
  if (props.activeTab === "video-convert") return <Panel title="视频格式转换" note="使用本地 FFmpeg WASM，支持 MP4、MOV、AVI、MKV、WebM，并可选择分辨率、码率和是否清理元数据。"><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.videoFormat} onChange={props.setVideoFormat} options={[...videoOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><Select label="视频尺寸" value={props.videoSize} onChange={props.setVideoSize} options={[...videoSizeOptions]} /><MediaAdvancedControls {...props} /></Panel>;
  if (props.activeTab === "audio-convert") return <Panel title="音频格式转换" note="使用本地 FFmpeg WASM，支持 MP3、WAV、AAC、M4A、FLAC，并可选择音频码率。"><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.audioFormat} onChange={props.setAudioFormat} options={[...audioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></Panel>;
  if (props.activeTab === "video-audio") return <Panel title="视频提取音频" note="只读取视频中的音频轨道，导出 MP3、WAV、M4A、AAC。"><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.extractedAudioFormat} onChange={props.setExtractedAudioFormat} options={[...extractedAudioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></Panel>;
  if (props.activeTab === "batch-gate") return <Panel title="批量处理" note="批量处理为离线专业版功能，请下载 Windows 离线专业版使用。"><a className="btn-primary inline-flex items-center justify-center gap-2" href="/download"><Download className="h-5 w-5" />下载离线专业版</a></Panel>;
  if (props.activeTab === "batch") return <Panel title="离线批量处理" note="批量能力只在离线安装版提供，支持断网环境下顺序处理多个文件，并优先保存到本地输出目录。"><Select label="批量类型" value={props.batchMode} onChange={props.setBatchMode} options={[{ value: "compress", label: "图片批量压缩" }, { value: "watermark", label: "图片批量加水印" }, { value: "word-images", label: "Word 批量转图片" }, { value: "excel-images", label: "Excel 批量转图片" }, { value: "video-convert", label: "视频批量转换" }, { value: "audio-convert", label: "音频批量转换" }, { value: "video-audio", label: "视频批量提取音频" }]} /><div className="rounded-xl border border-cyan-300/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-300">已添加 {props.batchFiles?.length || 0} 个文件。切换批量类型后，建议重新添加对应格式的文件。</div>{props.batchMode === "compress" ? <><Select label="压缩强度" value={props.compressStrength} onChange={props.setCompressStrength} options={["light", "recommended", "extreme"]} /><Field label="目标大小"><select className="form-input" value={props.targetSize} onChange={(event) => props.setTargetSize(event.target.value)}><option value="200KB">200KB</option><option value="100KB">100KB</option><option value="50KB">50KB</option><option value="25KB">25KB</option></select></Field><Range label="质量" value={props.compressQuality} min={10} max={100} onChange={props.setCompressQuality} /><NumberField label="最大宽高" value={props.maxSize} onChange={props.setMaxSize} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.keepOriginalSize} onChange={(event) => props.setKeepOriginalSize(event.target.checked)} />保留原尺寸</label></> : null}{props.batchMode === "watermark" ? <><Select label="水印类型" value={props.watermarkMode} onChange={props.setWatermarkMode} options={["text", "image"]} />{props.watermarkMode === "image" ? <Field label="水印图片"><input type="file" accept={imageAccept} onChange={(event) => props.setWatermarkImage(event.target.files?.[0] || null)} /></Field> : <><Field label="水印文字"><input className="form-input" value={props.watermarkText} onChange={(event) => props.setWatermarkText(event.target.value)} /></Field><Range label="文字大小" value={props.watermarkFontSize} min={12} max={160} onChange={props.setWatermarkFontSize} /><Field label="文字颜色"><div className="flex gap-2"><input className="h-11 w-14 rounded-xl border border-cyan-300/20 bg-slate-950 p-1" type="color" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /><input className="form-input" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /></div></Field></>}<Select label="位置" value={props.watermarkPosition} onChange={props.setWatermarkPosition} options={["top-left", "top-right", "bottom-left", "bottom-right", "center", "tile"]} /><Range label="透明度" value={props.watermarkOpacity} min={5} max={100} onChange={props.setWatermarkOpacity} /><ImageFormat value={props.watermarkFormat} onChange={props.setWatermarkFormat} /></> : null}{props.batchMode === "word-images" || props.batchMode === "excel-images" ? <><Select label="导出方式" value={props.officeImageMode} onChange={props.setOfficeImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><ImageFormat value={props.officeImageFormat} onChange={props.setOfficeImageFormat} /></> : null}{props.batchMode === "video-convert" ? <><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.videoFormat} onChange={props.setVideoFormat} options={[...videoOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><Select label="视频尺寸" value={props.videoSize} onChange={props.setVideoSize} options={[...videoSizeOptions]} /><MediaAdvancedControls {...props} /></> : null}{props.batchMode === "audio-convert" ? <><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.audioFormat} onChange={props.setAudioFormat} options={[...audioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></> : null}{props.batchMode === "video-audio" ? <><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.extractedAudioFormat} onChange={props.setExtractedAudioFormat} options={[...extractedAudioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></> : null}</Panel>;
  return <Panel title="下载离线版" note="离线版用于敏感文件、大文件和无网络环境。"><a className="btn-primary" href="/download">打开下载页</a></Panel>;
}

function Panel({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <div className="space-y-4"><div><h2 className="text-xl font-semibold text-slate-50">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{note}</p></div>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-300"><span className="mb-1 block">{label}</span>{children}</label>; }
type SelectOption = string | { value: string; label: string };
const optionLabelMap: Record<string, string> = {
  text: "文本",
  image: "图片",
  "top-left": "左上角",
  "top-right": "右上角",
  "bottom-left": "左下角",
  "bottom-right": "右下角",
  center: "居中",
  tile: "平铺",
  light: "轻度压缩",
  recommended: "推荐压缩",
  extreme: "极限压缩",
  percent: "按百分比",
  pixel: "按像素",
  normal: "普通",
  high: "高清",
  ultra: "超清",
  balanced: "推荐",
  small: "体积优先",
  original: "原始尺寸",
  "1080p": "1080P",
  "720p": "720P",
  "480p": "480P",
  "chi_sim+eng": "中文 + 英文",
  chi_sim: "中文",
  eng: "英文",
  pages: "逐页导出",
  combined: "合成一页导出"
};
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: any) => void; options: SelectOption[] }) {
  return <Field label={label}><select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => {
    const item = typeof option === "string" ? { value: option, label: optionLabelMap[option] || option.toUpperCase() } : option;
    return <option key={`${item.value}-${item.label}`} value={item.value}>{item.label}</option>;
  })}</select></Field>;
}
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <Field label={label}><input className="form-input" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>; }
function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <Field label={`${label}：${value}`}><input className="w-full" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>; }
function ImageFormat({ value, onChange }: { value: ExportImageFormat; onChange: (value: ExportImageFormat) => void }) { return <Select label="导出格式" value={value} onChange={onChange} options={["jpg", "png", "webp"]} />; }
function PdfPageField({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <Field label="页码"><input className="form-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="all 或 1-3,5" /></Field>; }
function Quality({ value, onChange }: { value: string; onChange: (value: any) => void }) { return <Select label="质量" value={value} onChange={onChange} options={["balanced", "small", "high"]} />; }
function MediaAdvancedControls(props: ControlPanelProps) { return <><Select label="音频码率" value={props.audioBitrate} onChange={props.setAudioBitrate} options={[...audioBitrateOptions]} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.stripMetadata} onChange={(event) => props.setStripMetadata(event.target.checked)} />清理原文件元数据</label></>; }
function MediaCapabilityBox({ report }: { report: MediaCapabilityReport }) { return <div className="rounded-xl border border-cyan-300/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-300"><p className="font-semibold text-slate-50">可用性检查</p><p>视频输出：{report.videoFormats.join(", ") || "不可用"}</p><p>音频输出：{report.audioFormats.join(", ") || "不可用"}</p><p>提取音频：{report.extractedAudioFormats.join(", ") || "不可用"}</p><p>视频尺寸：{report.videoSizes.join(", ") || "不可用"}</p><p>音频码率：{report.audioBitrates.join(", ") || "不可用"}</p>{report.warnings.map((warning) => <p className="text-orange-300" key={warning}>{warning}</p>)}</div>; }

function getDesktopStatusText(status: ProcessState) {
  const map: Record<ProcessState, string> = {
    idle: "空闲",
    running: "处理中",
    cancelled: "已暂停",
    done: "处理完成",
    error: "处理失败"
  };
  return map[status];
}

function getProgressText(progress: number, taskCount: number, message: string) {
  const percent = Math.round(progress * 100);
  const done = percent >= 100 ? taskCount : 0;
  const countText = taskCount > 1 ? `${done} / ${taskCount} · ${percent}%` : `${percent}%`;
  return `${message || "等待处理"} · ${countText}`;
}

function getOutputFormatLabel(options: {
  activeTab: TabId;
  batchMode: BatchMode;
  cropFormat: ExportImageFormat;
  resizeFormat: ExportImageFormat;
  watermarkFormat: ExportImageFormat;
  pdfImageFormat: PdfOutputFormat;
  officeImageFormat: ExportImageFormat;
  videoFormat: VideoOutputFormat;
  audioFormat: AudioOutputFormat;
  extractedAudioFormat: ExtractedAudioOutputFormat;
}) {
  if (options.activeTab === "batch") return batchModeLabel(options.batchMode);
  if (options.activeTab === "crop") return options.cropFormat.toUpperCase();
  if (options.activeTab === "resize") return options.resizeFormat.toUpperCase();
  if (options.activeTab === "watermark") return options.watermarkFormat.toUpperCase();
  if (options.activeTab === "compress") return "JPG";
  if (options.activeTab === "pdf-images") return options.pdfImageFormat.toUpperCase();
  if (options.activeTab === "word-images" || options.activeTab === "excel-images") return options.officeImageFormat.toUpperCase();
  if (options.activeTab === "video-convert") return options.videoFormat.toUpperCase();
  if (options.activeTab === "audio-convert") return options.audioFormat.toUpperCase();
  if (options.activeTab === "video-audio") return options.extractedAudioFormat.toUpperCase();
  return "按功能设置";
}

function getBatchOutputFormatLabel(mode: BatchMode, formats: {
  compressFormat: string;
  watermarkFormat: ExportImageFormat;
  officeImageFormat: ExportImageFormat;
  videoFormat: VideoOutputFormat;
  audioFormat: AudioOutputFormat;
  extractedAudioFormat: ExtractedAudioOutputFormat;
}) {
  if (mode === "compress") return formats.compressFormat.toUpperCase();
  if (mode === "watermark") return formats.watermarkFormat.toUpperCase();
  if (mode === "word-images" || mode === "excel-images") return formats.officeImageFormat.toUpperCase();
  if (mode === "video-convert") return formats.videoFormat.toUpperCase();
  if (mode === "audio-convert") return formats.audioFormat.toUpperCase();
  if (mode === "video-audio") return formats.extractedAudioFormat.toUpperCase();
  return "按功能设置";
}

function getTauriApi() {
  if (typeof window === "undefined") return undefined;
  return (window as any).__TAURI__;
}

async function invokeTauri<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const tauri = getTauriApi();
  const invoke = tauri?.tauri?.invoke || tauri?.invoke;
  if (typeof invoke !== "function") throw new Error("当前环境不能调用 Tauri sidecar。");
  return invoke(command, args);
}

async function runSidecarExperiment(mode: SidecarCommandMode, options: { inputPath: string; outputDir?: string; outputName?: string }) {
  return invokeTauri<SidecarCommandResult>("run_ffmpeg_sidecar_poc", {
    request: {
      mode,
      inputPath: options.inputPath,
      outputDir: options.outputDir,
      outputName: options.outputName
    }
  });
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

async function readTauriFolderFiles(rootPath: string, mode: BatchMode) {
  const tauri = getTauriApi();
  const flat = await walkTauriDirectory(rootPath, 0, 500);
  const supported = flat.filter((entry) => isSupportedBatchName(entry.path || entry.name || "", mode));
  const files: File[] = [];
  const paths: string[] = [];

  for (const entry of supported) {
    const pathValue = entry.path;
    if (!pathValue) continue;
    const bytes = await tauri.fs.readBinaryFile(pathValue);
    const name = fileNameFromPath(pathValue);
    files.push(new File([new Uint8Array(bytes)], name, { type: guessMimeType(name) }));
    paths.push(pathValue);
  }

  return { total: flat.length, files, paths };
}

async function walkTauriDirectory(rootPath: string, depth: number, limit: number): Promise<Array<{ name?: string; path?: string }>> {
  const tauri = getTauriApi();
  if (depth > 4 || limit <= 0) return [];
  const entries = await tauri.fs.readDir(rootPath, { recursive: false });
  const result: Array<{ name?: string; path?: string }> = [];

  for (const entry of entries) {
    if (result.length >= limit) break;
    if (!entry.path) continue;
    try {
      const children = await walkTauriDirectory(entry.path, depth + 1, limit - result.length);
      result.push(...children);
    } catch {
      result.push(entry);
    }
  }

  return result;
}

function fileNameFromPath(pathValue: string) {
  return pathValue.replaceAll("\\", "/").split("/").filter(Boolean).at(-1) || "file";
}

function getFileRelativePath(file: File) {
  return (file as any).webkitRelativePath || file.name;
}

function getNativeFilePath(file: File) {
  const pathValue = (file as any).path;
  return typeof pathValue === "string" && isLocalFilePath(pathValue) ? pathValue : undefined;
}

function guessMimeType(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".bmp")) return "image/bmp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  return "application/octet-stream";
}

function joinLocalPath(directory: string, name: string) {
  const separator = directory.includes("\\") ? "\\" : "/";
  return `${directory.replace(/[\\/]+$/, "")}${separator}${name.replace(/[\\/:*?"<>|]+/g, "_")}`;
}

function isLocalFilePath(pathValue: string) {
  return /^[A-Za-z]:[\\/]/.test(pathValue) || pathValue.startsWith("\\\\") || pathValue.startsWith("/");
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs} ms`;
  if (durationMs < 60_000) return `${(durationMs / 1000).toFixed(1)} 秒`;
  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.round((durationMs % 60_000) / 1000);
  return `${minutes} 分 ${seconds} 秒`;
}

function formatMediaDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainSeconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes} 分 ${remainSeconds.toString().padStart(2, "0")} 秒`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours} 小时 ${remainMinutes.toString().padStart(2, "0")} 分 ${remainSeconds.toString().padStart(2, "0")} 秒`;
}

function getFailureBackend(error: unknown): "wasm" | "sidecar" | undefined {
  if (!error || typeof error !== "object" || !("backend" in error)) return undefined;
  const backend = (error as { backend?: unknown }).backend;
  return backend === "sidecar" || backend === "wasm" ? backend : undefined;
}

function parseTargetSize(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)\s*(KB|MB)$/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return Math.round(amount * (match[2].toUpperCase() === "MB" ? 1024 * 1024 : 1024));
}

function isBatchFileAllowed(file: File, mode: BatchMode) {
  if (mode === "compress" || mode === "watermark") return isImageFile(file);
  if (mode === "word-images") return isWordFile(file);
  if (mode === "excel-images") return isExcelFile(file);
  if (mode === "video-convert" || mode === "video-audio") return isVideoFile(file);
  if (mode === "audio-convert") return isAudioFile(file);
  return false;
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/withResolvers/i.test(message)) return "当前运行环境缺少 Promise.withResolvers，已内置兼容层；请重新打开离线版后再试。";
  if (/password|encrypted/i.test(message)) return "PDF 可能已加密，请先使用无密码版本再转换。";
  if (/memory|allocation/i.test(message)) return "浏览器内存不足，请降低清晰度、缩小图片或使用离线安装版。";
  if (/cancel|abort/i.test(message)) return "任务已取消。";
  return message || "处理失败，请更换文件或使用离线安装版重试。";
}

