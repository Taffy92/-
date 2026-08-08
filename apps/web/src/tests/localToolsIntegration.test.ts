import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");
const localToolsPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "LocalToolsClient.tsx");
const localToolsSource = readFileSync(localToolsPath, "utf8");
const localToolControllerSource = readFileSync(
  resolve(projectRoot, "apps", "web", "src", "components", "tools", "useLocalToolController.ts"),
  "utf8"
);
const localToolsProcessingSource = `${localToolsSource}\n${localToolControllerSource}`;

describe("online and offline local tools integration", () => {
  it("exposes the approved image, PDF, media and OCR tools", () => {
    for (const toolId of [
      "image-convert",
      "image-transform",
      "image-metadata",
      "images-pdf",
      "pdf-merge",
      "pdf-split",
      "pdf-pages",
      "pdf-decorate",
      "media-trim",
      "video-mute",
      "video-frame",
      "video-gif",
      "audio-enhance",
      "ocr"
    ]) {
      expect(localToolsSource).toContain(`"${toolId}"`);
    }
  });

  it("keeps OCR worker, core and language files bundled on same-origin paths", () => {
    for (const asset of [
      "apps/web/public/ocr/worker.min.js",
      "apps/web/public/ocr/core/tesseract-core-simd-lstm.wasm.js",
      "apps/web/public/ocr/lang/chi_sim.traineddata.gz",
      "apps/web/public/ocr/lang/eng.traineddata.gz"
    ]) {
      expect(existsSync(resolve(projectRoot, asset))).toBe(true);
    }
  });

  it("writes offline batches and multi-page outputs to folders without archives", () => {
    expect(localToolControllerSource).toContain("saveDesktopOutputs");
    expect(localToolControllerSource).toContain("createDir(batchRoot");
    expect(localToolControllerSource).toContain("folder: safeBaseName(first.name)");
    expect(localToolsProcessingSource).not.toMatch(/\.zip|\.7z|JSZip/);
  });

  it("does not add file upload code to the new processing surface", () => {
    expect(localToolsProcessingSource).not.toContain("FormData");
    expect(localToolsProcessingSource).not.toMatch(/fetch\(["'`]https?:\/\//);
    expect(localToolsProcessingSource).not.toContain("XMLHttpRequest");
  });
});
