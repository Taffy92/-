export type BatchMode = "compress" | "watermark" | "word-images" | "excel-images" | "video-convert" | "audio-convert" | "video-audio";

export type BatchTaskStatus = "queued" | "running" | "success" | "failed" | "cancelled";

export type BatchTask = {
  id: string;
  file: File;
  fileName: string;
  sourcePath?: string;
  fileType: string;
  fileSize: number;
  mode: BatchMode;
  outputFormat: string;
  outputPath?: string;
  resultName?: string;
  backend?: "wasm" | "sidecar";
  progress: number;
  status: BatchTaskStatus;
  error?: string;
  createdAt: number;
  completedAt?: number;
};

export type BatchHistoryStatus = Extract<BatchTaskStatus, "success" | "failed" | "cancelled">;

export type BatchHistoryEntry = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mode: BatchMode;
  outputFormat: string;
  sanitizedSourcePath?: string;
  sanitizedOutputPath?: string;
  resultName?: string;
  backend?: "wasm" | "sidecar";
  status: BatchHistoryStatus;
  error?: string;
  createdAt: number;
  completedAt: number;
  durationMs: number;
};

export type BatchHistoryFilter = "all" | BatchHistoryStatus;

export type BatchImportSummary = {
  imported: number;
  skipped: number;
  total: number;
  source: "files" | "folder";
};

export type BatchOutputDirectory =
  | { kind: "download"; label: string }
  | { kind: "tauri"; label: string; path: string }
  | { kind: "browser"; label: string; handle: any };

export const batchHistoryLimit = 100;
export const batchHistoryStorageKey = "format-converter.desktop.batch-history.v1";

const modeExtensions: Record<BatchMode, string[]> = {
  compress: [".jpg", ".jpeg", ".png", ".webp"],
  watermark: [".jpg", ".jpeg", ".png", ".webp", ".bmp"],
  "word-images": [".docx"],
  "excel-images": [".xlsx", ".csv"],
  "video-convert": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
  "audio-convert": [".mp3", ".wav", ".aac", ".m4a", ".flac"],
  "video-audio": [".mp4", ".mov", ".avi", ".mkv", ".webm"]
};

export function getSupportedExtensions(mode: BatchMode) {
  return modeExtensions[mode];
}

export function isSupportedBatchName(name: string, mode: BatchMode) {
  const lower = name.toLowerCase();
  return modeExtensions[mode].some((extension) => lower.endsWith(extension));
}

export function createBatchTask(file: File, mode: BatchMode, outputFormat: string, sourcePath?: string): BatchTask {
  const createdAt = Date.now();
  return {
    id: makeBatchTaskId(file, createdAt),
    file,
    fileName: file.name,
    sourcePath,
    fileType: file.type || extensionOf(file.name).replace(".", "").toUpperCase() || "未知",
    fileSize: file.size,
    mode,
    outputFormat,
    progress: 0,
    status: "queued",
    createdAt
  };
}

export function getBatchCounts(tasks: BatchTask[]) {
  return tasks.reduce(
    (counts, task) => {
      counts.total += 1;
      if (task.status === "success") counts.success += 1;
      if (task.status === "failed") counts.failed += 1;
      if (task.status === "running") counts.running += 1;
      if (task.status === "cancelled") counts.cancelled += 1;
      if (task.status === "queued") counts.queued += 1;
      return counts;
    },
    { total: 0, success: 0, failed: 0, running: 0, cancelled: 0, queued: 0 }
  );
}

export function sanitizeLocalPath(value?: string) {
  if (!value) return "";
  const normalized = value.replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  const last = parts.at(-1) || normalized;
  const drive = /^[A-Za-z]:/.test(value) ? value.slice(0, 2) : "";
  return drive ? `${drive}/.../${last}` : `.../${last}`;
}

export function buildImportSummary(total: number, imported: number, source: BatchImportSummary["source"]): BatchImportSummary {
  return {
    total,
    imported,
    skipped: Math.max(0, total - imported),
    source
  };
}

