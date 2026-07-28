import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");
const localToolsPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "LocalToolsClient.tsx");
const localToolsSource = readFileSync(localToolsPath, "utf8");

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
    expect(localToolsSource).toContain("saveDesktopOutputs");
    expect(localToolsSource).toContain("createDir(batchRoot");
    expect(localToolsSource).toContain("folder: safeBaseName(first.name)");
    expect(localToolsSource).not.toMatch(/\.zip|\.7z|JSZip/);
  });

  it("does not add file upload code to the new processing surface", () => {
    expect(localToolsSource).not.toContain("FormData");
    expect(localToolsSource).not.toMatch(/fetch\(["'`]https?:\/\//);
    expect(localToolsSource).not.toContain("XMLHttpRequest");
  });
});
