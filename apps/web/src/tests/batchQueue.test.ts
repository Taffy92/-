import { describe, expect, it } from "vitest";
import {
  batchHistoryLimit,
  batchModeLabel,
  batchTaskStatusLabel,
  buildBatchLog,
  buildImportSummary,
  createBatchTask,
  filterBatchHistory,
  getBatchCounts,
  getSupportedExtensions,
  isSupportedBatchName,
  mergeBatchHistory,
  parseBatchHistory,
  sanitizeLocalPath,
  toBatchHistoryEntry
} from "../lib/batchQueue";
import type { BatchHistoryEntry } from "../lib/batchQueue";

function file(name: string, size = 128) {
  return new File([new Uint8Array(size)], name, { type: "application/octet-stream" });
}

describe("batch queue helpers", () => {
  it("creates tasks with independent queue state", () => {
    const task = createBatchTask(file("测试图片.jpg"), "compress", "JPG", "D:\\资料\\测试图片.jpg");
    expect(task.fileName).toBe("测试图片.jpg");
    expect(task.status).toBe("queued");
    expect(task.progress).toBe(0);
    expect(task.outputFormat).toBe("JPG");
    expect(task.sourcePath).toContain("D:\\资料");
  });

  it("counts success, failure, running, cancelled and queued tasks", () => {
    const tasks = [
      { ...createBatchTask(file("a.jpg"), "compress", "JPG"), status: "success" as const },
      { ...createBatchTask(file("b.jpg"), "compress", "JPG"), status: "failed" as const },
      { ...createBatchTask(file("c.jpg"), "compress", "JPG"), status: "running" as const },
      { ...createBatchTask(file("d.jpg"), "compress", "JPG"), status: "cancelled" as const },
      createBatchTask(file("e.jpg"), "compress", "JPG")
    ];
    expect(getBatchCounts(tasks)).toEqual({
      total: 5,
      success: 1,
      failed: 1,
      running: 1,
      cancelled: 1,
      queued: 1
    });
  });

  it("supports main offline batch formats", () => {
    expect(isSupportedBatchName("photo.png", "compress")).toBe(true);
    expect(isSupportedBatchName("合同.docx", "word-images")).toBe(true);
    expect(isSupportedBatchName("表格.xlsx", "excel-images")).toBe(true);
    expect(isSupportedBatchName("video.mov", "video-convert")).toBe(true);
    expect(isSupportedBatchName("video.mp4", "video-audio")).toBe(true);
    expect(isSupportedBatchName("audio.flac", "audio-convert")).toBe(true);
    expect(isSupportedBatchName("archive.zip", "compress")).toBe(false);
    expect(getSupportedExtensions("video-audio")).toContain(".mp4");
    expect(batchModeLabel("watermark")).toBe("图片批量加水印");
  });

  it("summarizes folder import counts", () => {
    expect(buildImportSummary(12, 7, "folder")).toEqual({
      total: 12,
      imported: 7,
      skipped: 5,
      source: "folder"
    });
  });

  it("sanitizes Windows and Chinese paths for logs", () => {
    expect(sanitizeLocalPath("D:\\客户资料\\身份证\\图片一.jpg")).toBe("D:/.../图片一.jpg");
    expect(sanitizeLocalPath("C:\\Users\\张三\\Downloads")).toBe("C:/.../Downloads");
  });

  it("exports log without leaking full source paths", () => {
    const task = {
      ...createBatchTask(file("图片一.jpg"), "compress", "JPG", "D:\\客户资料\\身份证\\图片一.jpg"),
      status: "failed" as const,
      backend: "sidecar" as const,
      error: "图片无法解码",
      completedAt: Date.now()
    };
    const log = buildBatchLog([task]);
    expect(log).toContain(batchTaskStatusLabel("failed"));
    expect(log).toContain("图片无法解码");
    expect(log).toContain("后端：sidecar");
    expect(log).toContain("D:/.../图片一.jpg");
    expect(log).not.toContain("客户资料\\身份证");
  });

  it("creates sanitized task history without full sensitive paths", () => {
    const completedAt = Date.now();
    const task = {
      ...createBatchTask(file("客户表格.xlsx", 4096), "excel-images", "PNG", "D:\\客户资料\\合同项目\\客户表格.xlsx"),
      status: "success" as const,
      outputPath: "D:\\输出 目录\\客户表格_sheets.zip",
      resultName: "客户表格_sheets.zip",
      backend: "wasm" as const,
      completedAt
    };
    const history = toBatchHistoryEntry(task);
    expect(history).toMatchObject({
      fileName: "客户表格.xlsx",
      status: "success",
      resultName: "客户表格_sheets.zip",
      backend: "wasm",
      sanitizedSourcePath: "D:/.../客户表格.xlsx",
      sanitizedOutputPath: "D:/.../客户表格_sheets.zip"
    });
    expect(JSON.stringify(history)).not.toContain("客户资料\\合同项目");
    expect(JSON.stringify(history)).not.toContain("输出 目录\\客户表格");
  });

  it("keeps only latest 100 history entries", () => {
    const entries: BatchHistoryEntry[] = Array.from({ length: batchHistoryLimit + 8 }, (_, index) => ({
      id: `task-${index}`,
      fileName: `文件-${index}.jpg`,
      fileType: "image/jpeg",
      fileSize: 1024,
      mode: "compress",
      outputFormat: "JPG",
      resultName: `文件-${index}_compressed.jpg`,
      status: "success",
      createdAt: index,
      completedAt: index,
      durationMs: 1000
    }));
    const history = mergeBatchHistory([], entries);
    expect(history).toHaveLength(batchHistoryLimit);
    expect(history[0].id).toBe(`task-${batchHistoryLimit + 7}`);
    expect(history.at(-1)?.id).toBe("task-8");
  });

  it("filters and parses persisted history", () => {
    const history = mergeBatchHistory([], [
      {
        id: "ok",
        fileName: "ok.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        mode: "compress",
        outputFormat: "JPG",
        status: "success",
        createdAt: 1,
        completedAt: 2,
        durationMs: 1
      },
      {
        id: "bad",
        fileName: "bad.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        mode: "compress",
        outputFormat: "JPG",
        status: "failed",
        error: "图片无法解码",
        createdAt: 3,
        completedAt: 4,
        durationMs: 1
      }
    ]);
    expect(filterBatchHistory(history, "failed").map((item) => item.id)).toEqual(["bad"]);
    expect(parseBatchHistory(JSON.stringify(history))).toHaveLength(2);
    expect(parseBatchHistory("not-json")).toEqual([]);
    expect(parseBatchHistory(JSON.stringify([{ id: "incomplete" }]))).toEqual([]);
  });
});
