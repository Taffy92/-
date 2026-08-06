import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  Textbox
} from "docx";
import type { UniversalMeasure } from "docx";
import { createWorker, OEM } from "tesseract.js";
import {
  extractPdfTextPages,
  getPdfPageCount,
  renderPdfPageToBlob
} from "@doctool/pdf-core";
import type { ProgressReporter } from "@doctool/shared";

export type OcrLanguage = "chi_sim" | "eng" | "chi_sim+eng";
export type OcrPageSource = "text" | "ocr";

export interface OcrPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  source: OcrPageSource;
  image?: Blob;
  width?: number;
  height?: number;
  layout?: OcrTextBox[];
}

export interface OcrTextBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
  fontFamily?: string;
}

export interface OcrDocumentResult {
  fileName: string;
  pages: OcrPageResult[];
  lowConfidencePages: number[];
}

export interface RecognizeDocumentOptions {
  language: OcrLanguage;
  includePageImages?: boolean;
  onProgress?: ProgressReporter;
  signal?: AbortSignal;
}

export function buildOcrAssetUrls() {
  return {
    workerPath: "/ocr/worker.min.js",
    corePath: "/ocr/core/",
    langPath: "/ocr/lang/"
  } as const;
}

export function shouldUseDirectPdfText(text: string) {
  const meaningful = text.replace(/[\s\d.,:;!?()[\]{}\-_/\\|]+/g, "");
  return meaningful.length >= 8 || text.trim().length >= 24;
}

export async function recognizeLocalDocument(
  file: File,
  options: RecognizeDocumentOptions
): Promise<OcrDocumentResult> {
  if (options.signal?.aborted) throw new Error("用户取消识别。");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const pages = isPdf
    ? await recognizePdf(file, options)
    : [await recognizeImagePage(file, 1, 1, options)];
  return {
    fileName: file.name,
    pages,
    lowConfidencePages: pages
      .filter((page) => page.source === "ocr" && page.confidence < 70)
      .map((page) => page.pageNumber)
  };
}

export function formatOcrText(pages: OcrPageResult[]) {
  return pages
    .map((page) => `===== 第 ${page.pageNumber} 页 =====\n${page.text.trim()}`)
    .join("\n\n")
    .trim();
}

export function createOcrTextBlob(pages: OcrPageResult[]) {
  return new Blob([`\uFEFF${formatOcrText(pages)}`], { type: "text/plain;charset=utf-8" });
}

export async function exportEditableOcrWord(pages: OcrPageResult[]) {
  return exportEditableOcrWordWithLayout(pages);
  if (!pages.length) throw new Error("没有可导出的 OCR 页面。");
  const document = new Document({
    creator: "万能格式转换器",
    description: "本地 OCR 可编辑文字导出",
    sections: pages.map((page) => ({
      properties: {},
      children: [
        new Paragraph({
          heading: "Heading1",
          children: [new TextRun(`第 ${page.pageNumber} 页`)]
        }),
        ...paragraphsFromText(page.text)
      ]
    }))
  });
  return Packer.toBlob(document);
}

async function exportEditableOcrWordWithLayout(pages: OcrPageResult[]) {
  if (!pages.length) throw new Error("No OCR pages to export.");
  const document = new Document({
    creator: "Universal Format Converter",
    description: "Editable local OCR export",
    sections: pages.map((page) => createEditableOcrSection(page))
  });
  return Packer.toBlob(document);
}

