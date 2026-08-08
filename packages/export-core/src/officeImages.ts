import ExcelJS from "exceljs";
import { renderAsync } from "docx-preview";
import html2canvas from "html2canvas";
import type { ExportImageFormat, ProgressReporter } from "@doctool/shared";

export interface ImagePage {
  pageNumber: number;
  label: string;
  blob: Blob;
}

export interface OfficeImageOptions {
  format: ExportImageFormat;
  onProgress?: ProgressReporter;
  rasterize?: typeof html2canvas;
}

const maxExcelFileBytes = 30 * 1024 * 1024;
const maxExcelSheets = 30;
const maxExcelRowsPerSheet = 5000;
const maxExcelCellsPerSheet = 50000;
const maxRenderedPageHeight = 12000;

export async function renderDocxToImagePages(file: File, options: OfficeImageOptions): Promise<ImagePage[]> {
  if (typeof document === "undefined") throw new Error("Word renderer requires a browser document.");
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.background = "#ffffff";
  host.style.visibility = "visible";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  try {
    await renderAsync(await file.arrayBuffer(), host, undefined, {
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
      experimental: true,
      useBase64URL: true
    });
    if (document.fonts?.ready) await document.fonts.ready;
    await nextFrame();
    const pages = Array.from(host.querySelectorAll<HTMLElement>("section.docx"));
    const targets = pages.length ? pages : [host.querySelector<HTMLElement>(".docx") || host];
    const rasterize = options.rasterize ?? html2canvas;
    const result: ImagePage[] = [];
    for (const [index, target] of targets.entries()) {
      const canvas = await rasterize(target, {
        backgroundColor: "#ffffff",
        scale: renderScale(target.scrollWidth || host.scrollWidth),
        useCORS: false,
        logging: false,
        width: target.scrollWidth || undefined,
        height: target.scrollHeight || undefined,
        windowWidth: Math.max(window.innerWidth, target.scrollWidth || 0),
        windowHeight: Math.max(window.innerHeight, target.scrollHeight || 0)
      });
      result.push({
        pageNumber: index + 1,
        label: `第 ${index + 1} 页`,
        blob: await canvasToBlob(canvas, options.format)
      });
      options.onProgress?.((index + 1) / Math.max(1, targets.length), `已生成 ${index + 1}/${targets.length} 张 Word 图片`);
    }
    if (!result.length) throw new Error("Word document has no renderable pages.");
    return result;
  } finally {
    host.remove();
  }
}

export async function renderExcelToImagePages(file: File, options: OfficeImageOptions): Promise<ImagePage[]> {
  if (typeof document === "undefined") throw new Error("Excel renderer requires a browser document.");
  if (file.size > maxExcelFileBytes) {
    throw new Error("Excel file exceeds 30MB. Split it before converting or use the offline edition.");
  }

  const pages: ImagePage[] = [];
  const rasterize = options.rasterize ?? html2canvas;
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".xls")) {
    throw new Error("Legacy .xls files are not supported. Save the file as .xlsx first.");
  }

  const workbook = new ExcelJS.Workbook();
  if (lowerName.endsWith(".csv") || /csv/i.test(file.type)) {
    const rows = normalizeRows(parseCsv(await file.text()));
    validateSheetLimits("CSV 数据", rows);
    pages.push(...await renderWorksheetPages(createCsvWorksheet(rows), "CSV 数据", rasterize, options, pages.length));
  } else {
    await workbook.xlsx.load(new Uint8Array(await file.arrayBuffer()) as any);
    if (workbook.worksheets.length > maxExcelSheets) {
      throw new Error(`工作表数量超过 ${maxExcelSheets} 个，请拆分文件后再转换。`);
    }
    for (const [sheetIndex, sheet] of workbook.worksheets.entries()) {
      const rows = worksheetToRows(sheet);
      if (!rows.length) continue;
      validateSheetLimits(sheet.name, rows);
      pages.push(...await renderWorksheetPages(
        sheet,
        sheet.name || `工作表 ${sheetIndex + 1}`,
        rasterize,
        options,
        pages.length
      ));
    }
  }

  if (!pages.length) throw new Error("Excel workbook has no renderable worksheet content.");
  return pages;
}