export function batchTaskStatusLabel(status: BatchTaskStatus) {
  const labels: Record<BatchTaskStatus, string> = {
    queued: "等待中",
    running: "处理中",
    success: "成功",
    failed: "失败",
    cancelled: "已取消"
  };
  return labels[status];
}

export function batchModeLabel(mode: BatchMode) {
  const labels: Record<BatchMode, string> = {
    compress: "图片批量压缩",
    watermark: "图片批量加水印",
    "word-images": "Word 批量转图片",
    "excel-images": "Excel 批量转图片",
    "video-convert": "视频批量转换",
    "audio-convert": "音频批量转换",
    "video-audio": "视频批量提取音频"
  };
  return labels[mode];
}

export function buildBatchLog(tasks: BatchTask[]) {
  return tasks.map((task) => {
    const source = task.sourcePath ? sanitizeLocalPath(task.sourcePath) : task.fileName;
    const output = task.outputPath ? sanitizeLocalPath(task.outputPath) : task.resultName || "-";
    const backend = task.backend ? ` | 后端：${task.backend === "sidecar" ? "sidecar" : "WASM"}` : "";
    const error = task.error ? ` | 失败原因：${task.error}` : "";
    return `[${new Date(task.completedAt || task.createdAt).toLocaleString()}] ${batchTaskStatusLabel(task.status)} | ${task.fileName} | 来源：${source} | 输出：${output}${backend}${error}`;
  }).join("\n");
}

export function toBatchHistoryEntry(task: BatchTask): BatchHistoryEntry | null {
  if (task.status !== "success" && task.status !== "failed" && task.status !== "cancelled") return null;
  const completedAt = task.completedAt || Date.now();
  return {
    id: task.id,
    fileName: task.fileName,
    fileType: task.fileType,
    fileSize: task.fileSize,
    mode: task.mode,
    outputFormat: task.outputFormat,
    sanitizedSourcePath: task.sourcePath ? sanitizeLocalPath(task.sourcePath) : undefined,
    sanitizedOutputPath: task.outputPath ? sanitizeLocalPath(task.outputPath) : undefined,
    resultName: task.resultName,
    backend: task.backend,
    status: task.status,
    error: task.error,
    createdAt: task.createdAt,
    completedAt,
    durationMs: Math.max(0, completedAt - task.createdAt)
  };
}

export function mergeBatchHistory(current: BatchHistoryEntry[], entries: BatchHistoryEntry | BatchHistoryEntry[]) {
  const incoming = Array.isArray(entries) ? entries : [entries];
  const byId = new Map<string, BatchHistoryEntry>();
  for (const item of current) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return Array.from(byId.values())
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, batchHistoryLimit);
}

export function filterBatchHistory(history: BatchHistoryEntry[], filter: BatchHistoryFilter) {
  if (filter === "all") return history;
  return history.filter((item) => item.status === filter);
}

export function parseBatchHistory(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isBatchHistoryEntry)
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, batchHistoryLimit);
  } catch {
    return [];
  }
}

export function defaultOutputDirectory(): BatchOutputDirectory {
  return { kind: "download", label: "默认下载目录" };
}

function isBatchHistoryEntry(value: unknown): value is BatchHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BatchHistoryEntry>;
  return typeof item.id === "string"
    && typeof item.fileName === "string"
    && typeof item.fileType === "string"
    && typeof item.fileSize === "number"
    && typeof item.mode === "string"
    && typeof item.outputFormat === "string"
    && (item.status === "success" || item.status === "failed" || item.status === "cancelled")
    && typeof item.createdAt === "number"
    && typeof item.completedAt === "number"
    && typeof item.durationMs === "number";
}

function makeBatchTaskId(file: File, createdAt: number) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${createdAt}-${file.name}-${file.size}`.replace(/[^\w.-]+/g, "-");
}

function extensionOf(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}
