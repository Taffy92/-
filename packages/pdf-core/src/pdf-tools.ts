import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts
} from "pdf-lib";
import type {
  PDFImage,
  PDFFont,
  PDFPage
} from "pdf-lib";

export type ImagePdfPageMode = "image-size" | "a4";
export type PdfWatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type PdfPageNumberPosition = "bottom-left" | "bottom-center" | "bottom-right";

export interface ImagesToPdfOptions {
  pageMode: ImagePdfPageMode;
  margin?: number;
}

export interface RearrangePdfOptions {
  pageOrder: number[];
  rotations?: Record<number, 0 | 90 | 180 | 270>;
}

export interface TextPdfWatermark {
  kind: "text";
  text: string;
  opacity: number;
  size: number;
  color: string;
  rotation: number;
  position: PdfWatermarkPosition;
}

export interface ImagePdfWatermark {
  kind: "image";
  image: File;
  opacity: number;
  scale: number;
  rotation: number;
  position: PdfWatermarkPosition;
}

export interface DecoratePdfOptions {
  pages: number[];
  watermark?: TextPdfWatermark | ImagePdfWatermark;
  pageNumber?: {
    position: PdfPageNumberPosition;
    startAt: number;
  };
  header?: string;
  footer?: string;
}

const a4Size = { width: 595.28, height: 841.89 };

export async function imagesToPdf(files: File[], options: ImagesToPdfOptions): Promise<Blob> {
  if (!files.length) throw new Error("请至少选择一张图片。");
  const document = await PDFDocument.create();
  const margin = Math.max(0, options.margin ?? 24);

  for (const file of files) {
    const image = await embedImageFile(document, file);
    const natural = image.scale(1);
    const pageSize = options.pageMode === "a4"
      ? a4Size
      : { width: Math.max(1, natural.width), height: Math.max(1, natural.height) };
    const page = document.addPage([pageSize.width, pageSize.height]);
    const bounds = fitRect(
      natural.width,
      natural.height,
      Math.max(1, pageSize.width - margin * 2),
      Math.max(1, pageSize.height - margin * 2)
    );
    page.drawImage(image, {
      x: (pageSize.width - bounds.width) / 2,
      y: (pageSize.height - bounds.height) / 2,
      width: bounds.width,
      height: bounds.height
    });
  }

  return pdfBlob(await document.save());
}

export async function mergePdfFiles(files: File[]): Promise<Blob> {
  if (files.length < 2) throw new Error("PDF 合并至少需要两个文件。");
  const output = await PDFDocument.create();
  for (const file of files) {
    const source = await loadEditablePdf(file);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return pdfBlob(await output.save());
}

export async function extractPdfPages(file: File, pages: number[]): Promise<Blob> {
  const source = await loadEditablePdf(file);
  const indices = validatePageNumbers(pages, source.getPageCount());
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, indices.map((page) => page - 1));
  copied.forEach((page) => output.addPage(page));
  return pdfBlob(await output.save());
}

export async function splitPdfPages(
  file: File,
  pages?: number[]
): Promise<Array<{ pageNumber: number; blob: Blob }>> {
  const source = await loadEditablePdf(file);
  const selected = validatePageNumbers(
    pages?.length ? pages : Array.from({ length: source.getPageCount() }, (_, index) => index + 1),
    source.getPageCount()
  );
  const results: Array<{ pageNumber: number; blob: Blob }> = [];

  for (const pageNumber of selected) {
    const output = await PDFDocument.create();
    const [page] = await output.copyPages(source, [pageNumber - 1]);
    output.addPage(page);
    results.push({ pageNumber, blob: pdfBlob(await output.save()) });
  }
  return results;
}

export async function rearrangePdfPages(file: File, options: RearrangePdfOptions): Promise<Blob> {
  const source = await loadEditablePdf(file);
  const pageOrder = validatePageNumbers(options.pageOrder, source.getPageCount());
  if (new Set(pageOrder).size !== pageOrder.length) {
    throw new Error("页面顺序不能包含重复页码。");
  }
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, pageOrder.map((page) => page - 1));
  copied.forEach((page, index) => {
    const sourcePageNumber = pageOrder[index];
    const extraRotation = options.rotations?.[sourcePageNumber] || 0;
    if (extraRotation) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(normalizeRotation(currentRotation + extraRotation)));
    }
    output.addPage(page);
  });
  return pdfBlob(await output.save());
}

