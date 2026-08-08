"use client";

import type { ReactNode } from "react";
import type { AudioOutputFormat, VideoOutputFormat } from "@doctool/media-core";
import type { OcrLanguage } from "@doctool/ocr-core";
import type { PdfPageNumberPosition, PdfWatermarkPosition } from "@doctool/pdf-core";
import { imageAccept } from "@doctool/shared";
import type { ExportImageFormat } from "@doctool/shared";
import type { LocalToolId } from "@/components/tools/useLocalToolController";

export type LocalToolControlsProps = {
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
  ocrExport: "editable-word"; setOcrExport: (value: "editable-word") => void;
  desktop: boolean;
};

export function LocalToolControls(props: LocalToolControlsProps) {
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
      <p className="text-xs leading-6 text-slate-500">识别结果只导出为可编辑 Word，并按识别到的文字坐标生成文本框；复杂表格、公式和多栏仍可能需要微调。</p>
    </>
  );
  return <p className="text-sm leading-6 text-slate-500">该工具无需额外参数，结果按文件列表顺序生成。</p>;
}

function TimeFields(props: Pick<LocalToolControlsProps, "startTime" | "setStartTime" | "endTime" | "setEndTime" | "mediaDuration">) {
  return (
    <>
      <NumberField label="开始时间（秒）" value={props.startTime} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setStartTime} />
      <NumberField label="结束时间（秒）" value={props.endTime} min={0} max={props.mediaDuration || undefined} step={0.1} onChange={props.setEndTime} />
      {props.mediaDuration ? <p className="text-xs text-slate-500">媒体总时长：{props.mediaDuration.toFixed(2)} 秒</p> : null}
    </>
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