function createEditableOcrSection(page: OcrPageResult) {
  const layout = normalizeOcrLayout(page);
  if (!layout.length) {
    return { properties: {}, children: paragraphsFromText(page.text) };
  }

  const sourceWidth = Math.max(1, page.width || Math.max(...layout.map((box) => box.x + box.width)));
  const sourceHeight = Math.max(1, page.height || Math.max(...layout.map((box) => box.y + box.height)));
  const scale = Math.min(1, 794 / sourceWidth, 1123 / sourceHeight);
  const pageWidth = Math.max(1, Math.round(sourceWidth * scale));
  const pageHeight = Math.max(1, Math.round(sourceHeight * scale));

  return {
    properties: {
      page: {
        size: { width: pageWidth * 15, height: pageHeight * 15 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      }
    },
    children: layout.map((box) => new Textbox({
      children: [new TextRun({
        text: box.text,
        font: box.fontFamily || "Microsoft YaHei",
        size: Math.max(12, Math.round(Math.min(24, box.height * scale) * 1.5))
      })],
      style: {
        width: pixelsToInches(box.width * scale),
        height: pixelsToInches(box.height * scale),
        left: pixelsToInches(box.x * scale),
        top: pixelsToInches(box.y * scale),
        position: "absolute",
        positionHorizontal: "absolute",
        positionHorizontalRelative: "page",
        positionVertical: "absolute",
        positionVerticalRelative: "page",
        wrapStyle: "none",
        zIndex: 1
      }
    }))
  };
}

function pixelsToInches(pixels: number): UniversalMeasure {
  return `${Math.max(0, pixels / 96).toFixed(3)}in` as UniversalMeasure;
}

function normalizeOcrLayout(page: OcrPageResult): OcrTextBox[] {
  return (page.layout || [])
    .map((box) => ({
      ...box,
      text: box.text.trim(),
      x: Math.max(0, box.x),
      y: Math.max(0, box.y),
      width: Math.max(1, box.width),
      height: Math.max(1, box.height)
    }))
    .filter((box) => box.text.length > 0);
}

export async function exportImageOcrWord(pages: OcrPageResult[]) {
  if (!pages.length || pages.some((page) => !page.image)) {
    throw new Error("原样 Word 导出需要保留每一页的原始图像。");
  }
  const sections = [];
  for (const page of pages) {
    const source = page.image as Blob;
    const normalized = await normalizeDocxImage(source);
    const size = await readImageDimensions(normalized.blob);
    const fitted = fitWithin(size.width, size.height, 720, 980);
    sections.push({
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              type: normalized.type,
              data: await readBlobBytes(normalized.blob),
              transformation: fitted,
              altText: {
                title: `第 ${page.pageNumber} 页`,
                description: "OCR 原页面图像",
                name: `page-${page.pageNumber}`
              }
            })
          ]
        })
      ]
    });
  }
  const document = new Document({
    creator: "万能格式转换器",
    description: "本地 OCR 原样页面导出",
    sections
  });
  return Packer.toBlob(document);
}

async function recognizePdf(file: File, options: RecognizeDocumentOptions) {
  const [textPages, pageCount] = await Promise.all([
    extractPdfTextPages(file),
    getPdfPageCount(file)
  ]);
  const results: OcrPageResult[] = [];
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;

  const ensureWorker = async () => {
    if (worker) return worker;
    const assets = buildOcrAssetUrls();
    worker = await createWorker(options.language, OEM.LSTM_ONLY, {
      ...assets,
      cacheMethod: "none",
      gzip: true,
      workerBlobURL: false,
      logger: (message) => {
        const pageProgress = clampProgress(message.progress);
        options.onProgress?.(
          (results.length + pageProgress) / pageCount,
          translateOcrStatus(message.status, results.length + 1, pageCount)
        );
      }
    });
    return worker;
  };

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      ensureNotAborted(options.signal);
      const textPage = textPages[pageNumber - 1];
      const includeImage = options.includePageImages || !shouldUseDirectPdfText(textPage?.text || "");
      const pageImage = includeImage
        ? await renderPdfPageToBlob(file, pageNumber, "png", 2)
        : undefined;
      if (shouldUseDirectPdfText(textPage?.text || "")) {
        results.push({
          pageNumber,
          text: textPage.text,
          confidence: 100,
          source: "text",
          image: options.includePageImages ? pageImage : undefined,
          width: textPage.width,
          height: textPage.height,
          layout: textPage.layout
        });
        options.onProgress?.(pageNumber / pageCount, `已直接提取第 ${pageNumber}/${pageCount} 页文字`);
        continue;
      }
      const activeWorker = await ensureWorker();
      const result = await recognizeWithCancellation(activeWorker, pageImage as Blob, options.signal);
      const dimensions = await readImageDimensions(pageImage as Blob);
      results.push({
        pageNumber,
        text: normalizeRecognizedText(result.data.text),
        confidence: normalizeConfidence(result.data.confidence),
        source: "ocr",
        image: options.includePageImages ? pageImage : undefined,
        width: dimensions.width,
        height: dimensions.height,
        layout: layoutFromTesseractData(result.data)
      });
    }
  } finally {
    await worker?.terminate().catch(() => undefined);
  }
  return results;
}

async function recognizeImagePage(
  file: File,
  pageNumber: number,
  pageCount: number,
  options: RecognizeDocumentOptions
): Promise<OcrPageResult> {
  const assets = buildOcrAssetUrls();
  const worker = await createWorker(options.language, OEM.LSTM_ONLY, {
    ...assets,
    cacheMethod: "none",
    gzip: true,
    workerBlobURL: false,
    logger: (message) => {
      options.onProgress?.(
        clampProgress(message.progress),
        translateOcrStatus(message.status, pageNumber, pageCount)
      );
    }
  });
  try {
    const result = await recognizeWithCancellation(worker, file, options.signal);
    const dimensions = await readImageDimensions(file);
    return {
      pageNumber,
      text: normalizeRecognizedText(result.data.text),
      confidence: normalizeConfidence(result.data.confidence),
      source: "ocr",
      image: options.includePageImages ? file : undefined,
      width: dimensions.width,
      height: dimensions.height,
      layout: layoutFromTesseractData(result.data)
    };
  } finally {
    await worker.terminate().catch(() => undefined);
  }
}

