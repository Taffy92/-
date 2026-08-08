"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ComponentType } from "react";
import {
  ChevronRight,
  FileImage,
  FilePlus2,
  HardDrive,
  HeartHandshake,
  Loader2,
  Play,
  ShieldCheck,
  Square,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PdfPageNumberPosition, PdfWatermarkPosition } from "@doctool/pdf-core";
import type { AudioOutputFormat, VideoOutputFormat } from "@doctool/media-core";
import type { OcrLanguage } from "@doctool/ocr-core";
import type { ExportImageFormat } from "@doctool/shared";
import { isDesktopApp } from "@/config/appMode";
import { currentReleaseVersion } from "@/config/version";
import { MatrixLogo } from "@/components/layout/MatrixLogo";
import { SupportDialog } from "@/components/support/SupportDialog";
import { LocalFilePreviewGrid, LocalMetadataView, LocalOutputList } from "@/components/tools/LocalFilePreviewGrid";
import { LocalToolControls } from "@/components/tools/LocalToolControls";
import { UnifiedDesktopSidebar, UnifiedToolDialog } from "@/components/tools/UnifiedToolCatalog";
import { useLocalToolController } from "@/components/tools/useLocalToolController";
import type { LocalToolId } from "@/components/tools/useLocalToolController";
import { getUnifiedToolCategory, getUnifiedToolHref } from "@/config/toolCatalog";
import type { UnifiedToolItem } from "@/config/toolCatalog";
import { formatDesktopLicenseLabel } from "@/lib/desktopLicense";
import type { DesktopLicenseStatus } from "@/lib/desktopLicense";

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
  { id: "ocr", group: "OCR 工具", label: "图片 / PDF 文字识别", description: "中文、英文、中英混合，导出可编辑 Word" }
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
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get("tool");
  const initialTool = tools.some((item) => item.id === requestedTool)
    ? requestedTool as LocalToolId
    : "image-convert";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tool, setTool] = useState<LocalToolId>(initialTool);
  const [supportOpen, setSupportOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [desktopLicenseStatus, setDesktopLicenseStatus] = useState<DesktopLicenseStatus | null>(null);
  const [desktopLicenseGate, setDesktopLicenseGate] = useState<DesktopLicenseGateComponent | null>(null);
  const [isToolSwitching, startToolTransition] = useTransition();

  useEffect(() => {
    if (tools.some((item) => item.id === requestedTool)) setTool(requestedTool as LocalToolId);
  }, [requestedTool]);

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
  const [ocrExport, setOcrExport] = useState<"editable-word">("editable-word");

  const localToolController = useLocalToolController({
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
    onDesktopLicenseStatusChange: setDesktopLicenseStatus
  });
  const {
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
    selectOutputFolder,
    run,
    cancel,
    clear
  } = localToolController;

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
  function selectDesktopTool(nextTool: UnifiedToolItem) {
    if (!desktop || nextTool.route !== "local-tools" || !tools.some((item) => item.id === nextTool.id)) return false;
    startToolTransition(() => {
      resetToolState();
      setTool(nextTool.id as LocalToolId);
    });
    window.history.pushState({}, "", getUnifiedToolHref(nextTool));
    return true;
  }

  const toolControls = (
    <LocalToolControls
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
                <LocalFilePreviewGrid
                  files={files}
                  desktop
                  multiple={multiple}
                  onPickFile={() => inputRef.current?.click()}
                  onFilesChange={setFiles}
                />
                {metadata ? <LocalMetadataView metadata={metadata} /> : null}
                <LocalOutputList outputs={outputs} />
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
            <span>本地授权：{formatDesktopLicenseLabel(desktopLicenseStatus)}</span>
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
              <LocalFilePreviewGrid
                files={files}
                desktop={false}
                multiple={multiple}
                onPickFile={() => inputRef.current?.click()}
                onFilesChange={setFiles}
              />
              {metadata ? <LocalMetadataView metadata={metadata} /> : null}
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
              <LocalOutputList outputs={outputs} />
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
