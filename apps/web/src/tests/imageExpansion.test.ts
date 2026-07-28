import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  convertImage,
  normalizeExifMetadata,
  stripImageMetadata,
  transformImage
} from "@doctool/image-core";

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
  drawImage: vi.fn(),
  imageSmoothingEnabled: false,
  imageSmoothingQuality: "low",
  rotate: vi.fn(),
  scale: vi.fn(),
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

describe("image-core expansion tools", () => {
  it("converts images to the selected local output format", async () => {
    const result = await convertImage(imageFile("source.bmp", "image/bmp"), {
      format: "webp",
      quality: 0.88
    });

    expect(result.type).toBe("image/webp");
    expect(context.drawImage).toHaveBeenCalled();
  });

  it("swaps canvas dimensions when rotating 90 degrees", async () => {
    const result = await transformImage(imageFile("source.jpg", "image/jpeg"), {
      rotation: 90,
      flipHorizontal: false,
      flipVertical: false,
      format: "png",
      quality: 0.92
    });

    expect(result.blob.type).toBe("image/png");
    expect(result.width).toBe(480);
    expect(result.height).toBe(640);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
  });

  it("re-encodes an auto-oriented image without carrying metadata", async () => {
    const result = await stripImageMetadata(imageFile("camera.jpg", "image/jpeg"), {
      format: "jpg",
      quality: 0.94
    });

    expect(result.type).toBe("image/jpeg");
    expect(context.drawImage).toHaveBeenCalled();
  });

  it("normalizes common EXIF fields without exposing unknown binary values", () => {
    const metadata = normalizeExifMetadata({
      DateTimeOriginal: new Date("2026-07-28T10:00:00.000Z"),
      Make: "Local Camera",
      Model: "LC-1",
      Software: "Camera Firmware",
      latitude: 31.2304,
      longitude: 121.4737,
      Orientation: 6,
      ExifImageWidth: 4000,
      ExifImageHeight: 3000,
      MakerNote: new Uint8Array([1, 2, 3])
    }, { width: 4000, height: 3000 });

    expect(metadata.camera).toBe("Local Camera LC-1");
    expect(metadata.software).toBe("Camera Firmware");
    expect(metadata.gps).toBe("31.230400, 121.473700");
    expect(metadata.orientation).toBe("6（右转 90°）");
    expect(metadata.dimensions).toBe("4000 × 3000");
    expect(JSON.stringify(metadata)).not.toContain("MakerNote");
  });
});

function imageFile(name: string, type: string) {
  return new File(["image"], name, { type });
}