async function recognizeWithCancellation(
  worker: Awaited<ReturnType<typeof createWorker>>,
  image: Blob,
  signal?: AbortSignal
) {
  ensureNotAborted(signal);
  const onAbort = () => {
    void worker.terminate();
  };
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const result = await worker.recognize(image, {}, { text: true, blocks: true });
    ensureNotAborted(signal);
    return result;
  } catch (error) {
    if (signal?.aborted) throw new Error("用户取消识别。");
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}

function paragraphsFromText(text: string) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  return (lines.length ? lines : [""]).map((line) => new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text: line || " ", font: "Microsoft YaHei" })]
  }));
}

function normalizeRecognizedText(text: string) {
  let normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  let previous = "";
  while (normalized !== previous) {
    previous = normalized;
    normalized = normalized
      .replace(/([\u3400-\u9fff])\s+([\u3400-\u9fffA-Za-z0-9])/g, "$1$2")
      .replace(/([A-Za-z0-9])\s+([\u3400-\u9fff])/g, "$1$2")
      .replace(/([\u3400-\u9fff])\s+([，。！？；：、）》】”’…,.!?;:)\]}])/g, "$1$2")
      .replace(/([（《【“‘(\[{])\s+/g, "$1");
  }
  return normalized;
}

function layoutFromTesseractData(data: {
  blocks?: Array<{
    paragraphs: Array<{
      lines: Array<{
        text: string;
        confidence: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
        words: Array<{
          text: string;
          confidence: number;
          font_name: string;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      }>;
    }>;
  }> | null;
}): OcrTextBox[] {
  const layout: OcrTextBox[] = [];
  for (const block of data.blocks || []) {
    for (const paragraph of block.paragraphs || []) {
      for (const line of paragraph.lines || []) {
        const words = (line.words || []).filter((word) => word.text.trim());
        const text = normalizeRecognizedText(line.text || words.map((word) => word.text).join(" "));
        if (!text) continue;
        layout.push({
          text,
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: Math.max(1, line.bbox.x1 - line.bbox.x0),
          height: Math.max(1, line.bbox.y1 - line.bbox.y0),
          confidence: normalizeConfidence(line.confidence),
          fontFamily: resolveOcrFont(words[0]?.font_name)
        });
      }
    }
  }
  return layout;
}

function resolveOcrFont(fontName?: string) {
  const normalized = fontName?.trim();
  if (!normalized || /^(arial|sans[- ]?serif|serif|unknown|font)$/i.test(normalized)) {
    return "Microsoft YaHei";
  }
  return normalized;
}

async function normalizeDocxImage(blob: Blob): Promise<{ blob: Blob; type: "jpg" | "png" | "gif" | "bmp" }> {
  if (blob.type === "image/png") return { blob, type: "png" };
  if (blob.type === "image/jpeg") return { blob, type: "jpg" };
  if (blob.type === "image/gif") return { blob, type: "gif" };
  if (blob.type === "image/bmp") return { blob, type: "bmp" };
  if (typeof document === "undefined") throw new Error("当前环境不能转换 Word 页面图像。");
  const url = URL.createObjectURL(blob);
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
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("页面图像转换失败。")), "image/png");
    });
    return { blob: png, type: "png" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readImageDimensions(blob: Blob) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    const result = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return result;
  }
  if (typeof Image === "undefined") return { width: 720, height: 980 };
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function fitWithin(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / Math.max(1, width), maxHeight / Math.max(1, height), 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

async function readBlobBytes(blob: Blob): Promise<Uint8Array> {
  const modernBlob = blob as Blob & { arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof modernBlob.arrayBuffer === "function") {
    return new Uint8Array(await modernBlob.arrayBuffer());
  }
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("读取本地文件失败。"));
    reader.onload = () => reader.result instanceof ArrayBuffer
      ? resolve(reader.result)
      : reject(new Error("读取本地文件失败。"));
    reader.readAsArrayBuffer(blob);
  });
  return new Uint8Array(buffer);
}

function normalizeConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function translateOcrStatus(status: string, pageNumber: number, pageCount: number) {
  const statusMap: Record<string, string> = {
    "loading tesseract core": "正在加载本地 OCR 核心",
    "initializing tesseract": "正在初始化本地 OCR",
    "loading language traineddata": "正在加载本地语言包",
    "initializing api": "正在初始化识别引擎",
    "recognizing text": "正在识别文字"
  };
  return `${statusMap[status] || "正在本地识别"} · 第 ${pageNumber}/${pageCount} 页`;
}

function ensureNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("用户取消识别。");
}
