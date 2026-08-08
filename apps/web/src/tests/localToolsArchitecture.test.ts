import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");

function readSource(relativePath: string) {
  return readFileSync(resolve(sourceRoot, relativePath), "utf8");
}

describe("LocalToolsClient responsibility boundaries", () => {
  it("delegates task execution, cancellation, clearing and desktop writes", () => {
    const client = readSource("components/tools/LocalToolsClient.tsx");
    const controller = readSource("components/tools/useLocalToolController.ts");

    expect(client).toContain('from "@/components/tools/useLocalToolController"');
    expect(client).toContain("useLocalToolController(");
    expect(client).not.toContain("async function executeTool(");
    expect(client).not.toContain("function cancel() {");
    expect(client).not.toContain("function clear() {");
    expect(client).not.toContain("function friendlyError(");
    expect(client).not.toContain("writeBinaryFile");

    expect(controller).toContain("async function executeTool(");
    expect(controller).toContain("function cancel()");
    expect(controller).toContain("function clear()");
    expect(controller).toContain("export function friendlyLocalToolError");
    expect(controller).toContain("saveDesktopOutputs");
    expect(controller).toContain("writeBinaryFile");
  });

  it("renders previews and controls through dedicated leaf components", () => {
    const client = readSource("components/tools/LocalToolsClient.tsx");
    const previews = readSource("components/tools/LocalFilePreviewGrid.tsx");
    const controls = readSource("components/tools/LocalToolControls.tsx");

    expect(client).toContain("<LocalFilePreviewGrid");
    expect(client).toContain("<LocalToolControls");
    expect(client).not.toContain("function LocalFilePreview(");
    expect(client).not.toContain("function ToolControls(");

    expect(previews).toContain("local-toolkit-file-grid");
    expect(previews).toContain("local-file-preview");
    expect(previews).toContain("export function LocalOutputList");
    expect(controls).toContain("export function LocalToolControls");
    expect(controls).toContain("输出格式");
  });

  it("preserves every existing tool id, input boundary and output naming token", () => {
    const sources = [
      readSource("components/tools/LocalToolsClient.tsx"),
      readSource("components/tools/useLocalToolController.ts")
    ].join("\n");
    const toolIds = [
      "image-convert", "image-transform", "image-metadata", "images-pdf",
      "pdf-merge", "pdf-split", "pdf-pages", "pdf-decorate", "media-trim",
      "video-mute", "video-frame", "video-gif", "audio-enhance", "ocr"
    ];

    for (const toolId of toolIds) expect(sources).toContain(`"${toolId}"`);
    for (const acceptToken of ["imageAccept", "pdfAccept", "audioAccept", "videoAccept"]) {
      expect(sources).toContain(acceptToken);
    }
    for (const namingToken of ["converted", "transformed", "metadata-clean", "merged.pdf", "_ocr.docx"]) {
      expect(sources).toContain(namingToken);
    }
  });
});
