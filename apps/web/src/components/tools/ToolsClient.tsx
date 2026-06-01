"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { AdSlot } from "@doctool/ui";
import Cropper from "cropperjs";
import JSZip from "jszip";
import { CheckCircle2, ChevronDown, Copy, Crop, Download, ExternalLink, FileImage, FileText, Files, FolderOpen, Gauge, HardDrive, Image, ListChecks, Loader2, Maximize2, Music, Play, RotateCcw, Scissors, ShieldCheck, SlidersHorizontal, Square, Table2, Trash2, Type, Video, Zap } from "lucide-react";
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
import { downloadsConfig } from "@/config/downloads";
import { GsapScene } from "@/components/motion/GsapScene";
import { batchModeLabel, batchTaskStatusLabel, buildImportSummary, createBatchTask, defaultOutputDirectory, getBatchCounts, getSupportedExtensions, isSupportedBatchName, sanitizeLocalPath } from "@/lib/batchQueue";
import type { BatchImportSummary, BatchMode, BatchOutputDirectory, BatchTask, BatchTaskStatus } from "@/lib/batchQueue";
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
  ...webTabs.filter((tab) => tab.id !== "download" && tab.id !== "batch-gate")
];

const desktopNavSections = [
  {
    title: "图片工具",
    description: "裁剪 / 水印 / 压缩 / 尺寸",
    icon: Image,
    items: [
      { id: "crop", label: "裁剪", note: "适合头像和取景", badge: "裁" },
      { id: "watermark", label: "加水印", note: "文字 / 图片", badge: "水", batch: true },
      { id: "compress", label: "压缩", note: "JPG / 质量控制", badge: "压", batch: true },
      { id: "resize", label: "尺寸调整", note: "像素 / 百分比", badge: "尺", batch: true }
    ]
  },
  {
    title: "文档工具",
    description: "PDF / Word / Excel",
    icon: FileText,
    items: [
      { id: "pdf-images", label: "PDF 转图片", note: "逐页 / 合成", badge: "PDF", batch: true },
      { id: "word-images", label: "Word 转图片", note: "DOCX", badge: "Word", batch: true },
      { id: "excel-images", label: "Excel 转图片", note: "XLSX / CSV", badge: "Excel", batch: true }
    ]
  },
  {
    title: "音视频工具",
    description: "视频转换 / 提取 / 音频转换",
    icon: Video,
    items: [
      { id: "video-convert", label: "视频格式转换", note: "MP4 / MOV", badge: "视频", batch: true },
      { id: "video-audio", label: "视频提取音频", note: "导出音轨", badge: "提取", batch: true },
      { id: "audio-convert", label: "音频格式转换", note: "MP3 / WAV", badge: "音频", batch: true }
    ]
  }
] as const;

const onlineNavSections = [
  {
    title: "图片工具",
    description: "裁剪 / 水印 / 压缩 / 尺寸",
    icon: Image,
    items: [
      { id: "crop", label: "图片裁切", note: "适合头像和取景", badge: "裁" },
      { id: "watermark", label: "添加水印", note: "文字 / 图片", badge: "水" },
      { id: "compress", label: "图片压缩", note: "JPG / 质量控制", badge: "压" },
      { id: "resize", label: "尺寸调整", note: "像素 / 百分比", badge: "尺" }
    ]
  },
  {
    title: "文档工具",
    description: "PDF / Word / Excel",
    icon: FileText,
    items: [
      { id: "pdf-images", label: "PDF 转图片", note: "逐页 / 合成", badge: "PDF" },
      { id: "word-images", label: "Word 转图片", note: "DOCX", badge: "Word" },
      { id: "excel-images", label: "Excel 转图片", note: "XLSX / CSV", badge: "Excel" }
    ]
  },
  {
    title: "音视频工具",
    description: "格式转换 / 音频提取",
    icon: Video,
    items: [
      { id: "video-convert", label: "视频格式转换", note: "MP4 / MOV", badge: "视频" },
      { id: "video-audio", label: "视频提取音频", note: "导出音轨", badge: "提取" },
      { id: "audio-convert", label: "音频格式转换", note: "MP3 / WAV", badge: "音频" }
    ]
  },
  {
    title: "离线与批量",
    description: "批量处理 / 离线安装版",
    icon: Files,
    items: [
      { id: "batch-gate", label: "批量处理", note: "离线专业版功能", badge: "批量" },
      { id: "download", label: "下载离线版", note: "断网可用", badge: "离线" }
    ]
  }
] as const;

const workbenchCapabilities = [
  { label: "支持 200+ 格式", icon: Files },
  { label: "高速转换引擎", icon: Zap },
  { label: "批量处理能力", icon: ListChecks },
  { label: "本地安全保障", icon: ShieldCheck },
  { label: "专业参数控制", icon: SlidersHorizontal }
];

