import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const resourceRoot = path.join(repoRoot, "apps", "desktop", "src-tauri", "resources", "ffmpeg");
const binRoot = path.join(resourceRoot, "bin");
const ffmpegPath = path.join(binRoot, "ffmpeg.exe");
const ffprobePath = path.join(binRoot, "ffprobe.exe");
const resultPath = path.join(__dirname, "sidecar-poc-results.json");
const sampleRoot = path.join(__dirname, "samples");
const inputDir = path.join(sampleRoot, "输入 文件夹");
const outputDir = path.join(sampleRoot, "输出 文件夹");

await mkdir(outputDir, { recursive: true });

const result = {
  generatedAt: new Date().toISOString(),
  resourceRoot,
  checks: {
    ffmpegExists: existsSync(ffmpegPath),
    ffprobeExists: existsSync(ffprobePath),
    sha256Matches: null,
    versionCheck: false,
    probeDuration: false,
    mp4ToWebm: false,
    wavToFlac: false,
    chinesePath: false,
    spacedPath: false,
    dDrivePath: repoRoot.toUpperCase().startsWith("D:"),
    corruptedFile: false,
    externalRequests: 0
  },
  status: "pending",
  message: "",
  hashes: {},
  errors: []
};

if (!result.checks.ffmpegExists) {
  result.status = "sidecar_missing";
  result.message = "sidecar 未配置：未找到可信 ffmpeg.exe。本轮只验证目录、命令和 POC 框架，不影响现有 FFmpeg WASM 功能。";
  await writeResult(result);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

result.hashes.ffmpeg = await sha256(ffmpegPath);
if (result.checks.ffprobeExists) result.hashes.ffprobe = await sha256(ffprobePath);
result.checks.sha256Matches = await checkSha256Sums(result.hashes);

const version = await runBinary(ffmpegPath, ["-hide_banner", "-version"]);
result.checks.versionCheck = version.code === 0;
if (version.code !== 0) result.errors.push({ step: "version-check", error: version.stderr });

if (result.checks.ffprobeExists) {
  const wav = path.join(inputDir, "测试 音频.wav");
  if (existsSync(wav)) {
    const probe = await runBinary(ffprobePath, ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", wav]);
    result.checks.probeDuration = probe.code === 0 && Number.parseFloat(probe.stdout) > 0;
    result.checks.chinesePath = result.checks.probeDuration;
    if (probe.code !== 0) result.errors.push({ step: "probe-duration", error: probe.stderr });
  }
}

const spacedWav = path.join(inputDir, "带 空格 文件名.wav");
if (existsSync(spacedWav)) {
  const out = path.join(outputDir, `带 空格 文件名_poc_${Date.now()}.flac`);
  const converted = await runBinary(ffmpegPath, ["-hide_banner", "-nostdin", "-n", "-i", spacedWav, "-vn", "-c:a", "flac", "-compression_level", "5", out]);
  result.checks.wavToFlac = converted.code === 0 && existsSync(out) && statSync(out).size > 0;
  result.checks.spacedPath = result.checks.wavToFlac;
  if (converted.code !== 0) result.errors.push({ step: "wav-to-flac", error: converted.stderr });
}

const mp4 = path.join(inputDir, "测试 视频.mp4");
if (existsSync(mp4)) {
  const out = path.join(outputDir, `测试 视频_poc_${Date.now()}.webm`);
  const converted = await runBinary(ffmpegPath, ["-hide_banner", "-nostdin", "-n", "-i", mp4, "-map", "0:v:0", "-map", "0:a?", "-c:v", "libvpx-vp9", "-b:v", "1200k", "-deadline", "realtime", "-cpu-used", "5", "-c:a", "libopus", "-b:a", "128k", out]);
  result.checks.mp4ToWebm = converted.code === 0 && existsSync(out) && statSync(out).size > 0;
  if (converted.code !== 0) result.errors.push({ step: "mp4-to-webm", error: converted.stderr });
}

const corrupted = path.join(inputDir, "损坏 视频.mp4");
if (existsSync(corrupted)) {
  const out = path.join(outputDir, `损坏 视频_poc_${Date.now()}.webm`);
  const converted = await runBinary(ffmpegPath, ["-hide_banner", "-nostdin", "-n", "-i", corrupted, "-c:v", "libvpx-vp9", out]);
  result.checks.corruptedFile = converted.code !== 0;
}

result.status = result.errors.length ? "failed" : "ok";
result.message = result.errors.length ? "sidecar POC 执行完成，但存在失败项。" : "sidecar POC 执行完成。";
await writeResult(result);
console.log(JSON.stringify(result, null, 2));

async function sha256(file) {
  const data = await readFile(file);
  return createHash("sha256").update(data).digest("hex").toUpperCase();
}

async function checkSha256Sums(hashes) {
  const sumsPath = path.join(resourceRoot, "SHA256SUMS.txt");
  if (!existsSync(sumsPath)) return false;
  const text = await readFile(sumsPath, "utf8");
  if (hashes.ffmpeg && !text.includes(hashes.ffmpeg)) return false;
  if (hashes.ffprobe && !text.includes(hashes.ffprobe)) return false;
  return Boolean(hashes.ffmpeg);
}

function runBinary(file, args) {
  return new Promise((resolve) => {
    const child = spawn(file, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => resolve({ code: -1, stdout, stderr: error.message }));
    child.on("close", (code) => resolve({ code, stdout: trim(stdout), stderr: trim(stderr) }));
  });
}

function trim(value) {
  return value.replace(/\r/g, "").slice(0, 2000);
}

async function writeResult(value) {
  await writeFile(resultPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
