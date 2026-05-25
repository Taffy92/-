import { beforeAll, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import { combineImagePages, renderDocxToImagePages, renderExcelToImagePages } from "@doctool/export-core";

const pngDataUrl = `data:image/png;base64,${btoa("image")}`;

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
  it("renders a docx document into local image pages", async () => {
    const zip = new JSZip();
    zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:t>测试标题</w:t></w:r></w:p>
          <w:p><w:r><w:t>这是一个本地 Word 转图片测试。</w:t></w:r></w:p>
          <w:tbl>
            <w:tr><w:tc><w:p><w:r><w:t>姓名</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>数量</w:t></w:r></w:p></w:tc></w:tr>
            <w:tr><w:tc><w:p><w:r><w:t>示例</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>12</w:t></w:r></w:p></w:tc></w:tr>
          </w:tbl>
        </w:body>
      </w:document>`);
    const file = fileFromArrayBuffer(await zip.generateAsync({ type: "arraybuffer" }), "sample.docx");

    const pages = await renderDocxToImagePages(file, { format: "png" });

    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0].blob.type).toBe("image/png");
  });

  it("renders excel sheets and combines them into one local image", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("清单");
    sheet.addRows([
      ["名称", "金额"],
      ["项目 A", "100"],
      ["项目 B", "230"]
    ]);
    const buffer = await workbook.xlsx.writeBuffer();
    const file = fileFromArrayBuffer(buffer, "sample.xlsx");

    const pages = await renderExcelToImagePages(file, { format: "png" });
    const combined = await combineImagePages(pages, "png");

    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(combined.type).toBe("image/png");
  });
});

function fileFromArrayBuffer(buffer: ArrayBuffer | Buffer, name: string) {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
  const arrayBuffer = bytes.slice().buffer;
  return {
    name,
    type: "",
    size: arrayBuffer.byteLength,
    lastModified: Date.now(),
    webkitRelativePath: "",
    arrayBuffer: async () => arrayBuffer
  } as File;
}
