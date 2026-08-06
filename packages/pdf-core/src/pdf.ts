import type { PdfOutputFormat, ProgressReporter } from "@doctool/shared";

export interface PdfRenderOptions {
  pages: number[];
  format: PdfOutputFormat;
  scale: number;
  onProgress?: ProgressReporter;
}

export interface PdfTextPage {
  pageNumber: number;
  text: string;
  itemCount: number;
  width: number;
  height: number;
  layout: PdfTextBox[];
}

export interface PdfTextBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdf = await loadPdf(file);
  return pdf.numPages;
}

export function parsePageSelection(selection: string, totalPages: number): number[] {
  const trimmed = selection.trim();
  if (!trimmed || trimmed === "all" || trimmed === "全部") {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set<number>();
  for (const part of trimmed.split(",")) {
    const item = part.trim();
    if (!item) continue;
    const range = item.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Math.max(1, Number(range[1]));
      const end = Math.min(totalPages, Number(range[2]));
      for (let page = Math.min(start, end); page <= Math.max(start, end); page += 1) {
        if (page >= 1 && page <= totalPages) pages.add(page);
      }
    } else {
      const page = Number(item);
      if (Number.isInteger(page) && page >= 1 && page <= totalPages) pages.add(page);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export async function renderPdfPageToBlob(file: File, pageNumber: number, format: PdfOutputFormat, scale = 2): Promise<Blob> {
  const pdf = await loadPdf(file);
  const page = await pdf.getPage(pageNumber);
  return renderPage(page, format, scale);
}

export async function renderPdfPages(file: File, options: PdfRenderOptions): Promise<Array<{ pageNumber: number; blob: Blob }>> {
  const pdf = await loadPdf(file);
  const results: Array<{ pageNumber: number; blob: Blob }> = [];
  for (const [index, pageNumber] of options.pages.entries()) {
    const page = await pdf.getPage(pageNumber);
    const blob = await renderPage(page, options.format, options.scale);
    results.push({ pageNumber, blob });
    options.onProgress?.((index + 1) / options.pages.length, `正在渲染第 ${pageNumber} 页`);
  }
  return results;
}

export async function extractPdfTextPages(file: File): Promise<PdfTextPage[]> {
  const pdf = await loadPdf(file);
  const results: PdfTextPage[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items = Array.isArray(content?.items) ? content.items : [];
    const lines: string[] = [];
    const layout: PdfTextBox[] = [];
    let currentLine = "";
    for (const item of items) {
      if (!isPdfTextItem(item)) continue;
      const value = item.str.trim();
      if (value) currentLine += `${currentLine ? " " : ""}${value}`;
      if (value && Array.isArray(item.transform)) {
        const height = Math.max(8, Math.hypot(item.transform[2] || 0, item.transform[3] || 0));
        layout.push({
          text: value,
          x: Math.max(0, item.transform[4] || 0),
          y: Math.max(0, viewport.height - (item.transform[5] || 0) - height),
          width: Math.max(1, item.width || height),
          height
        });
      }
      if (item.hasEOL && currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
    }
    if (currentLine) lines.push(currentLine);
    results.push({
      pageNumber,
      text: lines.join("\n").trim(),
      itemCount: items.length,
      width: viewport.width,
      height: viewport.height,
      layout
    });
  }
  return results;
}

export async function loadPdf(file: File): Promise<any> {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({
    data,
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    useWorkerFetch: false
  });
  return loadingTask.promise;
}

async function getPdfJs(): Promise<any> {
  ensurePromiseWithResolvers();
  const pdfjs = typeof window !== "undefined"
    ? await loadBundledPdfJs()
    : await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.polyfill.mjs";
  }
  return pdfjs;
}

async function loadBundledPdfJs(): Promise<any> {
  try {
    const bundledPdfModule = "/pdfjs/pdf.mjs";
    return await import(/* webpackIgnore: true */ bundledPdfModule);
  } catch {
    return import("pdfjs-dist");
  }
}

type PromiseWithResolversConstructor = PromiseConstructor & {
  withResolvers?: <T>() => {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  };
};

function ensurePromiseWithResolvers() {
  const PromiseCtor = Promise as PromiseWithResolversConstructor;
  if (typeof PromiseCtor.withResolvers === "function") return;
  PromiseCtor.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

async function renderPage(page: any, format: PdfOutputFormat, scale: number): Promise<Blob> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PDF 页面渲染失败，请降低清晰度后重试。"));
    }, mime, 0.92);
  });
}

function isPdfTextItem(value: unknown): value is {
  str: string;
  hasEOL?: boolean;
  transform?: number[];
  width?: number;
} {
  return typeof value === "object"
    && value !== null
    && "str" in value
    && typeof (value as { str?: unknown }).str === "string";
}
