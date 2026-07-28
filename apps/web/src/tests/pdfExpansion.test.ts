import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  decoratePdf,
  extractPdfPages,
  imagesToPdf,
  mergePdfFiles,
  rearrangePdfPages,
  splitPdfPages
} from "@doctool/pdf-core";

describe("pdf-core page and creation tools", () => {
  it("merges PDF files in the selected order", async () => {
    const first = await pdfFile("first.pdf", 2);
    const second = await pdfFile("second.pdf", 1);

    const merged = await mergePdfFiles([second, first]);
    const document = await PDFDocument.load(await blobBytes(merged));

    expect(document.getPageCount()).toBe(3);
  });

  it("extracts and rearranges selected pages", async () => {
    const source = await pdfFile("source.pdf", 4);
    const extracted = await extractPdfPages(source, [4, 2]);
    const arranged = await rearrangePdfPages(source, {
      pageOrder: [3, 1],
      rotations: { 3: 90 }
    });
    const extractedDocument = await PDFDocument.load(await blobBytes(extracted));
    const arrangedDocument = await PDFDocument.load(await blobBytes(arranged));

    expect(extractedDocument.getPageCount()).toBe(2);
    expect(arrangedDocument.getPageCount()).toBe(2);
    expect(arrangedDocument.getPage(0).getRotation().angle).toBe(90);
  });

  it("splits selected pages into independent PDF files", async () => {
    const source = await pdfFile("source.pdf", 3);
    const pages = await splitPdfPages(source, [1, 3]);

    expect(pages.map((item) => item.pageNumber)).toEqual([1, 3]);
    for (const page of pages) {
      const document = await PDFDocument.load(await blobBytes(page.blob));
      expect(document.getPageCount()).toBe(1);
    }
  });

  it("creates one PDF page per image without stretching", async () => {
    const image = new File([onePixelPng()], "pixel.png", { type: "image/png" });
    const result = await imagesToPdf([image, image], { pageMode: "a4" });
    const document = await PDFDocument.load(await blobBytes(result));

    expect(document.getPageCount()).toBe(2);
    expect(document.getPage(0).getSize().width).toBeCloseTo(595.28, 1);
    expect(document.getPage(0).getSize().height).toBeCloseTo(841.89, 1);
  });

  it("adds watermark, page number, header and footer only to selected pages", async () => {
    const source = await pdfFile("source.pdf", 2);
    const result = await decoratePdf(source, {
      pages: [2],
      watermark: {
        kind: "text",
        text: "LOCAL",
        opacity: 0.25,
        size: 42,
        color: "#64748b",
        rotation: -35,
        position: "center"
      },
      pageNumber: { position: "bottom-center", startAt: 1 },
      header: "HEADER",
      footer: "FOOTER"
    });
    const document = await PDFDocument.load(await blobBytes(result));

    expect(document.getPageCount()).toBe(2);
    expect(result.size).toBeGreaterThan(source.size);
  });
});

async function pdfFile(name: string, pages: number) {
  const document = await PDFDocument.create();
  for (let index = 0; index < pages; index += 1) {
    document.addPage([400 + index, 600 + index]);
  }
  const bytes = await document.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new File([copy.buffer], name, { type: "application/pdf" });
}

function onePixelPng() {
  return Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z3fQAAAAASUVORK5CYII="),
    (character) => character.charCodeAt(0)
  );
}

async function blobBytes(blob: Blob) {
  return new Uint8Array(await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("Expected ArrayBuffer"));
    };
    reader.readAsArrayBuffer(blob);
  }));
}
