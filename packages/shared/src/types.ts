export type ImageMime = "image/jpeg" | "image/png" | "image/webp";
export type ExportImageFormat = "jpg" | "png" | "webp";
export type PdfOutputFormat = "png" | "jpg" | "webp";

export type ProcessState = "idle" | "running" | "done" | "error" | "cancelled";

export interface FileSummary {
  name: string;
  size: number;
  type: string;
  extension: string;
  image?: {
    width: number;
    height: number;
  };
  pdf?: {
    pages: number;
  };
  document?: {
    kind: "word" | "excel";
  };
  media?: {
    kind: "video" | "audio";
    duration?: number;
  };
}

export interface ProgressReporter {
  (progress: number, message?: string): void;
}