export async function combineImagePages(pages: ImagePage[], format: ExportImageFormat, onProgress?: ProgressReporter): Promise<Blob> {
  if (!pages.length) throw new Error("No image pages to combine.");
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
  if (!ctx) throw new Error("Canvas is not supported by this browser.");
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

async function renderWorksheetPages(
  sheet: ExcelJS.Worksheet,
  sheetName: string,
  html2canvas: typeof import("html2canvas").default,
  options: OfficeImageOptions,
  pageOffset: number
): Promise<ImagePage[]> {
  const maxRow = Math.max(sheet.rowCount, 1);
  const maxColumn = Math.max(sheet.columnCount, 1);
  const pages: ImagePage[] = [];
  let startRow = 1;
  while (startRow <= maxRow) {
    const host = createSheetHost(sheet, sheetName, startRow, maxRow, maxColumn);
    document.body.appendChild(host);
    try {
      await nextFrame();
      const canvas = await html2canvas(host, {
        backgroundColor: "#ffffff",
        scale: renderScale(host.scrollWidth),
        useCORS: false,
        logging: false,
        width: host.scrollWidth,
        height: Math.min(host.scrollHeight, maxRenderedPageHeight),
        windowWidth: Math.max(window.innerWidth, host.scrollWidth),
        windowHeight: Math.max(window.innerHeight, host.scrollHeight)
      });
      pages.push({
        pageNumber: pageOffset + pages.length + 1,
        label: `${sheetName} ${pages.length + 1}`,
        blob: await canvasToBlob(canvas, options.format)
      });
      const renderedRows = countRenderedRows(host);
      startRow += Math.max(1, renderedRows);
      options.onProgress?.(Math.min(1, startRow / (maxRow + 1)), `正在渲染工作表：${sheetName}`);
    } finally {
      host.remove();
    }
  }
  return pages;
}

function createSheetHost(sheet: ExcelJS.Worksheet, sheetName: string, startRow: number, maxRow: number, maxColumn: number) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.visibility = "visible";
  host.style.pointerEvents = "none";
  host.style.background = "#ffffff";
  host.style.display = "inline-block";
  host.style.width = `${sheetWidth(sheet, maxColumn)}px`;

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.tableLayout = "fixed";
  table.style.fontFamily = "Calibri, Microsoft YaHei, Arial, sans-serif";
  table.style.fontSize = "14px";
  table.style.color = "#000000";
  table.style.background = "#ffffff";
  table.appendChild(createColumnGroup(sheet, maxColumn));

  const title = document.createElement("caption");
  title.textContent = sheetName;
  title.style.captionSide = "top";
  title.style.textAlign = "left";
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.padding = "10px 0";
  table.appendChild(title);

  const body = document.createElement("tbody");
  const merges = mergeMap(sheet);
  let renderedHeight = 0;
  for (let rowNumber = startRow; rowNumber <= maxRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const tr = document.createElement("tr");
    tr.style.height = `${rowHeight(row)}px`;
    for (let columnNumber = 1; columnNumber <= maxColumn; columnNumber += 1) {
      const merge = merges.get(`${rowNumber}:${columnNumber}`);
      if (merge && (merge.startRow !== rowNumber || merge.startColumn !== columnNumber)) continue;
      const cell = row.getCell(columnNumber);
      const td = document.createElement("td");
      const columnWidth = columnPixelWidth(sheet.getColumn(columnNumber));
      td.style.width = `${columnWidth}px`;
      td.style.height = `${rowHeight(row)}px`;
      td.style.padding = "3px 6px";
      td.style.boxSizing = "border-box";
      td.style.whiteSpace = cell.alignment?.wrapText ? "pre-wrap" : "pre";
      td.style.overflow = "hidden";
      applyCellStyle(td, cell);
      td.textContent = cell.text || formatExcelCellValue(cell.value);
      if (merge) {
        td.colSpan = merge.endColumn - merge.startColumn + 1;
        td.rowSpan = merge.endRow - merge.startRow + 1;
      }
      tr.appendChild(td);
    }
    body.appendChild(tr);
    renderedHeight += rowHeight(row);
    if (renderedHeight >= maxRenderedPageHeight) break;
  }
  table.appendChild(body);
  host.appendChild(table);
  return host;
}

function createCsvWorksheet(rows: string[][]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("CSV 数据");
  rows.forEach((row) => sheet.addRow(row));
  return sheet;
}

function createColumnGroup(sheet: ExcelJS.Worksheet, maxColumn: number) {
  const colgroup = document.createElement("colgroup");
  for (let columnNumber = 1; columnNumber <= maxColumn; columnNumber += 1) {
    const col = document.createElement("col");
    col.style.width = `${columnPixelWidth(sheet.getColumn(columnNumber))}px`;
    colgroup.appendChild(col);
  }
  return colgroup;
}

