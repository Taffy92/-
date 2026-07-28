import exifr from "exifr";
import { outputImageMime } from "@doctool/shared";
import type { ExportImageFormat } from "@doctool/shared";
import { canvasToBlob, imageFileToCanvas, loadImageElement } from "./image";

export interface ImageExportOptions {
  format: ExportImageFormat;
  quality: number;
}

export interface ImageTransformOptions extends ImageExportOptions {
  rotation: 0 | 90 | 180 | 270;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface ImageTransformResult {
  blob: Blob;
  width: number;
  height: number;
}

export interface ImageMetadataSummary {
  capturedAt?: string;
  camera?: string;
  software?: string;
  gps?: string;
  orientation?: string;
  dimensions: string;
}

type ExifRecord = Record<string, unknown>;

const orientationLabels: Record<number, string> = {
  1: "正常",
  2: "水平翻转",
  3: "旋转 180°",
  4: "垂直翻转",
  5: "左转 90°并水平翻转",
  6: "右转 90°",
  7: "右转 90°并水平翻转",
  8: "左转 90°"
};

export async function convertImage(file: File, options: ImageExportOptions): Promise<Blob> {
  const canvas = await imageFileToCanvas(file);
  return canvasToBlob(canvas, outputImageMime(options.format), options.quality);
}

export async function transformImage(file: File, options: ImageTransformOptions): Promise<ImageTransformResult> {
  const source = await loadImageElement(file);
  const swapsDimensions = options.rotation === 90 || options.rotation === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swapsDimensions ? source.naturalHeight : source.naturalWidth;
  canvas.height = swapsDimensions ? source.naturalWidth : source.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器不支持 Canvas。");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((options.rotation * Math.PI) / 180);
  context.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  context.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);

  return {
    blob: await canvasToBlob(canvas, outputImageMime(options.format), options.quality),
    width: canvas.width,
    height: canvas.height
  };
}

export async function readImageMetadata(file: File): Promise<ImageMetadataSummary> {
  const [rawMetadata, image] = await Promise.all([
    exifr.parse(file, {
      pick: [
        "DateTimeOriginal",
        "CreateDate",
        "Make",
        "Model",
        "Software",
        "latitude",
        "longitude",
        "GPSLatitude",
        "GPSLongitude",
        "Orientation",
        "ExifImageWidth",
        "ExifImageHeight",
        "ImageWidth",
        "ImageHeight"
      ]
    }),
    loadImageElement(file)
  ]);

  return normalizeExifMetadata(
    isRecord(rawMetadata) ? rawMetadata : {},
    { width: image.naturalWidth, height: image.naturalHeight }
  );
}

export function normalizeExifMetadata(
  raw: ExifRecord,
  fallbackDimensions: { width: number; height: number }
): ImageMetadataSummary {
  const make = stringValue(raw.Make);
  const model = stringValue(raw.Model);
  const latitude = numberValue(raw.latitude) ?? coordinateValue(raw.GPSLatitude);
  const longitude = numberValue(raw.longitude) ?? coordinateValue(raw.GPSLongitude);
  const orientation = numberValue(raw.Orientation);
  const width = numberValue(raw.ExifImageWidth) ?? numberValue(raw.ImageWidth) ?? fallbackDimensions.width;
  const height = numberValue(raw.ExifImageHeight) ?? numberValue(raw.ImageHeight) ?? fallbackDimensions.height;
  const capturedAt = dateValue(raw.DateTimeOriginal) ?? dateValue(raw.CreateDate);

  return compactObject({
    capturedAt,
    camera: [make, model].filter(Boolean).join(" ") || undefined,
    software: stringValue(raw.Software),
    gps: latitude !== undefined && longitude !== undefined
      ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      : undefined,
    orientation: orientation !== undefined
      ? `${orientation}（${orientationLabels[orientation] || "未知方向"}）`
      : undefined,
    dimensions: `${Math.max(1, Math.round(width))} × ${Math.max(1, Math.round(height))}`
  });
}

export async function stripImageMetadata(file: File, options: ImageExportOptions): Promise<Blob> {
  // Browser image decoding applies the visual orientation. Re-encoding the decoded
  // pixels creates a clean image without carrying EXIF/GPS/application segments.
  return convertImage(file, options);
}

function compactObject(value: ImageMetadataSummary): ImageMetadataSummary {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== "")
  ) as ImageMetadataSummary;
}

function isRecord(value: unknown): value is ExifRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function coordinateValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const parts = value.slice(0, 3).map(numberValue);
  if (parts.some((part) => part === undefined)) return undefined;
  return (parts[0] as number) + (parts[1] as number) / 60 + (parts[2] as number) / 3600;
}

function dateValue(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}
