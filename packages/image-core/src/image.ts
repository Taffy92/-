import imageCompression from "browser-image-compression";
import { outputImageMime } from "@doctool/shared";
import type { ExportImageFormat, ImageMime, ProgressReporter } from "@doctool/shared";

export interface ResizeOptions {
  width: number;
  height: number;
  format: ExportImageFormat;
  quality: number;
}

export interface TextWatermarkOptions {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  bold: boolean;
  rotate: number;
  position: WatermarkPosition;
}

export interface ImageWatermarkOptions {
  watermark: File;
  scale: number;
  opacity: number;
  rotate: number;
  position: WatermarkPosition;
}

export type WatermarkPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tile" | "custom";

export interface CustomPosition {
  x: number;
  y: number;
}

export interface CompressOptions {
  quality: number;
  targetSizeBytes?: number;
  maxWidthOrHeight?: number;
  keepOriginalSize?: boolean;
  format?: ExportImageFormat;
  onProgress?: ProgressReporter;
}

const imageCompressionWorkerPath = "/vendor/browser-image-compression/browser-image-compression.js";

export async function loadImageElement(fileOrBlob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(fileOrBlob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function imageFileToCanvas(file: Blob): Promise<HTMLCanvasElement> {
  const image = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");
  ctx.drawImage(image, 0, 0);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: ImageMime, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("图片导出失败，请更换导出格式后重试。"));
    }, mime, quality);
  });
}

export async function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  const source = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(options.width));
  canvas.height = Math.max(1, Math.round(options.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, outputImageMime(options.format), options.quality);
}

export async function addTextWatermark(file: File, options: TextWatermarkOptions, format: ExportImageFormat, quality: number, custom?: CustomPosition): Promise<Blob> {
  const canvas = await imageFileToCanvas(file);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");
  ctx.save();
  ctx.globalAlpha = clamp(options.opacity, 0, 1);
  ctx.fillStyle = options.color;
  ctx.font = `${options.bold ? "700" : "400"} ${options.fontSize}px sans-serif`;
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(options.text || "水印");
  const box = { width: metrics.width, height: options.fontSize * 1.25 };
  const drawOne = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x + box.width / 2, y + box.height / 2);
    ctx.rotate((options.rotate * Math.PI) / 180);
    ctx.fillText(options.text || "水印", -box.width / 2, 0);
    ctx.restore();
  };
  if (options.position === "tile") {
    const gapX = Math.max(160, box.width + 80);
    const gapY = Math.max(120, box.height + 70);
    for (let y = -gapY; y < canvas.height + gapY; y += gapY) {
      for (let x = -gapX; x < canvas.width + gapX; x += gapX) drawOne(x, y);
    }
  } else {
    const point = resolvePosition(canvas.width, canvas.height, box.width, box.height, options.position, custom);
    drawOne(point.x, point.y);
  }
  ctx.restore();
  return canvasToBlob(canvas, outputImageMime(format), quality);
}

export async function addImageWatermark(file: File, options: ImageWatermarkOptions, format: ExportImageFormat, quality: number, custom?: CustomPosition): Promise<Blob> {
  const canvas = await imageFileToCanvas(file);
  const watermark = await loadImageElement(options.watermark);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");
  const width = Math.max(16, canvas.width * clamp(options.scale, 0.03, 1));
  const height = width * (watermark.naturalHeight / watermark.naturalWidth);
  const drawOne = (x: number, y: number) => {
    ctx.save();
    ctx.globalAlpha = clamp(options.opacity, 0, 1);
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((options.rotate * Math.PI) / 180);
    ctx.drawImage(watermark, -width / 2, -height / 2, width, height);
    ctx.restore();
  };
  if (options.position === "tile") {
    const gapX = width + 80;
    const gapY = height + 70;
    for (let y = -gapY; y < canvas.height + gapY; y += gapY) {
      for (let x = -gapX; x < canvas.width + gapX; x += gapX) drawOne(x, y);
    }
  } else {
    const point = resolvePosition(canvas.width, canvas.height, width, height, options.position, custom);
    drawOne(point.x, point.y);
  }
  return canvasToBlob(canvas, outputImageMime(format), quality);
}

export async function compressImage(file: File, options: CompressOptions): Promise<Blob> {
  const quality = clamp(options.quality / 100, 0.1, 1);
  const targetMb = options.targetSizeBytes ? options.targetSizeBytes / 1024 / 1024 : undefined;
  const compressed = await imageCompression(file, {
    useWebWorker: true,
    libURL: resolveImageCompressionWorkerUrl(),
    initialQuality: quality,
    maxSizeMB: targetMb,
    maxWidthOrHeight: options.keepOriginalSize ? undefined : options.maxWidthOrHeight,
    fileType: options.format ? outputImageMime(options.format) : undefined,
    onProgress: (value) => options.onProgress?.(value / 100, "正在压缩图片")
  });
  return compressed;
}

function resolveImageCompressionWorkerUrl(): string {
  if (typeof window === "undefined") return imageCompressionWorkerPath;
  return new URL(imageCompressionWorkerPath, window.location.href).toString();
}

function resolvePosition(containerWidth: number, containerHeight: number, width: number, height: number, position: WatermarkPosition, custom?: CustomPosition) {
  const margin = Math.max(20, Math.round(Math.min(containerWidth, containerHeight) * 0.04));
  const map: Record<Exclude<WatermarkPosition, "tile" | "custom">, { x: number; y: number }> = {
    "top-left": { x: margin, y: margin },
    "top-right": { x: containerWidth - width - margin, y: margin },
    "bottom-left": { x: margin, y: containerHeight - height - margin },
    "bottom-right": { x: containerWidth - width - margin, y: containerHeight - height - margin },
    center: { x: (containerWidth - width) / 2, y: (containerHeight - height) / 2 }
  };
  if (position === "custom") return custom || map.center;
  if (position === "tile") return { x: margin, y: margin };
  return map[position];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
