import JSZip from "jszip";
import ExcelJS from "exceljs";
import type { ExportImageFormat, ProgressReporter } from "@doctool/shared";

export interface ImagePage {
  pageNumber: number;
  label: string;
  blob: Blob;
}

export interface OfficeImageOptions {
  format: ExportImageFormat;
  onProgress?: ProgressReporter;
}

type WordBlock =
  | { type: "paragraph"; text: string }
  | { type: "table"; rows: string[][] };

const pageWidth = 1240;
const pageHeight = 1754;
const pageMargin = 86;
const bodyFont = "26px Microsoft YaHei, PingFang SC, Arial, sans-serif";
const titleFont = "700 32px Microsoft YaHei, PingFang SC, Arial, sans-serif";
const maxExcelFileBytes = 30 * 1024 * 1024;
const maxExcelSheets = 30;
const maxExcelRowsPerSheet = 5000;
const maxExcelCellsPerSheet = 50000;

export async function renderDocxToImagePages(file: File, options: OfficeImageOptions): Promise<ImagePage[]> {
  const blocks = await readDocxBlocks(file);
  if (!blocks.length) throw new Error("Word 文档没有读取到可转换内容，请确认文件为 .docx 格式。");
  const pages = renderWordBlocksToPages(blocks, options.format);
  options.onProgress?.(1, `已生成 ${pages.length} 张 Word 图片`);
  return pages;
}

export async function renderExcelToImagePages(file: File, options: OfficeImageOptions): Promise<ImagePage[]> {
  const pages: ImagePage[] = [];

  if (file.size > maxExcelFileBytes) {
    throw new Error("Excel 文件超过 30MB。为避免浏览器内存不足，请拆分文件后再转换，或使用离线专业版处理。");
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".csv") || /csv/i.test(file.type)) {
    const rows = normalizeRows(parseCsv(await file.text()));
    if (rows.length > maxExcelRowsPerSheet) {
      throw new Error(`CSV 行数超过 ${maxExcelRowsPerSheet} 行，请拆分后再转换。`);
    }
    ensureCellLimit(rows);
    if (rows.length) pages.push(...renderSheetRowsToPages("CSV 数据", rows, options.format, 1));
    options.onProgress?.(1, "正在渲染 CSV 数据");
  } else {
    if (lowerName.endsWith(".xls")) {
      throw new Error("为避免旧版 .xls 解析风险，请先用 Excel/WPS 将文件另存为 .xlsx 后再转换。");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(new Uint8Array(await file.arrayBuffer()) as any);
    if (workbook.worksheets.length > maxExcelSheets) {
      throw new Error(`工作表数量超过 ${maxExcelSheets} 个，请拆分文件后再转换。`);
    }

    workbook.worksheets.forEach((sheet, sheetIndex) => {
      const rows = normalizeRows(worksheetToRows(sheet));
      if (!rows.length) return;
      ensureCellLimit(rows);
      pages.push(...renderSheetRowsToPages(sheet.name || `工作表 ${sheetIndex + 1}`, rows, options.format, pages.length + 1));
      options.onProgress?.((sheetIndex + 1) / Math.max(1, workbook.worksheets.length), `正在渲染工作表：${sheet.name}`);
    });
  }

  if (!pages.length) throw new Error("Excel 文件没有读取到可转换的工作表内容。");
  return pages;
}