const assuranceItems = [
  { label: "文件仅本地处理", detail: "不上传服务器", icon: ShieldCheck },
  { label: "转换引擎", detail: "浏览器 / 桌面本地运行", icon: Gauge },
  { label: "批量能力", detail: "离线版任务队列", icon: ListChecks },
  { label: "输出保存", detail: "本机目录或浏览器下载", icon: HardDrive }
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

type DocumentPreviewState = {
  url: string;
  title: string;
  message: string;
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
  const batchInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const cancelRef = useRef(false);
  const mediaAbortRef = useRef<AbortController | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>(isDesktopSurface ? "video-convert" : "crop");
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
  const [documentPreview, setDocumentPreview] = useState<DocumentPreviewState>({ url: "", title: "", message: "" });
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
  const [batchMode, setBatchMode] = useState<BatchMode>(isDesktopSurface ? "video-convert" : "compress");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState("");
  const [desktopTaskPreviewUrl, setDesktopTaskPreviewUrl] = useState("");
  const [outputDirectory, setOutputDirectory] = useState<BatchOutputDirectory>(() => defaultOutputDirectory());
  const [importSummary, setImportSummary] = useState<BatchImportSummary | null>(null);
  const [sidecarExperimentEnabled, setSidecarExperimentEnabled] = useState(false);
  const [sidecarStatus, setSidecarStatus] = useState<SidecarCheckResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(isDesktopSurface ? [] : ["图片工具"]);

  const activeKind = tabs.find((tab) => tab.id === activeTab)?.kind;
  const activeBatchMode = isDesktopSurface ? getBatchModeForTab(activeTab) : activeTab === "batch" ? batchMode : undefined;
  const accept = useMemo(() => {
    const batchAcceptMode = activeBatchMode || (activeTab === "batch" ? batchMode : undefined);
    if (batchAcceptMode) {
      if (batchAcceptMode === "pdf-images") return pdfAccept;
      if (batchAcceptMode === "word-images") return wordAccept;
      if (batchAcceptMode === "excel-images") return excelAccept;
      if (batchAcceptMode === "video-convert" || batchAcceptMode === "video-audio") return videoAccept;
      if (batchAcceptMode === "audio-convert") return audioAccept;
      return imageAccept;
    }
    if (activeKind === "pdf") return pdfAccept;
    if (activeKind === "word") return wordAccept;
    if (activeKind === "excel") return excelAccept;
    if (activeKind === "video") return videoAccept;
    if (activeKind === "audio") return audioAccept;
    return imageAccept;
  }, [activeBatchMode, activeKind, activeTab, batchMode]);

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => {
    if (documentPreview.url) URL.revokeObjectURL(documentPreview.url);
  }, [documentPreview.url]);

  useEffect(() => {
    if (!isDesktopSurface) return;
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

  useEffect(() => {
    const previewMode = activeTab === "batch" ? batchMode : activeTab;
    const canPreviewDocument = file && (
      (previewMode === "pdf-images" && isPdfFile(file)) ||
      (previewMode === "word-images" && isWordFile(file)) ||
      (previewMode === "excel-images" && isExcelFile(file))
    );

    if (!canPreviewDocument || !file) {
      setDocumentPreview((current) => {
        if (current.url) URL.revokeObjectURL(current.url);
        return { url: "", title: "", message: "" };
      });
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setDocumentPreview((current) => {
          if (current.url) URL.revokeObjectURL(current.url);
          return {
            url: "",
            title: previewMode === "pdf-images" ? "PDF 首页预览" : previewMode === "word-images" ? "Word 首页预览" : "Excel 首表预览",
            message: "正在本地生成预览..."
          };
        });

        try {
          let blob: Blob;
          let title = "";
          let message = "";

          if (previewMode === "pdf-images") {
            const pages = await selectedPdfPages(file);
            const pageNumber = pages[0] || 1;
            const previewScale = pdfScale === "ultra" ? 1.6 : pdfScale === "high" ? 1.25 : 1;
            blob = await renderPdfPageToBlob(file, pageNumber, "png", previewScale);
            title = `PDF 第 ${pageNumber} 页预览`;
            message = "预览只渲染首个选中页，正式转换仍按页码设置导出。";
          } else if (previewMode === "word-images") {
            const pages = await renderDocxToImagePages(file, {
              format: "png",
              onProgress: (_value, progressMessage) => {
                if (!cancelled && progressMessage) {
                  setDocumentPreview((current) => ({ ...current, message: progressMessage }));
                }
              }
            });
            if (!pages[0]) throw new Error("Word 文档没有可预览页面。");
            blob = pages[0].blob;
            title = "Word 第 1 页预览";
            message = pages.length > 1 ? `共解析 ${pages.length} 页，预览显示第 1 页。` : "预览显示第 1 页。";
          } else {
            const pages = await renderExcelToImagePages(file, {
              format: "png",
              onProgress: (_value, progressMessage) => {
                if (!cancelled && progressMessage) {
                  setDocumentPreview((current) => ({ ...current, message: progressMessage }));
                }
              }
            });
            if (!pages[0]) throw new Error("Excel 文件没有可预览工作表。");
            blob = pages[0].blob;
            title = "Excel 首个工作表预览";
            message = pages.length > 1 ? `共解析 ${pages.length} 个工作表，预览显示第 1 个。` : "预览显示首个工作表。";
          }

          const nextUrl = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(nextUrl);
            return;
          }
          setDocumentPreview((current) => {
            if (current.url) URL.revokeObjectURL(current.url);
            return { url: nextUrl, title, message };
          });
        } catch {
          if (!cancelled) {
            setDocumentPreview((current) => {
              if (current.url) URL.revokeObjectURL(current.url);
              return {
                url: "",
                title: previewMode === "pdf-images" ? "PDF 预览" : previewMode === "word-images" ? "Word 预览" : "Excel 预览",
                message: "预览生成失败，仍可点击开始转换；如文件较大，建议使用离线专业版。"
              };
            });
          }
        }
      })();
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeTab, batchMode, file, pdfPages, pdfScale, summary?.pdf?.pages]);

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

  function getCurrentBatchMode() {
    return activeBatchMode || (activeTab === "batch" ? batchMode : undefined);
  }

  function handleBatchFiles(fileList?: FileList | null) {
    if (!fileList?.length) return;
    const mode = getCurrentBatchMode();
    if (!mode) {
      setError("当前工具暂不支持批量导入，请切换到带有批量标记的转换工具。");
      return;
    }
    setError("");
    setResultBlob(null);
    setResultName("");
    setCompressionStats("");
    const allFiles = Array.from(fileList);
    const nextFiles = allFiles.filter((item) => isBatchFileAllowed(item, mode));
    if (!nextFiles.length) {
      setImportSummary(buildImportSummary(allFiles.length, 0, "files"));
      setError(`没有找到当前工具支持的文件。支持格式：${getSupportedExtensions(mode).join(", ")}`);
      return;
    }
    void handleFile(nextFiles[0]);
    appendBatchFiles(nextFiles, "files", mode);
    setImportSummary(buildImportSummary(allFiles.length, nextFiles.length, "files"));
    setProgressMessage(`已添加 ${nextFiles.length} 个文件，点击开始处理后会按顺序执行。`);
  }

  function appendBatchFiles(files: File[], source: BatchImportSummary["source"], mode: BatchMode, sourcePaths?: string[]) {
    const tasks = files.map((item, index) => createBatchTask(item, mode, getBatchOutputFormatLabel(mode, {
      compressFormat: "jpg",
      resizeFormat,
      pdfImageFormat,
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
    const mode = getCurrentBatchMode();
    if (!mode) {
      setError("当前工具暂不支持批量文件夹导入，请切换到带有批量标记的转换工具。");
      return;
    }
    const allFiles = Array.from(fileList);
    const supported = allFiles.filter((item) => isBatchFileAllowed(item, mode));
    const sourcePaths = supported.map((item) => getFileRelativePath(item));
    if (!supported.length) {
      setImportSummary(buildImportSummary(allFiles.length, 0, "folder"));
      setError(`文件夹中没有找到当前功能支持的文件。支持格式：${getSupportedExtensions(mode).join(", ")}`);
      return;
    }
    appendBatchFiles(supported, "folder", mode, sourcePaths);
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
    const modeForActiveTool = isDesktopSurface ? getBatchModeForTab(activeTab) : undefined;
    const shouldRunCurrentBatch = Boolean(modeForActiveTool && batchTasks.some((task) => task.mode === modeForActiveTool && isRunnableBatchStatus(task.status)));
    setStatus("running");
    setProgress(0);
    setError("");
    setResultBlob(null);
    setResultName("");
    cancelRef.current = false;
    try {
      if (shouldRunCurrentBatch && modeForActiveTool) {
        await runBatch(modeForActiveTool);
      } else switch (activeTab) {
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
      if (isDesktopSurface || activeTab === "batch") setActiveTaskId("");
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
      try {
        const selected = await tauri.dialog.open({ directory: true, multiple: false, title: "选择批量结果输出目录" });
        if (typeof selected === "string" && selected) {
          setOutputDirectory({ kind: "tauri", path: selected, label: sanitizeLocalPath(selected) });
          setProgressMessage(`输出目录已设置为：${sanitizeLocalPath(selected)}`);
        }
      } catch {
        setProgressMessage("未更改输出目录。");
      }
      return;
    }

    const picker = (window as any).showDirectoryPicker;
    if (typeof picker === "function") {
      try {
        const handle = await picker.call(window, { mode: "readwrite" });
        setOutputDirectory({ kind: "browser", handle, label: handle.name || "已选择本地目录" });
        setProgressMessage(`输出目录已设置为：${handle.name || "本地目录"}`);
      } catch {
        setProgressMessage("未更改输出目录。");
      }
      return;
    }

    setError("当前环境不支持直接选择输出目录。下一步：处理完成后请使用下载结果按钮保存文件。");
  }

  async function importFolder() {
    setError("");
    const mode = getCurrentBatchMode();
    if (!mode) {
      setError("当前工具暂不支持批量文件夹导入，请切换到带有批量标记的转换工具。");
      return;
    }
    const tauri = getTauriApi();
    if (tauri?.dialog?.open && tauri?.fs?.readDir && tauri?.fs?.readBinaryFile) {
      const selected = await tauri.dialog.open({ directory: true, multiple: false, title: "选择需要导入的文件夹" });
      if (typeof selected !== "string" || !selected) return;
      const result = await readTauriFolderFiles(selected, mode);
      if (!result.files.length) {
        setImportSummary(buildImportSummary(result.total, 0, "folder"));
        setError(`文件夹中没有找到当前功能支持的文件。支持格式：${getSupportedExtensions(mode).join(", ")}`);
        return;
      }
      appendBatchFiles(result.files, "folder", mode, result.paths);
      setImportSummary(buildImportSummary(result.total, result.files.length, "folder"));
      setProgressMessage(`已从 ${sanitizeLocalPath(selected)} 导入 ${result.files.length} 个文件，跳过 ${result.total - result.files.length} 个不支持的文件。`);
      return;
    }

    folderInputRef.current?.click();
  }

  async function openOutputDirectory() {
    const tauri = getTauriApi();
    if (outputDirectory.kind === "tauri" && tauri?.shell?.open) {
      try {
        await tauri.shell.open(outputDirectory.path);
      } catch {
        setProgressMessage("输出目录已设置，可从结果列表复制路径打开。");
      }
      return;
    }
    setProgressMessage("输出目录已设置，可从结果列表复制路径打开。");
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

  function cancelBatchTask(id: string) {
    if (activeTaskId === id) cancelTask();
    const completedAt = Date.now();
    setBatchTasks((current) => current.map((task) => task.id === id && (task.status === "queued" || task.status === "running") ? {
      ...task,
      status: "cancelled",
      completedAt,
      error: "用户取消处理"
    } : task));
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

  function clearCompletedBatchTasks() {
    setBatchTasks((current) => current.filter((task) => task.status !== "success"));
    setBatchFiles((current) => current.filter((fileItem) => batchTasks.some((task) => task.file === fileItem && task.status !== "success")));
    setProgressMessage("已清空已完成任务。");
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

  async function resolveBatchResizeDimensions(source: File) {
    if (resizeMode === "percent") {
      const image = await loadImageElement(source);
      const scale = Math.max(1, resizePercent) / 100;
      return {
        width: Math.max(1, Math.round(image.naturalWidth * scale)),
        height: Math.max(1, Math.round(image.naturalHeight * scale))
      };
    }
    return {
      width: Math.max(1, Math.round(resizeWidth || 1)),
      height: Math.max(1, Math.round(resizeHeight || 1))
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

  async function runBatch(modeFilter?: BatchMode) {
    if (!isDesktopSurface) throw new Error("批量处理仅在离线安装版中提供。");
    const tasks = batchTasks.filter((task) => isRunnableBatchStatus(task.status) && (!modeFilter || task.mode === modeFilter));
    if (!tasks.length) throw new Error("请先添加需要批量处理的文件，或重试失败任务。");
    setProgressMessage(`准备处理 ${tasks.length} 个${modeFilter ? ` ${batchModeLabel(modeFilter)}` : "批量"}任务。`);
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

    if (mode === "resize") {
      onProgress(0.15, `正在读取图片尺寸：${item.name}`);
      const dimensions = await resolveBatchResizeDimensions(item);
      const blob = await resizeImage(item, { width: dimensions.width, height: dimensions.height, format: resizeFormat, quality: resizeQuality / 100 });
      onProgress(1, `已完成尺寸调整：${item.name}`);
      return { blob, name: fileNameWithSuffix(item.name, "resized", resizeFormat), backend: "wasm" };
    }

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

    if (mode === "pdf-images") {
      const total = await getPdfPageCount(item);
      const pages = parsePageSelection(pdfPages, total);
      if (!pages.length) throw new Error("页码范围无效，请输入 all 或类似 1-3,5 的页码。");
      const scale = pdfScale === "ultra" ? 3 : pdfScale === "high" ? 2 : 1.2;
      if (pdfImageMode === "combined") {
        const rendered = await renderPdfPages(item, {
          pages,
          format: pdfImageFormat,
          scale,
          onProgress: (value, message) => onProgress(value * 0.7, message || `正在渲染 PDF：${item.name}`)
        });
        const blob = await combineImagePages(rendered.map((page) => ({
          pageNumber: page.pageNumber,
          label: `第 ${page.pageNumber} 页`,
          blob: page.blob
        })), pdfImageFormat, (value, message) => onProgress(0.7 + value * 0.3, message || "正在合成 PDF 长图"));
        return { blob, name: `${safeBaseName(item.name)}_combined.${pdfImageFormat}`, backend: "wasm" };
      }
      if (pages.length === 1) {
        const blob = await renderPdfPageToBlob(item, pages[0], pdfImageFormat, scale);
        onProgress(1, `已完成 PDF：${item.name}`);
        return { blob, name: `${safeBaseName(item.name)}_page_${String(pages[0]).padStart(3, "0")}.${pdfImageFormat}`, backend: "wasm" };
      }
      const blob = await renderPdfPagesToZip(item, {
        pages,
        format: pdfImageFormat,
        scale,
        onProgress: (value, message) => onProgress(value, message || `正在导出 PDF 页面：${item.name}`)
      }, safeBaseName(item.name));
      return { blob, name: `${safeBaseName(item.name)}_pages.zip`, backend: "wasm" };
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
  const activeBatchTasks = activeBatchMode ? batchTasks.filter((task) => task.mode === activeBatchMode) : [];
  const activeBatchCounts = getBatchCounts(activeBatchTasks);
  const visibleBatchTasks = isDesktopSurface ? activeBatchTasks : batchTasks;
  const visibleBatchFiles = visibleBatchTasks.map((task) => task.file);
  const hasActiveBatchQueue = isDesktopSurface && Boolean(activeBatchMode) && activeBatchTasks.length > 0;
  const taskCount = activeTab === "batch" ? batchCounts.total : hasActiveBatchQueue ? activeBatchCounts.total : file ? 1 : 0;
  const successCount = activeTab === "batch" ? batchCounts.success : hasActiveBatchQueue ? activeBatchCounts.success : status === "done" ? 1 : 0;
  const failureCount = activeTab === "batch" ? batchCounts.failed : hasActiveBatchQueue ? activeBatchCounts.failed : status === "error" ? 1 : 0;
  const runnableBatchCount = batchTasks.filter((task) => isRunnableBatchStatus(task.status)).length;
  const runnableActiveBatchCount = activeBatchTasks.filter((task) => isRunnableBatchStatus(task.status)).length;
  const canStartTask = activeTab === "batch"
    ? runnableBatchCount > 0 && status !== "running"
    : (runnableActiveBatchCount > 0 || Boolean(file)) && status !== "running";
  const shouldShowDesktopDetail = Boolean(file || summary || batchTasks.length || error || resultName);
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
      desktopMode={isDesktopSurface}
    />
  );
  const desktopPreviewMode = activeTab === "batch" ? batchMode : activeTab;
  const navigationSections = isDesktopSurface ? desktopNavSections : onlineNavSections;
  const shouldRenderAds = !isDesktopSurface;
  const sidecarReady = isSidecarReady(sidecarStatus || undefined);
  const selectedDesktopTask = visibleBatchTasks.find((task) => task.id === activeTaskId) || visibleBatchTasks[0] || null;
  const desktopInspectorFile = selectedDesktopTask?.file || file || null;
  const desktopInspectorPreviewUrl = desktopInspectorFile === file ? fileUrl : desktopTaskPreviewUrl;
  const desktopInspectorName = selectedDesktopTask?.fileName || summary?.name || file?.name || "";
  const desktopInspectorType = selectedDesktopTask?.fileType || (summary ? getDesktopPreviewFileType(summary) : file ? currentTab.label : "");
  const desktopInspectorSize = selectedDesktopTask ? formatBytes(selectedDesktopTask.fileSize) : summary ? formatBytes(summary.size) : file ? formatBytes(file.size) : "";
  const desktopInspectorOutputFormat = selectedDesktopTask?.outputFormat || outputFormat;
  const desktopInspectorStatus = selectedDesktopTask ? batchTaskStatusLabel(selectedDesktopTask.status) : desktopStatusText;
  useEffect(() => {
    const taskFile = selectedDesktopTask?.file;
    if (!isDesktopSurface || !taskFile || taskFile === file) {
      setDesktopTaskPreviewUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(taskFile);
    setDesktopTaskPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file, isDesktopSurface, selectedDesktopTask?.file]);

  const toggleNavSection = (title: string) => {
    setExpandedSections((current) => (
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    ));
  };
  const selectTool = (tabId: TabId) => {
    setActiveTab(tabId);
    const nextBatchMode = getBatchModeForTab(tabId);
    if (nextBatchMode) setBatchMode(nextBatchMode);
  };
  const onlineTaskActionBar = (
    <div className="mt-4 rounded-sm border border-[#e2e8f0] bg-white p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">任务操作</p>
          <p className="mt-1 truncate text-sm text-slate-600">
            {file ? `${summary?.name || file.name} · 输出 ${outputFormat}` : "先添加文件，再开始本地转换"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-5"
            type="button"
            disabled={!canStartTask}
            onClick={() => void runCurrentTask()}
            title={canStartTask ? undefined : "请先添加文件后再开始转换"}
          >
            {status === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
            开始转换
          </button>
          <button
            className="btn-danger inline-flex min-h-11 items-center justify-center gap-2 px-5"
            type="button"
            disabled={status !== "running"}
            onClick={cancelTask}
          >
            <Square className="h-4 w-4 fill-current" />
            停止任务
          </button>
          {resultName ? (
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-emerald-700/20 bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
              type="button"
              disabled={!resultBlob}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              下载结果
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (isDesktopSurface) {
    return (
      <main className="desktop-replica h-screen min-h-[720px] overflow-hidden bg-[#24323B] text-[#EDF3F7]">
        <DesktopReplicaTitlebar />
        <div className="grid h-[calc(100vh-31px)] min-h-[689px] grid-cols-[166px_minmax(0,1fr)_280px] overflow-hidden">
          <aside className="border-r border-[#18242B] bg-[#3A4D58]">
            <div className="flex h-10 items-center justify-between border-b border-[#263842] px-3 text-[13px] font-semibold text-[#EDF3F7]">
              <span>导航</span>
              <button className="grid h-7 w-7 place-items-center text-[#CAD5DC] hover:bg-[#32434D]" type="button" aria-label="折叠导航">
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
            </div>
            <nav className="desktop-nav-menu">
              {navigationSections.map((section) => (
                <DesktopReplicaNavSection
                  key={section.title}
                  section={section}
                  activeTab={activeTab}
                  expanded={expandedSections.includes(section.title)}
                  onToggle={() => toggleNavSection(section.title)}
                  onSelectTab={selectTool}
                />
              ))}
              <DesktopReplicaNavButton icon={HardDrive} label="本地历史" active={false} onClick={() => void copyText(`成功 ${successCount}，失败 ${failureCount}`)} />
            </nav>
          </aside>

          <section className="flex min-w-0 flex-col overflow-hidden bg-[#2B3A43]">
            <div className="flex h-10 shrink-0 items-center border-b border-[#18242B] px-3">
              <h1 className="text-[18px] font-bold leading-none text-[#EDF3F7]">任务队列</h1>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 p-[10px]">
              <div
                className="desktop-import-strip flex h-[58px] shrink-0 items-center gap-2 rounded-[5px] border border-dashed border-[#60737D] bg-[#3A4D58] px-3"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (activeBatchMode && event.dataTransfer.files.length > 1) handleBatchFiles(event.dataTransfer.files);
                  else void handleFile(event.dataTransfer.files[0]);
                }}
              >
                <input ref={inputRef} className="hidden" type="file" accept={accept} onChange={(event) => void handleFile(event.target.files?.[0])} />
                <input ref={batchInputRef} className="hidden" type="file" accept={accept} multiple onChange={(event) => handleBatchFiles(event.target.files)} />
                <input
                  ref={folderInputRef}
                  className="hidden"
                  type="file"
                  multiple
                  onChange={(event) => handleFolderInputFiles(event.target.files)}
                  {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
                />
                <DesktopQueueButton icon={Files} label="添加文件" onClick={() => inputRef.current?.click()} />
                <DesktopQueueButton icon={ListChecks} label="添加批量文件" disabled={!activeBatchMode} onClick={() => batchInputRef.current?.click()} />
                <DesktopQueueButton icon={FolderOpen} label="添加文件夹" disabled={!activeBatchMode} onClick={() => void importFolder()} />
                <button className="desktop-queue-command ml-auto" type="button" disabled={!canStartTask} onClick={() => void runCurrentTask()}>
                  {status === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  开始转换
                </button>
                <button className="desktop-queue-command" type="button" disabled={status !== "running"} onClick={cancelTask}>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  停止
                </button>
                {resultName ? (
                  <button className="desktop-queue-command" type="button" disabled={!resultBlob} onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5" />
                    下载
                  </button>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden border border-[#18242B] bg-[#11191E]">
                <div className="desktop-table-header grid h-[30px] grid-cols-[48px_minmax(180px,1fr)_105px_105px_145px_120px_104px] border-b border-[#1E2B32] bg-[#33444E] text-[13px] font-semibold text-[#EDF3F7]">
                  <span>序号</span>
                  <span>文件名</span>
                  <span>类型</span>
                  <span>大小</span>
                  <span>目标格式</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                <div className="desktop-table-body h-[calc(100%-30px)] overflow-y-auto">
                  {activeBatchMode && activeBatchTasks.length ? activeBatchTasks.map((task, index) => (
                    <DesktopBatchTaskRow
                      key={task.id}
                      task={task}
                      index={index + 1}
                      active={activeTaskId === task.id || (!activeTaskId && index === 0)}
                      onSelect={() => setActiveTaskId(task.id)}
                      onRetry={() => retryBatchTask(task.id)}
                      onCancel={() => cancelBatchTask(task.id)}
                      onOpenResult={() => void openResultFile(task)}
                      onCopy={() => void copyText(task.outputPath || task.resultName)}
                    />
                  )) : file && summary ? (
                    <DesktopTaskRow
                      name={summary.name}
                      type={currentTab.label}
                      size={formatBytes(summary.size)}
                      outputFormat={outputFormat}
                      status={status}
                      error={error}
                    />
                  ) : (
                    <DesktopEmptyQueue batchEnabled={Boolean(activeBatchMode)} onPickFile={() => inputRef.current?.click()} onPickFolder={() => void importFolder()} onPickOutputDirectory={() => void selectOutputDirectory()} />
                  )}
                </div>
              </div>
            </div>
          </section>

          <DesktopReplicaInspector
            mode={desktopPreviewMode}
            modeLabel={activeTab === "batch" ? batchModeLabel(batchMode) : currentTab.label}
            file={desktopInspectorFile}
            fileUrl={desktopInspectorPreviewUrl}
            previewUrl={desktopInspectorFile === file ? previewUrl : ""}
            previewMessage={previewMessage}
            documentPreview={desktopInspectorFile === file ? documentPreview : { url: "", title: "", message: "" }}
            summary={desktopInspectorFile === file ? summary : null}
            cropImageRef={desktopInspectorFile === file ? cropImageRef : undefined}
            onImageLoad={() => setCropPreviewKey((value) => value + 1)}
            fileName={desktopInspectorName}
            fileType={desktopInspectorType}
            fileSize={desktopInspectorSize}
            outputFormat={desktopInspectorOutputFormat}
            statusText={desktopInspectorStatus}
            progressText={progressText}
            progress={progress}
            taskTotal={taskCount}
            successCount={successCount}
            failureCount={failureCount}
            outputDirectory={outputDirectory}
            sidecarStatus={sidecarStatus}
            sidecarReady={sidecarReady}
            sidecarExperimentEnabled={sidecarExperimentEnabled}
            controlPanel={controlPanel}
            error={error}
            resultName={resultName}
            onRefreshSidecar={() => void refreshSidecarStatus()}
            onToggleSidecar={(enabled) => {
              setSidecarExperimentEnabled(enabled);
              window.localStorage.setItem(sidecarExperimentStorageKey, enabled ? "enabled" : "disabled");
            }}
            onSelectOutput={() => void selectOutputDirectory()}
            onDownloadResult={handleDownload}
            canDownload={Boolean(resultBlob && resultName)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="office-workbench min-h-[calc(100vh-64px)] bg-[var(--surface-page)] text-slate-900">
      <GsapScene variant="tools" animateKey={activeTab}>
      <section id="tool-picker" data-animate="tools-chrome" className="mx-auto max-w-[1480px] scroll-mt-24 px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside data-animate="tools-nav" className="h-fit border border-[var(--border-soft)] bg-white xl:sticky xl:top-24">
            <div className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tool groups</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">功能导航</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">按任务类型选择工具，右侧工作台会同步切换参数和预览。</p>
            </div>
            <nav className="grid gap-0">
              {navigationSections.map((section) => {
                const SectionIcon = section.icon;
                const expanded = expandedSections.includes(section.title);
                return (
                  <section key={section.title} className="border-b border-[var(--border-soft)] last:border-b-0">
                    <button
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-muted)]"
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => toggleNavSection(section.title)}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center border border-[var(--border-soft)] bg-white text-slate-800">
                          <SectionIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-950">{section.title}</span>
                          <span className="block truncate text-xs text-slate-500">{section.description}</span>
                        </span>
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded ? (
                      <div className="border-t border-[var(--border-soft)] bg-white">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={activeTab === item.id}
                            className={`flex w-full items-start gap-3 border-b border-[var(--border-soft)] px-4 py-3 text-left text-sm last:border-b-0 ${
                              activeTab === item.id
                                ? "border-l-4 border-l-[var(--accent-blue)] bg-[#e8f3fb] font-semibold text-slate-950"
                                : "text-slate-700 hover:bg-[var(--surface-muted)] hover:text-slate-950"
                            }`}
                            onClick={() => selectTool(item.id)}
                          >
                            <span className={activeTab === item.id ? "font-bold text-[var(--accent-blue)]" : "text-slate-500"}>{item.badge}</span>
                            <span className="min-w-0">
                              <span className="block truncate">{item.label}</span>
                              <span className={activeTab === item.id ? "mt-0.5 block truncate text-xs font-medium text-slate-700" : "mt-0.5 block truncate text-xs text-slate-500"}>{item.note}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            <div data-animate="tools-header" className="border border-[var(--border-soft)] bg-white p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-slate-600">
                在线版
                <span className="h-1 w-1 rounded-sm bg-emerald-500" />
                文件本地处理
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-normal text-slate-950">
                选择一个转换任务，添加文件后直接导出
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                在线版适合图片、文档、音频和视频的轻量单文件处理。文件仅在本地处理，不上传服务器；大文件、敏感文件和批量任务建议使用 Windows 离线专业版。
              </p>
            </div>
            <div className="border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="font-semibold text-emerald-950">在线版说明</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">广告脚本不会接收你正在处理的图片、文档、音频、视频或转换结果。</p>
                </div>
              </div>
            </div>
          </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section data-animate="tools-main" className="min-w-0">
            <div data-animate-dynamic="true" className="border border-[var(--border-soft)] bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">当前工具</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">{currentTab.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{currentTab.description}。文件只在当前设备处理，不上传服务器。</p>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="mt-4 border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3 text-sm leading-6 text-slate-600 sm:p-4">
                <p>{privacyNotice}</p>
                <p className="mt-2">{pdfBoundaryNotice}</p>
              </div>

              {activeTab === "batch-gate" ? (
                <BatchGateNotice />
              ) : activeTab === "download" ? (
                <DownloadEditionNotice />
              ) : (
                <>
                  <div
                    className="mt-4 flex min-h-56 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-white px-4 text-center transition hover:border-slate-500 hover:bg-[var(--surface-muted)]"
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
                    <span className="grid h-14 w-14 place-items-center border border-slate-950 bg-slate-950 text-white">
                      <Download className="h-8 w-8" />
                    </span>
                    <p className="mt-5 text-xl font-bold text-slate-950">将文件拖拽到此处，或点击上传</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">根据当前工具添加对应文件。在线版适合单个轻量文件，大文件建议使用离线专业版。</p>
                  </div>

                  {onlineTaskActionBar}

                  <div data-animate-dynamic="true" className="mt-4">
                    <DesktopPreviewPanel
                      mode={activeTab}
                      modeLabel={currentTab.label}
                      file={file}
                      fileUrl={fileUrl}
                      previewUrl={previewUrl}
                      previewMessage={previewMessage}
                      documentPreview={documentPreview}
                      summary={summary}
                      cropImageRef={cropImageRef}
                      onImageLoad={() => setCropPreviewKey((value) => value + 1)}
                    />
                  </div>
                </>
              )}
            </div>

            {activeTab !== "batch-gate" && activeTab !== "download" ? (
              <div className="mt-5 border border-[var(--border-soft)] bg-white p-4">
                <div className="h-2 overflow-hidden bg-slate-100">
                  <div className="h-full bg-slate-950 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>{progressText}</span>
                  <StatusBadge status={status} />
                </div>
                {compressionStats ? <p className="mt-2 text-sm font-medium text-slate-700">{compressionStats}</p> : null}
                {error ? <p className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-700">处理失败：{error}。下一步：请检查文件格式、降低文件大小或重新添加文件后再试。</p> : null}
                {resultName ? (
                  <div className="mt-3 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="inline-flex min-w-0 items-center gap-2 font-semibold">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="truncate">已生成：{resultName}</span>
                      </span>
                      <button
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-emerald-700 px-5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto sm:min-w-40"
                        type="button"
                        disabled={!resultBlob}
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                        下载结果
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <aside data-animate="tools-side" data-animate-dynamic="true" className="h-fit border border-[var(--border-soft)] bg-white p-4 xl:sticky xl:top-24">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">转换参数</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">{currentTab.label}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{currentTab.description}</p>
            </div>
            <div className="space-y-3">
              <SettingsSection title="当前参数">
                {controlPanel}
              </SettingsSection>
              <SettingsSection title="任务信息">
                <DesktopSettingRow label="输出格式" value={outputFormat} />
                <DesktopSettingRow label="当前状态" value={desktopStatusText} />
                <DesktopSettingRow label="文件数量" value={String(taskCount)} />
              </SettingsSection>
              <SettingsSection title="能力边界">
                <p className="text-sm leading-6 text-slate-600">Word 支持标准 .docx；Excel 支持 .xlsx 和 .csv，旧版 .xls 请先另存为 .xlsx。多页合成长图会增加内存占用。</p>
              </SettingsSection>
            </div>
          </aside>
        </div>
          </div>
        </div>
        </div>
        {shouldRenderAds ? (
          <div id="ad-container" className="mt-8">
            <AdSlot config={adsConfig} name="toolBottom" />
          </div>
        ) : null}
      </section>
      </GsapScene>
    </main>
  );
}

function FileSummaryView({ summary }: { summary: FileSummary }) {
  return (
    <div className="mt-4 grid gap-2 rounded-sm border border-cyan-300/10 bg-slate-950/60 p-4 text-sm text-slate-300 sm:grid-cols-2">
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
    return <div className="mt-4 rounded-sm border border-cyan-300/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">当前工具支持批量队列时，可直接添加多个文件或文件夹。批量类型会自动跟随左侧选中的工具。</div>;
  }
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);
  return (
    <div className="mt-4 rounded-sm border border-cyan-300/10 bg-slate-950/60 p-4 text-sm text-slate-300">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-slate-50">已添加 {files.length} 个文件</p>
        <p>总大小：{formatBytes(totalSize)}</p>
      </div>
      <p className="mt-2">批量类型：{batchModeLabel(mode)}</p>
      {importSummary ? <p className="mt-2">最近导入：共扫描 {importSummary.total} 个，导入 {importSummary.imported} 个，跳过 {importSummary.skipped} 个。</p> : null}
      <div className="mt-3 max-h-32 overflow-auto rounded-sm bg-slate-950 p-3">
        {files.slice(0, 20).map((item) => <p className="truncate" key={`${item.name}-${item.size}`}>{item.name} · {formatBytes(item.size)}</p>)}
        {files.length > 20 ? <p className="text-slate-500">还有 {files.length - 20} 个文件未展开显示。</p> : null}
      </div>
    </div>
  );
}

function BatchGateNotice() {
  return (
    <div className="mb-5 rounded-sm border border-cyan-300/15 bg-cyan-950/25 p-4 sm:p-5" data-testid="online-batch-gate">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-cyan-300">专业版能力</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-50">批量处理</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">需要批量处理大量图片、文档、音频或视频？</p>
          <p className="mt-2 text-sm font-semibold text-slate-50">批量处理为离线专业版功能，请下载 Windows 离线专业版使用。</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            离线专业版支持批量任务队列、输出目录选择和失败重试，所有文件仍然只在本地处理，不上传服务器。
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

function DownloadEditionNotice() {
  return (
    <div className="rounded-sm border border-cyan-300/15 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-cyan-300">离线专业版</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-50">下载 Windows 离线专业版</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            适合敏感文件、大文件、断网环境和批量队列处理。下载入口保持原有流程，文件仍然只在本地处理。
          </p>
        </div>
        <a className="btn-primary inline-flex shrink-0 items-center justify-center gap-2" href="/download">
          <Download className="h-5 w-5" />
          打开下载页
        </a>
      </div>
    </div>
  );
}

function DesktopOfficeChrome({
  statusText,
  queueTotal,
  outputDirectory,
  onSelectOutput,
  onStart,
  onStop,
  onDownloadResult,
  canStart,
  canStop,
  canDownload,
  canBatchImport,
  isRunning
}: {
  statusText: string;
  queueTotal: number;
  outputDirectory: BatchOutputDirectory;
  onSelectOutput: () => void;
  onStart: () => void;
  onStop: () => void;
  onDownloadResult: () => void;
  canStart: boolean;
  canStop: boolean;
  canDownload: boolean;
  canBatchImport: boolean;
  isRunning: boolean;
}) {
  void canBatchImport;
  const commandButtonClass = "inline-flex min-h-11 items-center gap-2 rounded-sm border border-slate-700 bg-slate-900/85 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/60 disabled:text-slate-500";
  const primaryCommandClass = `${commandButtonClass} desktop-command-primary`;
  const stopCommandClass = `${commandButtonClass} desktop-command-stop`;

  return (
    <div className="desktop-titlebar rounded-sm border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-[260px] items-center gap-3">
          <img src="/icons/app-icon-64.png" alt="万能格式转换器" className="h-12 w-12 shrink-0 rounded-sm object-cover" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold text-slate-50">万能格式转换器</h1>
              <span className="rounded-sm border border-blue-500/40 bg-blue-500/20 px-2.5 py-1 text-sm font-semibold text-blue-100">离线专业版</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">本地处理 · 批量队列工具启用 · 简洁稳定 · 适合本地办公场景</p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-100">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            本地处理
            <span className="text-xs text-emerald-200">{statusText}</span>
            <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-blue-400" : "bg-emerald-400"}`} />
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-blue-500/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-100">
            <ListChecks className="h-4 w-4 text-blue-300" />
            批量队列
            <span className="rounded-sm bg-blue-500 px-2 py-0.5 text-xs text-white">{queueTotal}</span>
          </div>
          <button className="inline-flex min-h-11 max-w-[270px] items-center gap-2 rounded-sm border border-amber-500/25 bg-amber-500/10 px-4 text-sm font-semibold text-amber-100" type="button" onClick={onSelectOutput}>
            <FolderOpen className="h-4 w-4 text-slate-600" />
            <span className="shrink-0">输出目录</span>
            <span className="truncate text-slate-200">{outputDirectory.label}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
        <button className={primaryCommandClass} type="button" disabled={!canStart} onClick={onStart}>
          <Play className="h-4 w-4 fill-current" />
          开始转换
        </button>
        <button className={stopCommandClass} type="button" disabled={!canStop} onClick={onStop}>
          <Square className="h-4 w-4 fill-current" />
          停止任务
        </button>
          <button className={commandButtonClass} type="button" disabled={!canDownload} onClick={onDownloadResult}>
            <Download className="h-4 w-4 text-slate-600" />
            下载结果
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopTreeSection({
  section,
  activeTab,
  expanded,
  onToggle,
  onSelectTab
}: {
  section: {
    title: string;
    description: string;
    icon: LucideIcon;
    items: ReadonlyArray<{ id: TabId; label: string; note: string; badge: string; batch?: boolean }>;
  };
  activeTab: TabId;
  expanded: boolean;
  onToggle: () => void;
  onSelectTab: (tabId: TabId) => void;
}) {
  const SectionIcon = section.icon;
  return (
    <section className="rounded-sm border border-slate-700/80 bg-slate-950/72">
      <button
        className="flex w-full items-center justify-between gap-3 border-b border-slate-800/90 px-3 py-2.5 text-left transition hover:bg-slate-900/45"
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
            <SectionIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-50">{section.title}</p>
            <p className="truncate text-[11px] text-slate-500">{section.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-sm border border-slate-700/80 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-400">{section.items.length}</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      {expanded ? (
        <div className="space-y-1 p-2">
          {section.items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={activeTab === item.id}
              className={`group flex w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition ${
                activeTab === item.id
                  ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-50"
                  : "border-transparent bg-slate-950/40 text-slate-200 hover:border-slate-700/70 hover:bg-slate-900/80"
              }`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className={`mt-0.5 min-w-8 rounded-sm px-2 py-1 text-center text-[11px] font-semibold ${activeTab === item.id ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-cyan-200 group-hover:bg-cyan-400/10"}`}>
                {item.badge}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold leading-5">{item.label}</span>
                  <span className="shrink-0 rounded-sm border border-slate-700/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {item.batch ? "单 / 批" : "单"}
                  </span>
                </span>
                <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">{item.note}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DesktopReplicaTitlebar() {
  return (
    <div className="flex h-[31px] items-center border-b border-[#17242C] bg-[#1E2A32] px-[10px] text-[#EDF3F7]">
      <h1 className="truncate text-[16px] font-bold leading-none">离线专业版 v{downloadsConfig.version}</h1>
      <div className="ml-auto flex h-full items-center text-[14px] text-[#CAD5DC]" aria-hidden="true">
        <span className="grid h-full w-[46px] place-items-center">-</span>
        <span className="grid h-full w-[46px] place-items-center">□</span>
        <span className="grid h-full w-[46px] place-items-center">×</span>
      </div>
    </div>
  );
}

function DesktopReplicaNavSection({
  section,
  activeTab,
  expanded,
  onToggle,
  onSelectTab
}: {
  section: {
    title: string;
    description: string;
    icon: LucideIcon;
    items: ReadonlyArray<{ id: TabId; label: string; note: string; badge: string; batch?: boolean }>;
  };
  activeTab: TabId;
  expanded: boolean;
  onToggle: () => void;
  onSelectTab: (tabId: TabId) => void;
}) {
  const SectionIcon = section.icon;
  const active = section.items.some((item) => item.id === activeTab);

  return (
    <section>
      <button
        className={`desktop-nav-row ${active ? "desktop-nav-row-active" : ""}`}
        type="button"
        aria-expanded={expanded}
        onClick={() => {
          if (active) onToggle();
          else onSelectTab(section.items[0].id);
        }}
      >
        <SectionIcon className="h-[15px] w-[15px]" />
        <span className="min-w-0 flex-1 truncate">{section.title}</span>
        <ChevronDown className={`h-[14px] w-[14px] text-[#CAD5DC] transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded ? (
        <div className="border-b border-[#34464F] bg-[#26353E] py-1">
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`flex h-8 w-full items-center gap-2 px-4 text-left text-[12px] ${
                activeTab === item.id ? "bg-[#436078] text-[#EDF3F7]" : "text-[#CAD5DC] hover:bg-[#334750]"
              }`}
              type="button"
              aria-pressed={activeTab === item.id}
              title={item.label}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="w-8 shrink-0 text-[11px] font-semibold text-[#9FC6E5]">{item.badge}</span>
              <span className="min-w-0 whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DesktopReplicaNavButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`desktop-nav-row ${active ? "desktop-nav-row-active" : ""}`} type="button" onClick={onClick}>
      <Icon className="h-[15px] w-[15px]" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function DesktopQueueButton({ icon: Icon, label, disabled, onClick }: { icon: LucideIcon; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button className="desktop-queue-command" type="button" disabled={disabled} onClick={onClick}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function DesktopReplicaInspector({
  mode,
  modeLabel,
  file,
  fileUrl,
  previewUrl,
  previewMessage,
  documentPreview,
  summary,
  cropImageRef,
  onImageLoad,
  fileName,
  fileType,
  fileSize,
  outputFormat,
  statusText,
  progressText,
  progress,
  taskTotal,
  successCount,
  failureCount,
  outputDirectory,
  sidecarStatus,
  sidecarReady,
  sidecarExperimentEnabled,
  controlPanel,
  error,
  resultName,
  onRefreshSidecar,
  onToggleSidecar,
  onSelectOutput,
  onDownloadResult,
  canDownload
}: {
  mode: TabId | BatchMode;
  modeLabel: string;
  file: File | null;
  fileUrl: string;
  previewUrl: string;
  previewMessage: string;
  documentPreview: DocumentPreviewState;
  summary: FileSummary | null;
  cropImageRef?: RefObject<HTMLImageElement>;
  onImageLoad?: () => void;
  fileName: string;
  fileType: string;
  fileSize: string;
  outputFormat: string;
  statusText: string;
  progressText: string;
  progress: number;
  taskTotal: number;
  successCount: number;
  failureCount: number;
  outputDirectory: BatchOutputDirectory;
  sidecarStatus: SidecarCheckResult | null;
  sidecarReady: boolean;
  sidecarExperimentEnabled: boolean;
  controlPanel: React.ReactNode;
  error: string;
  resultName: string;
  onRefreshSidecar: () => void;
  onToggleSidecar: (enabled: boolean) => void;
  onSelectOutput: () => void;
  onDownloadResult: () => void;
  canDownload: boolean;
}) {
  return (
    <aside className="desktop-replica-inspector min-w-0 overflow-y-auto border-l border-[#18242B] bg-[#3A4D58]">
      <div className="flex h-10 items-center border-b border-[#1E2B32] px-3">
        <h2 className="text-[14px] font-bold text-[#EDF3F7]">属性检查器</h2>
      </div>

      <section className="border-b border-[#1E2B32] p-3">
        <div className="grid grid-cols-[75px_minmax(0,1fr)] gap-3">
          <div className="grid h-[60px] place-items-center rounded-[3px] border border-[#0D1418] bg-[#0D1418] p-1">
            {file && fileUrl && (isImageFile(file) || isVideoFile(file)) ? (
              isVideoFile(file) ? <video className="h-full w-full object-cover" src={fileUrl} preload="metadata" muted /> : <img className="h-full w-full object-cover" src={previewUrl || fileUrl} alt="" />
            ) : (
              <FileImage className="h-7 w-7 text-[#91B2C9]" />
            )}
          </div>
          <div className="min-w-0 py-1">
            <p className="truncate text-[13px] font-bold text-[#EDF3F7]" title={fileName || "未选择文件"}>{fileName || "未选择文件"}</p>
            <p className="mt-2 truncate text-[13px] text-[#CAD5DC]">{fileType || modeLabel}</p>
            <p className="mt-2 text-[13px] text-[#CAD5DC]">{fileSize || "等待添加文件"}</p>
          </div>
        </div>
      </section>

      <section className="desktop-inspector-section border-b border-[#1E2B32]">
        <div className="desktop-control-panel">{controlPanel}</div>
      </section>

      <section className="desktop-inspector-section border-b border-[#1E2B32]">
        <h3 className="mb-3 text-[14px] font-bold text-[#EDF3F7]">{file && isAudioFile(file) ? "音频预览" : file && !isVideoFile(file) ? "文件预览" : "视频预览"}</h3>
        <DesktopInspectorPreview
          mode={mode}
          modeLabel={modeLabel}
          file={file}
          fileUrl={fileUrl}
          previewUrl={previewUrl}
          previewMessage={previewMessage}
          documentPreview={documentPreview}
          summary={summary}
          cropImageRef={cropImageRef}
          onImageLoad={onImageLoad}
        />
      </section>

      <section className="desktop-inspector-section border-b border-[#1E2B32]">
        <h3 className="mb-3 text-[14px] font-bold text-[#EDF3F7]">本地后端状态</h3>
        <div className="space-y-1.5 text-[12px] text-[#CAD5DC]">
          <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#76C77D]" />FFmpeg WASM: Active</p>
          <p className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 truncate"><span className={`h-3 w-3 shrink-0 rounded-full ${sidecarReady ? "bg-[#76C77D]" : "bg-[#D56A6A]"}`} />Local Sidecar FFmpeg: {sidecarReady ? "Configured" : "Not configured"}</span>
            <input
              className="desktop-backend-toggle shrink-0"
              type="checkbox"
              aria-label="使用本地 sidecar FFmpeg 优先处理低风险格式"
              title={`使用本地 sidecar FFmpeg 优先处理低风险格式。${sidecarStatusText(sidecarStatus || undefined)}`}
              checked={sidecarExperimentEnabled}
              disabled={!sidecarReady}
              onChange={(event) => onToggleSidecar(event.target.checked)}
            />
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="desktop-queue-command justify-center" type="button" onClick={onRefreshSidecar}>重新检测</button>
          <button className="desktop-queue-command justify-center" type="button" onClick={onSelectOutput}>输出目录</button>
        </div>
      </section>

      {taskTotal > 0 || error || resultName ? (
        <section className="desktop-inspector-section">
          <h3 className="mb-3 text-[14px] font-bold text-[#EDF3F7]">任务信息</h3>
          <div className="h-2 overflow-hidden border border-[#50646F] bg-[#23313A]">
            <div className="h-full bg-[#4F81A5]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="mt-3 grid gap-2 text-[12px] text-[#CAD5DC]">
            <DesktopInspectorStat label="输出格式" value={outputFormat} />
            <DesktopInspectorStat label="当前状态" value={statusText} />
            <DesktopInspectorStat label="总任务" value={String(taskTotal)} />
            <DesktopInspectorStat label="成功 / 失败" value={`${successCount} / ${failureCount}`} />
            <DesktopInspectorStat label="输出目录" value={outputDirectory.label} />
          </div>
          {error ? <p className="mt-3 border border-[#D56A6A] bg-[#4A2B2F] p-2 text-[12px] text-[#FFD6D6]">处理失败：{error}</p> : null}
          {resultName ? (
            <button className="desktop-queue-command mt-3 w-full justify-center" type="button" disabled={!canDownload} onClick={onDownloadResult}>
              <Download className="h-3.5 w-3.5" />
              下载结果
            </button>
          ) : <p className="mt-3 text-[12px] text-[#9FACB4]">{progressText}</p>}
        </section>
      ) : null}
    </aside>
  );
}

function DesktopInspectorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-h-[32px] grid-cols-[74px_minmax(0,1fr)] items-center border border-[#41545F] bg-[#334750] px-2">
      <span className="text-[#CAD5DC]">{label}</span>
      <span className="truncate text-right font-semibold text-[#EDF3F7]" title={value}>{value}</span>
    </div>
  );
}

function DesktopInspectorPreview({
  mode,
  modeLabel,
  file,
  fileUrl,
  previewUrl,
  previewMessage,
  documentPreview,
  summary,
  cropImageRef,
  onImageLoad
}: {
  mode: TabId | BatchMode;
  modeLabel: string;
  file: File | null;
  fileUrl: string;
  previewUrl: string;
  previewMessage: string;
  documentPreview: DocumentPreviewState;
  summary: FileSummary | null;
  cropImageRef?: RefObject<HTMLImageElement>;
  onImageLoad?: () => void;
}) {
  const isImageMode = mode === "crop" || mode === "resize" || mode === "watermark" || mode === "compress" || mode === "batch";
  const isDocumentMode = mode === "pdf-images" || mode === "word-images" || mode === "excel-images";
  const imagePreview = previewUrl && (mode === "resize" || mode === "watermark") ? previewUrl : fileUrl;

  if (!file) {
    return <div className="desktop-preview-stage desktop-preview-empty" aria-hidden="true" />;
  }

  if (file && isVideoFile(file) && fileUrl) {
    return <video key={fileUrl} className="desktop-preview-stage bg-[#05090B] object-contain" src={fileUrl} controls preload="metadata" playsInline />;
  }

  if (file && isAudioFile(file) && fileUrl) {
    return (
      <div className="desktop-preview-stage flex items-center px-3">
        <audio key={fileUrl} className="w-full" src={fileUrl} controls preload="metadata" />
      </div>
    );
  }

  if (file && isImageFile(file) && isImageMode && imagePreview) {
    return (
      <img
        ref={mode === "crop" ? cropImageRef : undefined}
        className="desktop-preview-stage object-contain"
        src={imagePreview}
        alt={`${modeLabel}预览`}
        onLoad={mode === "crop" ? onImageLoad : undefined}
      />
    );
  }

  if (file && (isPdfFile(file) || isWordFile(file) || isExcelFile(file)) && isDocumentMode && documentPreview.url) {
    return <img className="desktop-preview-stage object-contain" src={documentPreview.url} alt={`${modeLabel}预览`} />;
  }

  return (
    <div className="desktop-preview-stage flex items-center justify-center px-4 text-center text-[12px] text-[#CAD5DC]">
      <div>
        <p className="font-semibold text-[#EDF3F7]">当前模式：{modeLabel}</p>
        <p className="mt-2 leading-5">{previewMessage || documentPreview.message || `${summary ? summary.name : "文件"} 已添加，转换逻辑可用。`}</p>
      </div>
    </div>
  );
}

function DesktopPreviewPanel({
  mode,
  modeLabel,
  file,
  fileUrl,
  previewUrl,
  previewMessage,
  documentPreview,
  summary,
  cropImageRef,
  onImageLoad
}: {
  mode: TabId | BatchMode;
  modeLabel: string;
  file: File | null;
  fileUrl: string;
  previewUrl: string;
  previewMessage: string;
  documentPreview: DocumentPreviewState;
  summary: FileSummary | null;
  cropImageRef?: RefObject<HTMLImageElement>;
  onImageLoad?: () => void;
}) {
  const isImageMode = mode === "crop" || mode === "resize" || mode === "watermark" || mode === "compress" || mode === "batch";
  const isDocumentMode = mode === "pdf-images" || mode === "word-images" || mode === "excel-images";
  const imagePreview = previewUrl && (mode === "resize" || mode === "watermark") ? previewUrl : fileUrl;
  const previewTitle = mode === "resize" ? "尺寸预览" : mode === "watermark" ? "水印预览" : "当前文件预览";
  const mediaKind = getDesktopPreviewMediaKind(file, summary);
  const fileType = summary ? getDesktopPreviewFileType(summary) : "";

  let previewBody: React.ReactNode;
  if (!file) {
    previewBody = (
      <div className="flex min-h-56 items-center justify-center rounded-sm border border-dashed border-slate-700/80 bg-slate-950/70 px-6 text-center text-sm text-slate-500">
        未选择文件
      </div>
    );
  } else if (file && isVideoFile(file) && fileUrl) {
    previewBody = (
      <video key={fileUrl} className="max-h-[460px] w-full rounded-sm bg-slate-950" src={fileUrl} controls preload="metadata" playsInline />
    );
  } else if (file && isAudioFile(file) && fileUrl) {
    previewBody = (
      <div className="rounded-sm border border-slate-800/80 bg-slate-950/70 p-4">
        <audio key={fileUrl} className="w-full" src={fileUrl} controls preload="metadata" />
      </div>
    );
  } else if (file && isImageFile(file) && isImageMode && imagePreview) {
    previewBody = (
      <img
        ref={mode === "crop" ? cropImageRef : undefined}
        className="max-h-[460px] w-full rounded-sm bg-slate-950 object-contain"
        src={imagePreview}
        alt={`${modeLabel}预览`}
        onLoad={mode === "crop" ? onImageLoad : undefined}
      />
    );
  } else if (file && (isPdfFile(file) || isWordFile(file) || isExcelFile(file)) && isDocumentMode && documentPreview.url) {
    previewBody = <img className="max-h-[460px] w-full rounded-sm bg-slate-950 object-contain" src={documentPreview.url} alt={`${modeLabel}预览`} />;
  } else {
    previewBody = (
      <div className="flex min-h-56 items-center justify-center rounded-sm border border-dashed border-slate-700/80 bg-slate-950/70 px-6 text-center text-sm text-slate-500">
        <div>
          <p className="font-semibold text-slate-200">当前模式：{modeLabel}</p>
          <p className="mt-1">{previewMessage || documentPreview.message || "文件已添加，但当前类型暂不展示图像式预览。"}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-slate-700/80 bg-slate-950/72 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-cyan-300">预览区</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-50">{previewTitle}</h3>
        </div>
      </div>
      {summary ? (
        <div className="mt-3 grid gap-2 rounded-sm border border-slate-800/90 bg-slate-950/60 p-3 text-xs text-slate-300 sm:grid-cols-2">
          <p className="min-w-0 truncate">文件名：{summary.name}</p>
          <p>大小：{formatBytes(summary.size)}</p>
          <p>类型：{fileType}</p>
          <p>媒体类型：{mediaKind}</p>
        </div>
      ) : null}
      <div className="mt-4 rounded-sm border border-slate-800/90 bg-slate-950/80 p-3">
        {previewBody}
      </div>
    </section>
  );
}

function getDesktopPreviewFileType(summary: FileSummary) {
  if (summary.type && summary.type !== "application/octet-stream" && summary.type !== "未知") return summary.type;
  return summary.extension ? `.${summary.extension}` : "未知";
}

function getDesktopPreviewMediaKind(file: File | null, summary: FileSummary | null) {
  if (!file || !summary) return "未选择";
  if (summary.media?.kind === "video" || isVideoFile(file)) return "视频";
  if (summary.media?.kind === "audio" || isAudioFile(file)) return "音频";
  if (summary.image || isImageFile(file)) return "图片";
  if (summary.pdf || isPdfFile(file)) return "PDF";
  if (summary.document?.kind === "word" || isWordFile(file)) return "Word";
  if (summary.document?.kind === "excel" || isExcelFile(file)) return "Excel";
  return "文件";
}

function DesktopUploadAction({ icon: Icon, title, description, disabled, onClick }: { icon: LucideIcon; title: string; description: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex min-h-40 flex-col items-center justify-center rounded-sm border border-transparent bg-transparent px-4 py-4 text-center transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className="relative grid h-20 w-20 place-items-center rounded-sm border border-slate-300 bg-slate-50 text-blue-600 shadow-sm transition group-hover:border-blue-300 group-hover:bg-white">
        <Icon className="h-9 w-9" />
        <span className="absolute -right-2 -bottom-2 grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-lg font-bold leading-none text-white shadow-sm">+</span>
      </span>
      <span className="mt-4 text-base font-semibold text-slate-900">{title}</span>
      <span className="mt-1 text-sm text-slate-500">{description}</span>
    </button>
  );
}

function DesktopEmptyQueue({ batchEnabled, onPickFile, onPickFolder, onPickOutputDirectory }: { batchEnabled: boolean; onPickFile: () => void; onPickFolder: () => void; onPickOutputDirectory: () => void }) {
  return (
    <div>
      <div className="desktop-table-row grid grid-cols-[48px_minmax(180px,1fr)_105px_105px_145px_120px_104px] items-center text-[13px] text-[#CAD5DC]">
        <span>1</span>
        <button className="truncate text-left font-semibold text-[#EDF3F7] hover:text-[#9FC6E5]" type="button" onClick={onPickFile}>暂无任务</button>
        <span>{batchEnabled ? "可批量" : "单文件"}</span>
        <span>-</span>
        <span>-</span>
        <StatusBadge status="idle" />
        <button className="w-fit border border-[#50646F] px-2 py-1 text-[12px] text-[#EDF3F7] hover:bg-[#436078]" type="button" onClick={batchEnabled ? onPickFolder : onPickOutputDirectory}>
          {batchEnabled ? "导入" : "设置"}
        </button>
      </div>
      {Array.from({ length: 17 }).map((_, index) => (
        <div key={index} className="desktop-table-row grid grid-cols-[48px_minmax(180px,1fr)_105px_105px_145px_120px_104px] items-center text-[13px] text-[#CAD5DC]" aria-hidden="true">
          <span>{index + 2}</span>
          <span className="h-2.5 w-40 bg-[#41545F]/55" />
          <span className="h-2.5 w-12 bg-[#41545F]/45" />
          <span className="h-2.5 w-14 bg-[#41545F]/45" />
          <span className="h-6 w-[118px] border border-[#50646F] bg-[#23313A]" />
          <span className="h-2.5 w-14 bg-[#41545F]/45" />
          <span className="h-2.5 w-12 bg-[#41545F]/45" />
        </div>
      ))}
    </div>
  );
}

function DesktopBatchTaskRow({
  task,
  index,
  active,
  onSelect,
  onRetry,
  onCancel,
  onOpenResult,
  onCopy
}: {
  task: BatchTask;
  index: number;
  active: boolean;
  onSelect: () => void;
  onRetry: () => void;
  onCancel: () => void;
  onOpenResult: () => void;
  onCopy: () => void;
}) {
  const failureReason = task.status === "failed" || task.status === "cancelled" ? (task.error || "处理失败，请检查文件格式后重试") : "—";
  const canRetry = task.status === "failed" || task.status === "cancelled";
  const canCancel = task.status === "queued" || task.status === "running";
  const canOpen = task.status === "success" && Boolean(task.outputPath);

  return (
    <div
      className={`desktop-table-row batch-table-row grid grid-cols-[48px_minmax(180px,1fr)_105px_105px_145px_120px_104px] items-center text-[13px] ${active ? "desktop-table-row-active" : ""}`}
      data-testid="batch-task-row"
      data-task-id={task.id}
      onClick={onSelect}
    >
      <span>{index}</span>
      <span className="min-w-0 truncate font-medium text-[#EDF3F7]" title={task.sourcePath || task.fileName}>{task.fileName}</span>
      <span className="truncate text-[#CAD5DC]">{task.fileType || batchModeLabel(task.mode)}</span>
      <span className="truncate text-[#CAD5DC]">{formatBytes(task.fileSize)}</span>
      <span className="mr-2 truncate rounded-[4px] border border-[#60737D] bg-[#23313A] px-2 py-1 text-[#EDF3F7]">{task.outputFormat}{task.backend ? ` · ${task.backend === "sidecar" ? "sidecar" : "WASM"}` : ""}</span>
      <BatchStatusBadge status={task.status} progress={task.progress} />
      <span className="flex items-center gap-1" title={failureReason}>
        {canRetry ? <button type="button" className="desktop-row-icon-button" title="重试" aria-label="重试任务" data-testid="retry-task-button" onClick={(event) => { event.stopPropagation(); onRetry(); }}><RotateCcw className="h-3.5 w-3.5" /></button> : null}
        {canCancel ? <button type="button" className="desktop-row-icon-button text-[#D56A6A]" title="取消" onClick={(event) => { event.stopPropagation(); onCancel(); }}><Square className="h-3.5 w-3.5 fill-current" /></button> : null}
        {canOpen ? <button type="button" className="desktop-row-icon-button" title="打开结果文件" aria-label="打开结果文件" data-testid="open-result-file-button" onClick={(event) => { event.stopPropagation(); onOpenResult(); }}><ExternalLink className="h-3.5 w-3.5" /></button> : null}
        {task.outputPath ? <button type="button" className="desktop-row-icon-button" title="复制输出路径" onClick={(event) => { event.stopPropagation(); onCopy(); }}><Copy className="h-3.5 w-3.5" /></button> : null}
      </span>
    </div>
  );
}

function DesktopMetric({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "success" | "danger" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "danger" ? "text-red-300" : "text-slate-50";
  return (
    <div className="rounded-sm border border-cyan-300/15 bg-slate-950/70 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DesktopTaskRow({ name, type, size, outputFormat, status, error }: { name: string; type: string; size: string; outputFormat: string; status: ProcessState; error?: string }) {
  const failureReason = status === "error" ? (error || "处理失败，请检查文件格式后重试") : "—";

  return (
    <div className="desktop-table-row batch-table-row desktop-table-row-active grid grid-cols-[48px_minmax(180px,1fr)_105px_105px_145px_120px_104px] items-center text-[13px]">
      <span>1</span>
      <span className="min-w-0 truncate font-medium text-[#EDF3F7]" title={name}>{name}</span>
      <span className="truncate text-[#CAD5DC]">{type}</span>
      <span className="truncate text-[#CAD5DC]">{size}</span>
      <span className="mr-2 truncate rounded-[4px] border border-[#60737D] bg-[#23313A] px-2 py-1 text-[#EDF3F7]">{outputFormat}</span>
      <StatusBadge status={status} />
      <span className="flex items-center gap-1" title={failureReason}>
        <button type="button" className="desktop-row-icon-button" title="重试"><RotateCcw className="h-3.5 w-3.5" /></button>
      </span>
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

  return <span className={`w-fit rounded-sm px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{statusText[status]}</span>;
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
  return <span className={`w-fit rounded-sm px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{batchTaskStatusLabel(status)}{suffix}</span>;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-cyan-300/10 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function DesktopSettingRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-sm border border-cyan-300/10 bg-slate-950/70 p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-slate-400">{label}</span>
        <span className="text-right font-semibold text-slate-100">{value}</span>
      </div>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}

function DesktopPropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-slate-700/80 bg-slate-950/60 p-3">
      <h3 className="border-b border-slate-800/80 pb-2 text-sm font-semibold text-slate-50">{title}</h3>
      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  );
}

function WorkbenchTopBar({ surface, subtitle }: { surface: string; subtitle: string }) {
  return (
    <div className="rounded-sm border border-cyan-300/15 bg-slate-950/70 p-4 backdrop-blur">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.5fr)_minmax(260px,0.8fr)] xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <span>{surface}</span>
            <span className="h-1 w-1 rounded-sm bg-cyan-300" />
            <span>{subtitle}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-50">万能格式转换器</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">全能、高效、安全、专业的格式转换解决方案。</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {workbenchCapabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 rounded-sm border border-cyan-300/12 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200">
                <Icon className="h-4 w-4 text-cyan-300" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-sm border border-emerald-300/20 bg-emerald-400/10 p-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
            <div>
              <p className="font-semibold text-emerald-50">文件仅在本地处理，不上传服务器</p>
              <p className="mt-1 text-sm leading-6 text-emerald-100/75">保护你的隐私与数据安全。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {assuranceItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-sm border border-cyan-300/10 bg-slate-900/55 p-3">
              <span className="grid h-9 w-9 place-items-center rounded-sm bg-cyan-400/10 text-cyan-200">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-100">{item.label}</span>
                <span className="block truncate text-xs text-slate-500">{item.detail}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolTabButton({ tab, active, onClick }: { tab: ToolTab; active: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  const activeClass = active
    ? "border-cyan-300 bg-cyan-400/12 text-cyan-100 ring-2 ring-cyan-400/10"
    : tab.featured
      ? "border-cyan-300/18 bg-slate-900/75 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-400/10"
      : "border-cyan-300/12 bg-slate-950/55 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/32 hover:bg-slate-900";
  const iconClass = active
    ? "bg-cyan-400 text-slate-950"
    : tab.featured
      ? "bg-cyan-400/12 text-cyan-200"
      : "bg-slate-800 text-slate-300";

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`group min-h-[104px] rounded-sm border p-4 text-left transition duration-200 active:scale-[0.98] ${activeClass}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm transition ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-6">{tab.label}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-400">{tab.description}</span>
        </span>
      </div>
      {tab.featured ? <span className="mt-3 inline-flex rounded-sm border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">常用</span> : null}
    </button>
  );
}

type ControlPanelProps = any;

function ControlPanel(props: ControlPanelProps) {
  if (props.activeTab === "crop") return <Panel title="图片裁切" note="拖动预览图上的裁切框即可自由裁切，也可以选择头像、证件照、横屏封面、竖屏封面等常用比例。"><Select label="裁切比例" value={props.cropRatio} onChange={props.setCropRatio} options={props.cropRatioOptions} /><div className="grid grid-cols-2 gap-2"><button className="btn-secondary" type="button" onClick={() => props.rotateCrop(-90)}>左转 90°</button><button className="btn-secondary" type="button" onClick={() => props.rotateCrop(90)}>右转 90°</button><button className="btn-secondary" type="button" onClick={() => props.flipCrop("x")}>水平翻转</button><button className="btn-secondary" type="button" onClick={() => props.flipCrop("y")}>垂直翻转</button></div><button className="btn-secondary w-full" type="button" onClick={props.resetCrop}>重置裁切框</button><ImageFormat value={props.cropFormat} onChange={props.setCropFormat} /><Range label="导出质量" value={props.cropQuality} min={10} max={100} onChange={props.setCropQuality} /></Panel>;
  if (props.activeTab === "resize") return <Panel title="尺寸调整" note="可按百分比快速缩放，也可以输入像素宽高。右侧会自动显示处理预览。"><Select label="调整方式" value={props.resizeMode} onChange={props.setResizeMode} options={[{ value: "percent", label: "按百分比" }, { value: "pixel", label: "按像素" }]} />{props.resizeMode === "percent" ? <Field label="缩放比例"><select className="form-input" value={String(props.resizePercent)} onChange={(event) => props.setResizePercent(Number(event.target.value))}><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option><option value="125">125%</option><option value="150">150%</option><option value="200">200%</option></select></Field> : <><NumberField label="宽度（像素）" value={props.resizeWidth} onChange={props.setResizeWidth} /><NumberField label="高度（像素）" value={props.resizeHeight} onChange={props.setResizeHeight} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.resizeKeepRatio} onChange={(event) => props.setResizeKeepRatio(event.target.checked)} />锁定原图比例</label></>}<ImageFormat value={props.resizeFormat} onChange={props.setResizeFormat} /><Range label="导出质量" value={props.resizeQuality} min={10} max={100} onChange={props.setResizeQuality} /></Panel>;
  if (props.activeTab === "watermark") return <Panel title="添加水印" note="文字或图片水印均在本地合成，不上传图片。文字水印支持字号、颜色和透明度预览。"><Select label="水印类型" value={props.watermarkMode} onChange={props.setWatermarkMode} options={["text", "image"]} />{props.watermarkMode === "image" ? <Field label="水印图片"><input type="file" accept={imageAccept} onChange={(event) => props.setWatermarkImage(event.target.files?.[0] || null)} /></Field> : <><Field label="水印文字"><input className="form-input" value={props.watermarkText} onChange={(event) => props.setWatermarkText(event.target.value)} /></Field><Range label="文字大小" value={props.watermarkFontSize} min={12} max={160} onChange={props.setWatermarkFontSize} /><Field label="文字颜色"><div className="flex gap-2"><input className="h-11 w-14 rounded-sm border border-cyan-300/20 bg-slate-950 p-1" type="color" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /><input className="form-input" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /></div></Field></>}<Select label="位置" value={props.watermarkPosition} onChange={props.setWatermarkPosition} options={["top-left", "top-right", "bottom-left", "bottom-right", "center", "tile"]} /><Range label="透明度" value={props.watermarkOpacity} min={5} max={100} onChange={props.setWatermarkOpacity} /><ImageFormat value={props.watermarkFormat} onChange={props.setWatermarkFormat} /></Panel>;
  if (props.activeTab === "compress") return <Panel title="图片压缩" note="固定导出 JPG，目标大小为 200KB、100KB、50KB、25KB。"><Select label="压缩强度" value={props.compressStrength} onChange={props.setCompressStrength} options={["light", "recommended", "extreme"]} /><Field label="目标大小"><select className="form-input" value={props.targetSize} onChange={(event) => props.setTargetSize(event.target.value)}><option value="200KB">200KB</option><option value="100KB">100KB</option><option value="50KB">50KB</option><option value="25KB">25KB</option></select></Field><Range label="质量" value={props.compressQuality} min={10} max={100} onChange={props.setCompressQuality} /><NumberField label="最大宽高" value={props.maxSize} onChange={props.setMaxSize} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.keepOriginalSize} onChange={(event) => props.setKeepOriginalSize(event.target.checked)} />保留原尺寸</label></Panel>;
  if (props.activeTab === "pdf-images") return <Panel title="PDF 转图片" note="PDF.js 本地渲染，可选择逐页导出 ZIP，也可以把所选页合成为一张长图。"><PdfPageField value={props.pdfPages} onChange={props.setPdfPages} /><Select label="导出方式" value={props.pdfImageMode} onChange={props.setPdfImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><Select label="图片格式" value={props.pdfImageFormat} onChange={props.setPdfImageFormat} options={["png", "jpg", "webp"]} /><Select label="清晰度" value={props.pdfScale} onChange={props.setPdfScale} options={["normal", "high", "ultra"]} /></Panel>;
  if (props.activeTab === "word-images") return <Panel title="Word 转图片" note="支持标准 .docx 文档，按页面导出图片或合成为一张长图，所有解析和渲染都在本地完成。"><Select label="导出方式" value={props.officeImageMode} onChange={props.setOfficeImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><ImageFormat value={props.officeImageFormat} onChange={props.setOfficeImageFormat} /></Panel>;
  if (props.activeTab === "excel-images") return <Panel title="Excel 转图片" note="支持 xlsx、csv。旧版 xls 请先另存为 xlsx 后再转换，以降低浏览器解析风险。"><Select label="导出方式" value={props.officeImageMode} onChange={props.setOfficeImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><ImageFormat value={props.officeImageFormat} onChange={props.setOfficeImageFormat} /></Panel>;
  if (props.activeTab === "video-convert") return <Panel title="视频格式转换" note="使用本地 FFmpeg WASM，支持 MP4、MOV、AVI、MKV、WebM，并可选择分辨率、码率和是否清理元数据。">{props.desktopMode ? null : <MediaCapabilityBox report={props.mediaReport} />}<Select label="输出格式" value={props.videoFormat} onChange={props.setVideoFormat} options={[...videoOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><Select label="视频尺寸" value={props.videoSize} onChange={props.setVideoSize} options={[...videoSizeOptions]} /><MediaAdvancedControls {...props} /></Panel>;
  if (props.activeTab === "audio-convert") return <Panel title="音频格式转换" note="使用本地 FFmpeg WASM，支持 MP3、WAV、AAC、M4A、FLAC，并可选择音频码率。">{props.desktopMode ? null : <MediaCapabilityBox report={props.mediaReport} />}<Select label="输出格式" value={props.audioFormat} onChange={props.setAudioFormat} options={[...audioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></Panel>;
  if (props.activeTab === "video-audio") return <Panel title="视频提取音频" note="只读取视频中的音频轨道，导出 MP3、WAV、M4A、AAC。">{props.desktopMode ? null : <MediaCapabilityBox report={props.mediaReport} />}<Select label="输出格式" value={props.extractedAudioFormat} onChange={props.setExtractedAudioFormat} options={[...extractedAudioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></Panel>;
  if (props.activeTab === "batch-gate") return <Panel title="批量处理" note="批量处理为离线专业版功能，请下载 Windows 离线专业版使用。"><a className="btn-primary inline-flex items-center justify-center gap-2" href="/download"><Download className="h-5 w-5" />下载离线专业版</a></Panel>;
  if (props.activeTab === "batch") return <Panel title="离线批量处理" note="批量能力只在离线安装版提供，支持断网环境下顺序处理多个文件，并优先保存到本地输出目录。"><Select label="批量类型" value={props.batchMode} onChange={props.setBatchMode} options={[{ value: "compress", label: "图片批量压缩" }, { value: "watermark", label: "图片批量加水印" }, { value: "word-images", label: "Word 批量转图片" }, { value: "excel-images", label: "Excel 批量转图片" }, { value: "video-convert", label: "视频批量转换" }, { value: "audio-convert", label: "音频批量转换" }, { value: "video-audio", label: "视频批量提取音频" }]} /><div className="rounded-sm border border-cyan-300/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-300">已添加 {props.batchFiles?.length || 0} 个文件。切换批量类型后，建议重新添加对应格式的文件。</div>{props.batchMode === "compress" ? <><Select label="压缩强度" value={props.compressStrength} onChange={props.setCompressStrength} options={["light", "recommended", "extreme"]} /><Field label="目标大小"><select className="form-input" value={props.targetSize} onChange={(event) => props.setTargetSize(event.target.value)}><option value="200KB">200KB</option><option value="100KB">100KB</option><option value="50KB">50KB</option><option value="25KB">25KB</option></select></Field><Range label="质量" value={props.compressQuality} min={10} max={100} onChange={props.setCompressQuality} /><NumberField label="最大宽高" value={props.maxSize} onChange={props.setMaxSize} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.keepOriginalSize} onChange={(event) => props.setKeepOriginalSize(event.target.checked)} />保留原尺寸</label></> : null}{props.batchMode === "watermark" ? <><Select label="水印类型" value={props.watermarkMode} onChange={props.setWatermarkMode} options={["text", "image"]} />{props.watermarkMode === "image" ? <Field label="水印图片"><input type="file" accept={imageAccept} onChange={(event) => props.setWatermarkImage(event.target.files?.[0] || null)} /></Field> : <><Field label="水印文字"><input className="form-input" value={props.watermarkText} onChange={(event) => props.setWatermarkText(event.target.value)} /></Field><Range label="文字大小" value={props.watermarkFontSize} min={12} max={160} onChange={props.setWatermarkFontSize} /><Field label="文字颜色"><div className="flex gap-2"><input className="h-11 w-14 rounded-sm border border-cyan-300/20 bg-slate-950 p-1" type="color" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /><input className="form-input" value={props.watermarkColor} onChange={(event) => props.setWatermarkColor(event.target.value)} /></div></Field></>}<Select label="位置" value={props.watermarkPosition} onChange={props.setWatermarkPosition} options={["top-left", "top-right", "bottom-left", "bottom-right", "center", "tile"]} /><Range label="透明度" value={props.watermarkOpacity} min={5} max={100} onChange={props.setWatermarkOpacity} /><ImageFormat value={props.watermarkFormat} onChange={props.setWatermarkFormat} /></> : null}{props.batchMode === "word-images" || props.batchMode === "excel-images" ? <><Select label="导出方式" value={props.officeImageMode} onChange={props.setOfficeImageMode} options={[{ value: "pages", label: "逐页导出" }, { value: "combined", label: "合成一页导出" }]} /><ImageFormat value={props.officeImageFormat} onChange={props.setOfficeImageFormat} /></> : null}{props.batchMode === "video-convert" ? <><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.videoFormat} onChange={props.setVideoFormat} options={[...videoOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><Select label="视频尺寸" value={props.videoSize} onChange={props.setVideoSize} options={[...videoSizeOptions]} /><MediaAdvancedControls {...props} /></> : null}{props.batchMode === "audio-convert" ? <><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.audioFormat} onChange={props.setAudioFormat} options={[...audioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></> : null}{props.batchMode === "video-audio" ? <><MediaCapabilityBox report={props.mediaReport} /><Select label="输出格式" value={props.extractedAudioFormat} onChange={props.setExtractedAudioFormat} options={[...extractedAudioOutputFormats]} /><Quality value={props.mediaQuality} onChange={props.setMediaQuality} /><MediaAdvancedControls {...props} /></> : null}</Panel>;
  return <Panel title="下载离线版" note="离线版用于敏感文件、大文件和无网络环境。"><a className="btn-primary" href="/download">打开下载页</a></Panel>;
}

function Panel({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <div className="space-y-4"><div><h2 className="text-xl font-semibold text-slate-50">{title}</h2><p className="control-panel-note mt-1 text-sm leading-6 text-slate-400">{note}</p></div>{children}</div>;
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
function MediaCapabilityBox({ report }: { report: MediaCapabilityReport }) { return <div className="rounded-sm border border-cyan-300/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-300"><p className="font-semibold text-slate-50">可用性检查</p><p>视频输出：{report.videoFormats.join(", ") || "不可用"}</p><p>音频输出：{report.audioFormats.join(", ") || "不可用"}</p><p>提取音频：{report.extractedAudioFormats.join(", ") || "不可用"}</p><p>视频尺寸：{report.videoSizes.join(", ") || "不可用"}</p><p>音频码率：{report.audioBitrates.join(", ") || "不可用"}</p>{report.warnings.map((warning) => <p className="text-orange-300" key={warning}>{warning}</p>)}</div>; }

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

function getBatchModeForTab(tabId: TabId): BatchMode | undefined {
  switch (tabId) {
    case "resize": return "resize";
    case "watermark": return "watermark";
    case "compress": return "compress";
    case "pdf-images": return "pdf-images";
    case "word-images": return "word-images";
    case "excel-images": return "excel-images";
    case "video-convert": return "video-convert";
    case "audio-convert": return "audio-convert";
    case "video-audio": return "video-audio";
    default: return undefined;
  }
}

function isRunnableBatchStatus(status: BatchTaskStatus) {
  return status === "queued" || status === "failed" || status === "cancelled";
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
  resizeFormat: ExportImageFormat;
  pdfImageFormat: PdfOutputFormat;
  watermarkFormat: ExportImageFormat;
  officeImageFormat: ExportImageFormat;
  videoFormat: VideoOutputFormat;
  audioFormat: AudioOutputFormat;
  extractedAudioFormat: ExtractedAudioOutputFormat;
}) {
  if (mode === "resize") return formats.resizeFormat.toUpperCase();
  if (mode === "compress") return formats.compressFormat.toUpperCase();
  if (mode === "watermark") return formats.watermarkFormat.toUpperCase();
  if (mode === "pdf-images") return formats.pdfImageFormat.toUpperCase();
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