export async function decoratePdf(file: File, options: DecoratePdfOptions): Promise<Blob> {
  const document = await loadEditablePdf(file);
  const selected = new Set(validatePageNumbers(options.pages, document.getPageCount()));
  const font = await document.embedFont(StandardFonts.Helvetica);
  const imageWatermark = options.watermark?.kind === "image"
    ? await embedImageFile(document, options.watermark.image)
    : undefined;

  for (const [index, page] of document.getPages().entries()) {
    const pageNumber = index + 1;
    if (!selected.has(pageNumber)) continue;

    if (options.watermark?.kind === "text" && options.watermark.text.trim()) {
      await drawTextOverlay(document, page, font, options.watermark.text.trim(), {
        size: Math.max(6, options.watermark.size),
        color: parseHexColor(options.watermark.color),
        opacity: clamp(options.watermark.opacity, 0.05, 1),
        rotation: options.watermark.rotation,
        position: options.watermark.position
      });
    } else if (options.watermark?.kind === "image" && imageWatermark) {
      drawImageOverlay(page, imageWatermark, options.watermark);
    }

    if (options.pageNumber) {
      const label = String(options.pageNumber.startAt + index);
      drawLineText(page, font, label, 10, options.pageNumber.position, "bottom");
    }
    if (options.header?.trim()) {
      await drawEdgeText(document, page, font, options.header.trim(), "header");
    }
    if (options.footer?.trim()) {
      await drawEdgeText(document, page, font, options.footer.trim(), "footer");
    }
  }

  return pdfBlob(await document.save());
}

async function loadEditablePdf(file: File): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await readBlobBytes(file), { ignoreEncryption: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/encrypt|password/i.test(message)) {
      throw new Error(`${file.name} 已加密，不能绕过密码保护。`);
    }
    throw new Error(`${file.name} 无法解析，文件可能损坏或格式不受支持。`);
  }
}

async function embedImageFile(document: PDFDocument, file: File): Promise<PDFImage> {
  const bytes = await readBlobBytes(file);
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return document.embedPng(bytes);
  }
  if (/image\/jpe?g/i.test(file.type) || /\.jpe?g$/i.test(file.name)) {
    return document.embedJpg(bytes);
  }
  const png = await convertBrowserImageToPng(file);
  return document.embedPng(png);
}

async function convertBrowserImageToPng(file: File): Promise<Uint8Array> {
  if (typeof document === "undefined" || typeof Image === "undefined") {
    throw new Error(`${file.name} 需要在浏览器或离线桌面界面中转换为 PDF。`);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("当前环境不支持图片画布。");
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("图片转 PNG 失败。")), "image/png");
    });
    return readBlobBytes(blob);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function drawTextOverlay(
  document: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  text: string,
  options: {
    size: number;
    color: ReturnType<typeof rgb>;
    opacity: number;
    rotation: number;
    position: PdfWatermarkPosition;
  }
) {
  if (isWinAnsiText(text)) {
    const width = font.widthOfTextAtSize(text, options.size);
    const point = overlayPosition(page, width, options.size, options.position);
    page.drawText(text, {
      x: point.x,
      y: point.y,
      size: options.size,
      font,
      color: options.color,
      opacity: options.opacity,
      rotate: degrees(options.rotation)
    });
    return;
  }

  const rendered = await renderTextImage(text, options.size, options.color);
  const image = await document.embedPng(rendered.bytes);
  const point = overlayPosition(page, rendered.width, rendered.height, options.position);
  page.drawImage(image, {
    x: point.x,
    y: point.y,
    width: rendered.width,
    height: rendered.height,
    opacity: options.opacity,
    rotate: degrees(options.rotation)
  });
}

function drawImageOverlay(page: PDFPage, image: PDFImage, options: ImagePdfWatermark) {
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const natural = image.scale(1);
  const width = Math.min(pageWidth * clamp(options.scale, 0.05, 0.9), natural.width);
  const height = width * (natural.height / natural.width);
  const point = overlayPosition(page, width, height, options.position);
  page.drawImage(image, {
    x: point.x,
    y: point.y,
    width,
    height,
    opacity: clamp(options.opacity, 0.05, 1),
    rotate: degrees(options.rotation)
  });
}

