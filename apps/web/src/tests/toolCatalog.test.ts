import { describe, expect, it } from "vitest";
import {
  getUnifiedToolCategory,
  getUnifiedToolHref,
  unifiedToolCategories,
  unifiedTools
} from "../config/toolCatalog";

const expectedToolIds = [
  "image-convert",
  "crop",
  "resize",
  "watermark",
  "compress",
  "image-transform",
  "image-metadata",
  "pdf-images",
  "images-pdf",
  "pdf-merge",
  "pdf-split",
  "pdf-pages",
  "pdf-decorate",
  "word-images",
  "excel-images",
  "video-convert",
  "audio-convert",
  "video-audio",
  "media-trim",
  "video-mute",
  "video-frame",
  "video-gif",
  "audio-enhance",
  "ocr"
] as const;

describe("unified online and offline tool catalog", () => {
  it("publishes five task categories and exactly 24 unique real tools", () => {
    expect(unifiedToolCategories.map((category) => category.id)).toEqual([
      "image",
      "pdf",
      "document",
      "media",
      "ocr"
    ]);
    expect(unifiedTools.map((tool) => tool.id)).toEqual(expectedToolIds);
    expect(new Set(unifiedTools.map((tool) => tool.id)).size).toBe(24);
  });

  it("routes every tool to an implemented online or local-processing surface", () => {
    for (const tool of unifiedTools) {
      expect(["tools", "local-tools"]).toContain(tool.route);
      expect(getUnifiedToolHref(tool)).toBe(`/${tool.route}?tool=${tool.id}`);
      expect(getUnifiedToolCategory(tool.id)?.tools).toContain(tool);
      expect(tool.label).not.toContain("增强工具");
    }
  });
});
