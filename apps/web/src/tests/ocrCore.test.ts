import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import {
  buildOcrAssetUrls,
  createOcrTextBlob,
  exportEditableOcrWord,
  formatOcrText,
  shouldUseDirectPdfText
} from "@doctool/ocr-core";

const projectRoot = path.resolve(process.cwd(), "..", "..");

describe("ocr-core local recognition and export boundaries", () => {
  it("uses direct PDF text when a page already contains meaningful text", () => {
    expect(shouldUseDirectPdfText("这是一页已经包含可选择文字的 PDF 内容。")).toBe(true);
    expect(shouldUseDirectPdfText("  12  ")).toBe(false);
  });

  it("formats OCR text in page reading order", () => {
    const text = formatOcrText([
      { pageNumber: 1, text: "第一页内容", confidence: 96, source: "ocr" },
      { pageNumber: 2, text: "Second page", confidence: 100, source: "text" }
    ]);
    const blob = createOcrTextBlob([
      { pageNumber: 1, text: "第一页内容", confidence: 96, source: "ocr" }
    ]);

    expect(text).toContain("第 1 页");
    expect(text.indexOf("第一页内容")).toBeLessThan(text.indexOf("Second page"));
    expect(blob.type).toBe("text/plain;charset=utf-8");
  });

  it("creates an editable Word document with one section per OCR page", async () => {
    const blob = await exportEditableOcrWord([
      { pageNumber: 1, text: "第一段\n第二段", confidence: 94, source: "ocr" },
      { pageNumber: 2, text: "Page two", confidence: 100, source: "text" }
    ]);

    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(blob.size).toBeGreaterThan(500);
  });

  it("keeps OCR coordinates as editable positioned Word text boxes", async () => {
    const blob = await exportEditableOcrWord([
      {
        pageNumber: 1,
        text: "Title\nBody",
        confidence: 94,
        source: "ocr",
        width: 1000,
        height: 1400,
        layout: [
          { text: "Title", x: 80, y: 100, width: 240, height: 36 },
          { text: "Body", x: 80, y: 180, width: 300, height: 28 }
        ]
      }
    ]);
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Unable to read Word export"));
      reader.onerror = () => reject(reader.error || new Error("Unable to read Word export"));
      reader.readAsArrayBuffer(blob as Blob);
    });
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await zip.file("word/document.xml")?.async("text");

    expect(documentXml).toContain("v:shape");
    expect(documentXml).toContain("w:txbxContent");
    expect(documentXml).toContain("Title");
    expect(documentXml).toContain("Body");
  });

  it("keeps worker, core and language assets on same-origin paths", () => {
    expect(buildOcrAssetUrls()).toEqual({
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/core/",
      langPath: "/ocr/lang/"
    });

    const source = readFileSync(path.join(projectRoot, "packages", "ocr-core", "src", "index.ts"), "utf8");
    expect(source).not.toContain("cdn.jsdelivr.net");
    expect(source).not.toContain("tessdata.projectnaptha.com");
    expect(source).not.toContain("FormData");
  });
});
