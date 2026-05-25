import type { ExportImageFormat, ImageMime } from "./types";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

export function safeBaseName(fileName: string): string {
  const name = fileName.replace(/\.[^.]+$/, "");
  return (name || "original").replace(/[^\w\u4e00-\u9fa5-]+/g, "_").replace(/_+/g, "_");
}

export function outputImageMime(format: ExportImageFormat): ImageMime {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  return "image/jpeg";
}

export function outputImageExtension(format: ExportImageFormat): string {
  return format === "jpg" ? "jpg" : format;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function isImageFile(file: File): boolean {
  return /^image\/(jpeg|png|webp|bmp)$/i.test(file.type) || /\.(jpe?g|png|webp|bmp)$/i.test(file.name);
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function isWordFile(file: File): boolean {
  return file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || /\.docx$/i.test(file.name);
}

export function isExcelFile(file: File): boolean {
  if (/\.(xlsx|csv)$/i.test(file.name)) return true;
  return (/spreadsheetml|csv/i.test(file.type) && !/\.xls$/i.test(file.name));
}

export function isVideoFile(file: File): boolean {
  return /^video\//i.test(file.type) || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);
}

export function isAudioFile(file: File): boolean {
  return /^audio\//i.test(file.type) || /\.(mp3|wav|aac|m4a|flac)$/i.test(file.name);
}

export function fileNameWithSuffix(fileName: string, suffix: string, extension: string): string {
  return `${safeBaseName(fileName)}_${suffix}.${extension}`;
}
