import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  compress: vi.fn()
}));

vi.mock("browser-image-compression", () => ({
  default: mocks.compress
}));

import { addImageWatermark, addTextWatermark, compressImage, resizeImage } from "@doctool/image-core";

const originalImage = globalThis.Image;
const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

class MockImage {
  decoding = "async";
  src = "";
  naturalWidth = 640;
  naturalHeight = 480;

  async decode() {
    return undefined;
  }
}

const context = {
  fillStyle: "",
  font: "",
  globalAlpha: 1,
  imageSmoothingEnabled: false,
  imageSmoothingQuality: "low",
  textBaseline: "alphabetic",
  drawImage: vi.fn(),
  fillText: vi.fn(),
  measureText: (text: string) => ({ width: text.length * 20 }),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  translate: vi.fn()
};

beforeAll(() => {
  Object.defineProperty(globalThis, "Image", {
    value: MockImage,
    configurable: true,
    writable: true
  });
  Object.defineProperty(URL, "createObjectURL", {
    value: vi.fn(() => "blob:local-image"),
    configurable: true,
    writable: true
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: vi.fn(),
    configurable: true,
    writable: true
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: () => context,
    configurable: true
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
    value(callback: BlobCallback, type?: string) {
      callback(new Blob(["converted-image"], { type: type || "image/png" }));
    },
    configurable: true
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  Object.defineProperty(globalThis, "Image", { value: originalImage, configurable: true, writable: true });
  Object.defineProperty(URL, "createObjectURL", { value: originalCreateObjectUrl, configurable: true, writable: true });
  Object.defineProperty(URL, "revokeObjectURL", { value: originalRevokeObjectUrl, configurable: true, writable: true });
});

describe("image-core local conversion", () => {
  it("resizes an image and exports the selected format", async () => {
    const result = await resizeImage(imageFile("source.png"), {
      width: 320,
      height: 240,
      format: "webp",
      quality: 0.86
    });

    expect(result.type).toBe("image/webp");
    expect(context.drawImage).toHaveBeenCalled();
  });

  it("renders text and image watermarks locally", async () => {
    const source = imageFile("source.png");
    const textResult = await addTextWatermark(source, {
      text: "本地授权",
      fontSize: 36,
      color: "#111827",
      opacity: 0.5,
      bold: true,
      rotate: -15,
      position: "bottom-right"
    }, "jpg", 0.9);
    const imageResult = await addImageWatermark(source, {
      watermark: imageFile("watermark.png"),
      scale: 0.2,
      opacity: 0.6,
      rotate: 0,
      position: "center"
    }, "png", 0.9);

    expect(textResult.type).toBe("image/jpeg");
    expect(imageResult.type).toBe("image/png");
    expect(context.fillText).toHaveBeenCalled();
    expect(context.drawImage).toHaveBeenCalled();
  });

  it("passes compression targets to the local compression worker", async () => {
    const compressed = new Blob(["compressed"], { type: "image/jpeg" });
    mocks.compress.mockResolvedValue(compressed);

    const result = await compressImage(imageFile("source.png"), {
      quality: 72,
      targetSizeBytes: 100 * 1024,
      maxWidthOrHeight: 1920,
      keepOriginalSize: false,
      format: "jpg"
    });

    expect(result).toBe(compressed);
    expect(mocks.compress).toHaveBeenCalledWith(expect.any(File), expect.objectContaining({
      useWebWorker: true,
      initialQuality: 0.72,
      maxSizeMB: 100 / 1024,
      maxWidthOrHeight: 1920,
      fileType: "image/jpeg"
    }));
  });

  it("passes the 500KB compression target to the local compression worker", async () => {
    const compressed = new Blob(["compressed-500"], { type: "image/jpeg" });
    mocks.compress.mockResolvedValue(compressed);

    await compressImage(imageFile("source.png"), {
      quality: 72,
      targetSizeBytes: 500 * 1024,
      maxWidthOrHeight: 1920,
      keepOriginalSize: false,
      format: "jpg"
    });

    expect(mocks.compress).toHaveBeenCalledWith(expect.any(File), expect.objectContaining({
      maxSizeMB: 500 / 1024,
      fileType: "image/jpeg"
    }));
  });
});

function imageFile(name: string) {
  return new File(["image"], name, { type: "image/png" });
}
