export type ConversionTaskStatus =
  | "queued"
  | "inspecting"
  | "ready"
  | "running"
  | "writing"
  | "completed"
  | "failed"
  | "cancelled";

export type ConversionFamily = "image" | "pdf" | "office" | "media" | "ocr";

export type ConversionSurface = "web" | "desktop";

export type ConversionBackend = "browser" | "libreoffice" | "sidecar";

export type ConversionErrorStage = "inspection" | "conversion" | "writing";

export type ConversionErrorCode =
  | "invalid-input"
  | "unsupported-input"
  | "backend-unavailable"
  | "conversion-failed"
  | "write-failed"
  | "cancelled"
  | "unknown";

export type PublicConversionError = Readonly<{
  code: ConversionErrorCode;
  stage: ConversionErrorStage;
  backend: ConversionBackend;
  message: string;
  action: string;
}>;

export type ConversionTask = Readonly<{
  id: string;
  family: ConversionFamily;
  surface: ConversionSurface;
  status: ConversionTaskStatus;
}>;

export type ConversionBackendRequest = Readonly<{
  family: ConversionFamily;
  surface: ConversionSurface;
  hasLocalPath: boolean;
  sidecarReady: boolean;
}>;