async function drawEdgeText(
  document: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  text: string,
  edge: "header" | "footer"
) {
  if (isWinAnsiText(text)) {
    drawLineText(page, font, text, 10, "bottom-center", edge === "header" ? "top" : "bottom");
    return;
  }
  const rendered = await renderTextImage(text, 10, rgb(0.2, 0.25, 0.3));
  const image = await document.embedPng(rendered.bytes);
  const { width, height } = page.getSize();
  page.drawImage(image, {
    x: (width - rendered.width) / 2,
    y: edge === "header" ? height - rendered.height - 18 : 18,
    width: rendered.width,
    height: rendered.height
  });
}

function drawLineText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  size: number,
  position: PdfPageNumberPosition,
  edge: "top" | "bottom"
) {
  const { width, height } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = position === "bottom-left"
    ? 24
    : position === "bottom-right"
      ? width - textWidth - 24
      : (width - textWidth) / 2;
  page.drawText(text, {
    x,
    y: edge === "top" ? height - size - 18 : 18,
    size,
    font,
    color: rgb(0.2, 0.25, 0.3)
  });
}

async function renderTextImage(
  text: string,
  size: number,
  color: ReturnType<typeof rgb>
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  if (typeof document === "undefined") throw new Error("当前环境无法渲染中文 PDF 文字。");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前环境不支持文字画布。");
  context.font = `600 ${size}px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
  const width = Math.max(1, Math.ceil(context.measureText(text).width + size));
  const height = Math.max(1, Math.ceil(size * 1.6));
  canvas.width = width;
  canvas.height = height;
  const drawContext = canvas.getContext("2d");
  if (!drawContext) throw new Error("当前环境不支持文字画布。");
  drawContext.font = `600 ${size}px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`;
  drawContext.textBaseline = "middle";
  drawContext.fillStyle = `rgb(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)})`;
  drawContext.fillText(text, size / 2, height / 2);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PDF 文字图层生成失败。")), "image/png");
  });
  return { bytes: await readBlobBytes(blob), width, height };
}

function validatePageNumbers(pages: number[], totalPages: number): number[] {
  if (!pages.length) throw new Error("请至少选择一个 PDF 页面。");
  for (const page of pages) {
    if (!Number.isInteger(page) || page < 1 || page > totalPages) {
      throw new Error(`页码 ${page} 超出有效范围 1-${totalPages}。`);
    }
  }
  return [...pages];
}

function overlayPosition(page: PDFPage, width: number, height: number, position: PdfWatermarkPosition) {
  const pageSize = page.getSize();
  const margin = 28;
  const map: Record<PdfWatermarkPosition, { x: number; y: number }> = {
    center: { x: (pageSize.width - width) / 2, y: (pageSize.height - height) / 2 },
    "top-left": { x: margin, y: pageSize.height - height - margin },
    "top-right": { x: pageSize.width - width - margin, y: pageSize.height - height - margin },
    "bottom-left": { x: margin, y: margin },
    "bottom-right": { x: pageSize.width - width - margin, y: margin }
  };
  return map[position];
}

function fitRect(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return { width: width * scale, height: height * scale };
}

function parseHexColor(value: string) {
  const normalized = value.trim().replace(/^#/, "");
  const match = normalized.match(/^[0-9a-f]{6}$/i);
  if (!match) return rgb(0.39, 0.45, 0.55);
  return rgb(
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255
  );
}

function normalizeRotation(value: number): 0 | 90 | 180 | 270 {
  const normalized = ((value % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) return normalized;
  return 0;
}

function isWinAnsiText(value: string) {
  return /^[\x20-\x7E\r\n\t]*$/.test(value);
}

function pdfBlob(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function readBlobBytes(blob: Blob): Promise<Uint8Array> {
  const modernBlob = blob as Blob & { arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof modernBlob.arrayBuffer === "function") {
    return new Uint8Array(await modernBlob.arrayBuffer());
  }
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("读取本地文件失败。"));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("读取本地文件失败。"));
    };
    reader.readAsArrayBuffer(blob);
  });
  return new Uint8Array(buffer);
}
