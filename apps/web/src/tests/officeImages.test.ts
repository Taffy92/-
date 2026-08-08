import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

const pngDataUrl = `data:image/png;base64,${btoa("image")}`;
const rasterize = vi.fn(async () => document.createElement("canvas"));

beforeAll(() => {
  const context = {
    fillStyle: "",
    strokeStyle: "",
    font: "",
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    measureText: (text: string) => ({ width: text.length * 12 })
  };

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: () => context,
    configurable: true
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    value: () => pngDataUrl,
    configurable: true
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
    value(callback: BlobCallback) {
      callback(new Blob(["image"], { type: "image/png" }));
    },
    configurable: true
  });
  Object.defineProperty(window, "createImageBitmap", {
    value: vi.fn(async () => ({ width: 100, height: 160 })),
    configurable: true
  });
});

describe("office document to image conversion", () => {
  it("renders a real docx document into local image pages", async () => {
    const { renderDocxToImagePages } = await import("@doctool/export-core");
    const file = fixtureFile("word/basic-two-pages.docx");

    const pages = await renderDocxToImagePages(file, { format: "png", rasterize });

    expect(pages).toHaveLength(2);
    expect(pages.map((page) => page.pageNumber)).toEqual([1, 2]);
    expect(pages[0].blob.type).toBe("image/png");
  });

  it("renders every sheet in a real xlsx document and combines the pages", async () => {
    const { combineImagePages, renderExcelToImagePages } = await import("@doctool/export-core");
    const file = fixtureFile("excel/basic-two-sheets.xlsx");

    const pages = await renderExcelToImagePages(file, { format: "png", rasterize });
    const combined = await combineImagePages(pages, "png");

    expect(pages).toHaveLength(2);
    expect(pages.map((page) => page.pageNumber)).toEqual([1, 2]);
    expect(pages.map((page) => page.label)).toEqual(["Summary 1", "Details 1"]);
    expect(combined.type).toBe("image/png");
  });
});

function fixtureFile(relativePath: string) {
  const bytes = new Uint8Array(readFileSync(resolve(process.cwd(), "src/test-fixtures/conversion", relativePath)));
  const arrayBuffer = bytes.slice().buffer;
  return {
    name: relativePath.split("/").at(-1) || "fixture",
    type: "",
    size: arrayBuffer.byteLength,
    lastModified: Date.now(),
    webkitRelativePath: "",
    arrayBuffer: async () => arrayBuffer
  } as File;
}
