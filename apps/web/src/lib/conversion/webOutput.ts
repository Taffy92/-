import type { ConversionResourceScope } from "./resources";

type ObjectUrlFactory = Readonly<{
  createObjectURL(blob: Blob): string;
}>;

export type WebConversionOutput = Readonly<{
  blob: Blob;
  name: string;
  objectUrl: string;
}>;

export function createWebOutput(
  blob: Blob,
  name: string,
  resources: ConversionResourceScope,
  objectUrls: ObjectUrlFactory = URL
): WebConversionOutput {
  const objectUrl = resources.trackObjectUrl(objectUrls.createObjectURL(blob));
  return { blob, name, objectUrl };
}