export async function combineImagePages(pages: ImagePage[], format: ExportImageFormat, onProgress?: ProgressReporter): Promise<Blob> {
  if (!pages.length) throw new Error("没有可合成的图片页面。");
  const bitmaps = [];
  for (const [index, page] of pages.entries()) {
    bitmaps.push(await blobToBitmap(page.blob));
    onProgress?.((index + 1) / Math.max(1, pages.length * 2), `正在读取第 ${page.pageNumber} 页`);
  }

  const gap = 28;
  const maxWidth = Math.max(...bitmaps.map((bitmap) => bitmap.width));
  const totalHeight = bitmaps.reduce((sum, bitmap) => sum + bitmap.height, 0) + gap * (bitmaps.length - 1);
  const scale = Math.min(1, 6000 / maxWidth, 30000 / totalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(maxWidth * scale));
  canvas.height = Math.max(1, Math.round(totalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas，无法合成图片。");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let y = 0;
  bitmaps.forEach((bitmap, index) => {
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const x = Math.round((canvas.width - width) / 2);
    ctx.drawImage(bitmap, x, y, width, height);
    y += height + Math.round(gap * scale);
    onProgress?.(0.5 + (index + 1) / Math.max(1, bitmaps.length * 2), `正在合成第 ${index + 1} 页`);
  });
  return canvasToBlob(canvas, format);
}

async function readDocxBlocks(file: File): Promise<WordBlock[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file("word/document.xml")?.async("text");
  if (!documentXml) throw new Error("只支持标准 .docx 文档，暂不支持旧版 .doc 文件。");
  const xml = new DOMParser().parseFromString(documentXml, "application/xml");
  const body = firstByLocalName(xml, "body");
  if (!body) return [];
  const blocks: WordBlock[] = [];
  Array.from(body.children).forEach((child) => {
    if (child.localName === "p") {
      const text = textFromNode(child);
      blocks.push({ type: "paragraph", text });
      return;
    }
    if (child.localName === "tbl") {
      const rows = Array.from(child.getElementsByTagNameNS("*", "tr")).map((row) =>
        Array.from(row.getElementsByTagNameNS("*", "tc")).map((cell) => textFromNode(cell))
      );
      if (rows.length) blocks.push({ type: "table", rows });
    }
  });
  return blocks.filter((block) => block.type === "table" || block.text.trim());
}

function renderWordBlocksToPages(blocks: WordBlock[], format: ExportImageFormat): ImagePage[] {
  const pages: ImagePage[] = [];
  let canvas = createPageCanvas();
  let ctx = canvas.getContext("2d")!;
  let y = pageMargin;
  drawPageTitle(ctx, "Word 转图片", y);
  y += 58;

  const commitPage = () => {
    pages.push({ pageNumber: pages.length + 1, label: `第 ${pages.length + 1} 页`, blob: canvasToBlobSync(canvas, format) });
    canvas = createPageCanvas();
    ctx = canvas.getContext("2d")!;
    y = pageMargin;
  };

  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - pageMargin) return;
    commitPage();
  };

  blocks.forEach((block) => {
    if (block.type === "paragraph") {
      ctx.font = bodyFont;
      ctx.fillStyle = "#111827";
      const lines = wrapText(ctx, block.text || " ", pageWidth - pageMargin * 2);
      ensureSpace(lines.length * 38 + 18);
      lines.forEach((line) => {
        ctx.fillText(line, pageMargin, y);
        y += 38;
      });
      y += 18;
      return;
    }
    const columns = Math.max(...block.rows.map((row) => row.length), 1);
    const cellWidth = (pageWidth - pageMargin * 2) / columns;
    block.rows.forEach((row) => {
      ctx.font = "23px Microsoft YaHei, PingFang SC, Arial, sans-serif";
      const wrappedCells = Array.from({ length: columns }, (_, index) => wrapText(ctx, row[index] || "", cellWidth - 18));
      const rowHeight = Math.max(50, Math.max(...wrappedCells.map((lines) => lines.length)) * 30 + 18);
      ensureSpace(rowHeight + 8);
      Array.from({ length: columns }).forEach((_, index) => {
        const x = pageMargin + index * cellWidth;
        ctx.strokeStyle = "#cbd5e1";
        ctx.strokeRect(x, y, cellWidth, rowHeight);
        ctx.fillStyle = "#111827";
        wrappedCells[index].forEach((line, lineIndex) => ctx.fillText(line, x + 9, y + 32 + lineIndex * 30));
      });
      y += rowHeight;
    });
    y += 18;
  });

  if (pages.length === 0 || y > pageMargin) commitPage();
  return pages;
}

