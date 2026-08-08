import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { toPublicConversionError } from "../lib/conversion";
import {
  createSidecarConversionFailure,
  selectMediaConversionBackend
} from "../lib/sidecarFfmpeg";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(process.cwd(), "..", "..");
const fixtureRoot = resolve(process.cwd(), "src/test-fixtures/conversion/media");
const ffmpeg = resolve(projectRoot, "apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe");
const ffprobe = resolve(projectRoot, "apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe");
const toolsSource = readFileSync(resolve(process.cwd(), "src/components/tools/ToolsClient.tsx"), "utf8");
const ready = { status: "sidecar_ready", sha256Verified: true };
const tauriOutput = { kind: "tauri" as const, path: "D:\\output", label: "D:/output" };
let temporaryRoot = "";

beforeAll(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "mrx-media-integration-"));
});

afterAll(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
});

describe("real media conversion behavior", () => {
  it("probes duration, dimensions and audio tracks from generated fixtures", async () => {
    const video = await probe(resolve(fixtureRoot, "video-with-audio.mp4"));
    const silentVideo = await probe(resolve(fixtureRoot, "video-no-audio.webm"));
    const audio = await probe(resolve(fixtureRoot, "stereo.flac"));

    expect(Number(video.format.duration)).toBeCloseTo(3, 1);
    expect(video.streams).toEqual(expect.arrayContaining([
      expect.objectContaining({ codec_type: "video", width: 320, height: 240 }),
      expect.objectContaining({ codec_type: "audio" })
    ]));
    expect(silentVideo.streams.some((stream) => stream.codec_type === "audio")).toBe(false);
    expect(audio.streams).toEqual(expect.arrayContaining([
      expect.objectContaining({ codec_type: "audio", channels: 2 })
    ]));
  });

  it("encodes a playable WebM locally and preserves its audio track", async () => {
    const outputPath = resolve(temporaryRoot, "encoded.webm");
    await execFileAsync(ffmpeg, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      resolve(fixtureRoot, "video-with-audio.mp4"),
      "-c:v",
      "libvpx-vp9",
      "-threads",
      "1",
      "-crf",
      "38",
      "-b:v",
      "0",
      "-c:a",
      "libopus",
      outputPath
    ], { timeout: 60_000, windowsHide: true });

    const encoded = await probe(outputPath);
    expect(Number(encoded.format.duration)).toBeCloseTo(3, 1);
    expect(encoded.streams).toEqual(expect.arrayContaining([
      expect.objectContaining({ codec_type: "video", width: 320, height: 240 }),
      expect.objectContaining({ codec_type: "audio" })
    ]));
  }, 70_000);

  it("routes only eligible desktop files to sidecar and otherwise uses WASM", () => {
    const base = {
      enabled: true,
      status: ready,
      outputDirectory: tauriOutput,
      sourcePath: "D:\\input\\video.mp4",
      mode: "video-convert" as const,
      fileName: "video.mp4",
      videoFormat: "webm"
    };

    expect(selectMediaConversionBackend({ ...base, isDesktopSurface: true })).toBe("sidecar");
    expect(selectMediaConversionBackend({ ...base, isDesktopSurface: false })).toBe("wasm");
    expect(selectMediaConversionBackend({ ...base, isDesktopSurface: true, sourcePath: undefined })).toBe("wasm");
    expect(selectMediaConversionBackend({ ...base, isDesktopSurface: true, enabled: false })).toBe("wasm");
  });

  it("normalizes sidecar failures without exposing process diagnostics", () => {
    const failure = createSidecarConversionFailure({
      status: "failed",
      mode: "convert-video-sidecar",
      message: "failed at D:\\Customers\\private.mp4",
      stderrPreview: "stack and codec internals"
    });
    const publicError = toPublicConversionError(failure);

    expect(publicError).toEqual({
      code: "conversion-failed",
      stage: "conversion",
      backend: "sidecar",
      message: "本地媒体转换失败",
      action: "请关闭 sidecar 优先处理并改用 FFmpeg WASM 重试"
    });
    expect(JSON.stringify(publicError)).not.toMatch(/Customers|private\.mp4|stderr|stack/i);
  });

  it("keeps per-file batch failures inside the loop and continues later tasks", () => {
    const runBatch = toolsSource.slice(
      toolsSource.indexOf("async function runBatch("),
      toolsSource.indexOf("async function processBatchTask(")
    );

    expect(runBatch).toContain("for (const [index, task] of tasks.entries())");
    expect(runBatch).toContain("try {");
    expect(runBatch).toContain("} catch (reason) {");
    expect(runBatch).toContain('status: cancelRef.current ? "cancelled" : "failed"');
    expect(runBatch).toContain("if (cancelRef.current) throw reason;");
    expect(runBatch).not.toContain("break;");
  });
});

type ProbeResult = {
  streams: Array<{ codec_type: string; width?: number; height?: number; channels?: number }>;
  format: { duration?: string };
};

async function probe(path: string): Promise<ProbeResult> {
  const { stdout } = await execFileAsync(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,width,height,channels:format=duration",
    "-of",
    "json",
    path
  ], { timeout: 30_000, windowsHide: true });
  return JSON.parse(stdout);
}