function applyCellStyle(element: HTMLTableCellElement, cell: ExcelJS.Cell) {
  const font = cell.font;
  if (font) {
    element.style.fontFamily = font.name || "Calibri";
    element.style.fontSize = `${font.size || 11}pt`;
    element.style.fontWeight = font.bold ? "700" : "400";
    element.style.fontStyle = font.italic ? "italic" : "normal";
    if (font.color?.argb) element.style.color = argbToCss(font.color.argb);
  }
  if (cell.fill?.type === "pattern" && cell.fill.pattern === "solid" && cell.fill.fgColor?.argb) {
    element.style.backgroundColor = argbToCss(cell.fill.fgColor.argb);
  }
  const alignment = cell.alignment;
  if (alignment?.horizontal) element.style.textAlign = alignment.horizontal;
  if (alignment?.vertical) element.style.verticalAlign = alignment.vertical;
  if (alignment?.wrapText) element.style.whiteSpace = "pre-wrap";
  const border = cell.border;
  if (border) {
    element.style.borderTop = borderStyle(border.top);
    element.style.borderRight = borderStyle(border.right);
    element.style.borderBottom = borderStyle(border.bottom);
    element.style.borderLeft = borderStyle(border.left);
  } else {
    element.style.border = "1px solid #d9d9d9";
  }
}

function borderStyle(border: Partial<ExcelJS.Border> | undefined) {
  if (!border?.style) return "1px solid #d9d9d9";
  const color = border.color?.argb ? argbToCss(border.color.argb) : "#808080";
  const width = border.style === "thick" ? 2 : border.style === "medium" ? 1.5 : 1;
  return `${width}px solid ${color}`;
}

function mergeMap(sheet: ExcelJS.Worksheet) {
  const map = new Map<string, { startRow: number; startColumn: number; endRow: number; endColumn: number }>();
  for (const range of sheet.model.merges || []) {
    const match = range.match(/^(\$?[A-Z]+\$?\d+):(\$?[A-Z]+\$?\d+)$/i);
    if (!match) continue;
    const start = cellAddress(match[1]);
    const end = cellAddress(match[2]);
    const value = { startRow: start.row, startColumn: start.column, endRow: end.row, endColumn: end.column };
    for (let row = start.row; row <= end.row; row += 1) {
      for (let column = start.column; column <= end.column; column += 1) map.set(`${row}:${column}`, value);
    }
  }
  return map;
}

function cellAddress(value: string) {
  const normalized = value.replace(/\$/g, "").toUpperCase();
  const match = normalized.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: 1, column: 1 };
  let column = 0;
  for (const char of match[1]) column = column * 26 + char.charCodeAt(0) - 64;
  return { row: Number(match[2]), column };
}

function sheetWidth(sheet: ExcelJS.Worksheet, maxColumn: number) {
  return Array.from({ length: maxColumn }, (_, index) => columnPixelWidth(sheet.getColumn(index + 1)))
    .reduce((sum, width) => sum + width, 0);
}

function columnPixelWidth(column: ExcelJS.Column) {
  return Math.max(28, Math.round(((column.width || 8.43) * 7) + 5));
}

function rowHeight(row: ExcelJS.Row) {
  return Math.max(20, Math.round(((row.height || 15) * 96) / 72));
}

function countRenderedRows(host: HTMLElement) {
  return Math.max(1, host.querySelectorAll("tbody tr").length);
}

function renderScale(width: number) {
  return Math.min(3, Math.max(2, 2400 / Math.max(1, width)));
}

function validateSheetLimits(sheetName: string, rows: string[][]) {
  if (rows.length > maxExcelRowsPerSheet) {
    throw new Error(`工作表 ${sheetName} 超过 ${maxExcelRowsPerSheet} 行，请拆分后再转换。`);
  }
  const cells = rows.reduce((total, row) => total + row.length, 0);
  if (cells > maxExcelCellsPerSheet) {
    throw new Error(`工作表 ${sheetName} 单元格数量超过 ${maxExcelCellsPerSheet} 个，请拆分后再转换。`);
  }
}

function worksheetToRows(sheet: ExcelJS.Worksheet): string[][] {
  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, columnIndex) => {
      values[columnIndex - 1] = formatExcelCellValue(cell.value);
    });
    rows.push(values);
  });
  return normalizeRows(rows);
}

function formatExcelCellValue(value: ExcelJS.CellValue | undefined): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleDateString("zh-CN");
  if (typeof value !== "object") return String(value);
  if ("text" in value && typeof value.text === "string") return value.text;
  if ("richText" in value && Array.isArray(value.richText)) return value.richText.map((item) => item.text || "").join("");
  if ("result" in value) return formatExcelCellValue(value.result as ExcelJS.CellValue);
  if ("formula" in value) return String(value.formula || "");
  if ("hyperlink" in value) return String(value.hyperlink || "");
  return String(value);
}

function normalizeRows(rows: string[][]): string[][] {
  return rows
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some(Boolean));
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

function argbToCss(value: string) {
  const normalized = value.length === 8 ? value.slice(2) : value;
  return `#${normalized}`;
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ExportImageFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("图片生成失败，请降低清晰度后重试。")), mimeForFormat(format), format === "png" ? undefined : 0.92);
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

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}