function renderSheetRowsToPages(sheetName: string, rows: string[][], format: ExportImageFormat, firstPageNumber: number): ImagePage[] {
  const maxColumns = Math.max(...rows.map((row) => row.length), 1);
  const widths = Array.from({ length: maxColumns }, (_, column) => {
    const longest = Math.max(...rows.map((row) => String(row[column] || "").length), sheetName.length / maxColumns);
    return clamp(longest * 13 + 42, 96, 260);
  });
  const contentWidth = widths.reduce((sum, width) => sum + width, 0);
  const canvasWidth = Math.max(1200, Math.min(2400, contentWidth + 120));
  const rowHeight = 46;
  const rowsPerPage = 24;
  const pages: ImagePage[] = [];
  for (let start = 0; start < rows.length; start += rowsPerPage) {
    const pageRows = rows.slice(start, start + rowsPerPage);
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = 150 + pageRows.length * rowHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持 Canvas，无法渲染 Excel。");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = titleFont;
    ctx.fillStyle = "#111827";
    ctx.fillText(sheetName, 60, 58);
    ctx.font = "22px Microsoft YaHei, PingFang SC, Arial, sans-serif";
    let y = 104;
    pageRows.forEach((row, rowIndex) => {
      let x = 60;
      const isHeader = start === 0 && rowIndex === 0;
      widths.forEach((width, columnIndex) => {
        ctx.fillStyle = isHeader ? "#eff6ff" : "#ffffff";
        ctx.fillRect(x, y, width, rowHeight);
        ctx.strokeStyle = "#cbd5e1";
        ctx.strokeRect(x, y, width, rowHeight);
        ctx.fillStyle = "#111827";
        const text = String(row[columnIndex] || "");
        ctx.fillText(truncateToWidth(ctx, text, width - 18), x + 9, y + 30);
        x += width;
      });
      y += rowHeight;
    });
    pages.push({
      pageNumber: firstPageNumber + pages.length,
      label: `${sheetName} ${Math.floor(start / rowsPerPage) + 1}`,
      blob: canvasToBlobSync(canvas, format)
    });
  }
  return pages;
}

function worksheetToRows(sheet: ExcelJS.Worksheet): string[][] {
  const rows: string[][] = [];
  let cells = 0;
  sheet.eachRow({ includeEmpty: false }, (row) => {
    if (rows.length >= maxExcelRowsPerSheet) {
      throw new Error(`工作表 ${sheet.name} 超过 ${maxExcelRowsPerSheet} 行，请拆分后再转换。`);
    }
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, columnIndex) => {
      values[columnIndex - 1] = formatExcelCellValue(cell.value);
      cells += 1;
      if (cells > maxExcelCellsPerSheet) {
        throw new Error(`工作表 ${sheet.name} 单元格数量超过 ${maxExcelCellsPerSheet} 个，请拆分后再转换。`);
      }
    });
    rows.push(values);
  });
  return rows;
}

function formatExcelCellValue(value: ExcelJS.CellValue | undefined): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleDateString("zh-CN");
  if (typeof value !== "object") return String(value);
  if ("text" in value && typeof value.text === "string") return value.text;
  if ("richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((item) => item.text || "").join("");
  }
  if ("result" in value) return formatExcelCellValue(value.result as ExcelJS.CellValue);
  if ("formula" in value) return String(value.formula || "");
  if ("hyperlink" in value) return String(value.hyperlink || "");
  return String(value);
}

function ensureCellLimit(rows: string[][]) {
  const cells = rows.reduce((total, row) => total + row.length, 0);
  if (cells > maxExcelCellsPerSheet) {
    throw new Error(`表格单元格数量超过 ${maxExcelCellsPerSheet} 个，请拆分文件后再转换。`);
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function normalizeRows(rows: string[][]): string[][] {
  return rows
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some(Boolean));
}

function createPageCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas，无法渲染 Word。");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function drawPageTitle(ctx: CanvasRenderingContext2D, title: string, y: number) {
  ctx.font = titleFont;
  ctx.fillStyle = "#0f172a";
  ctx.fillText(title, pageMargin, y);
}

function textFromNode(node: Element) {
  return Array.from(node.getElementsByTagNameNS("*", "t"))
    .map((item) => item.textContent || "")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function firstByLocalName(document: XMLDocument, localName: string) {
  return Array.from(document.getElementsByTagName("*")).find((node) => node.localName === localName);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function canvasToBlobSync(canvas: HTMLCanvasElement, format: ExportImageFormat) {
  const dataUrl = canvas.toDataURL(mimeForFormat(format), format === "png" ? undefined : 0.92);
  const binary = atob(dataUrl.split(",")[1] || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeForFormat(format) });
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ExportImageFormat) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("图片生成失败，请降低清晰度后重试。"));
    }, mimeForFormat(format), format === "png" ? undefined : 0.92);
  });
}

async function blobToBitmap(blob: Blob) {
  if ("createImageBitmap" in window) return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("图片读取失败，无法合成。"));
      img.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function mimeForFormat(format: ExportImageFormat) {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  return "image/jpeg";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
