import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const tempDir = path.join(projectRoot, "verification", "offline-smoke", "tmp-batch-stability");
const evidenceDir = path.join(projectRoot, "verification", "offline-smoke", "evidence");
await mkdir(tempDir, { recursive: true });
await mkdir(evidenceDir, { recursive: true });

const result = {
  generatedAt: new Date().toISOString(),
  note: "This script creates controlled local stress fixtures and removes large files after recording metadata. It does not upload files or call remote APIs.",
  fixtures: [],
  pathCases: [
    { name: "D drive path", path: "D:\\万能格式转换器项目\\verification\\offline-smoke\\tmp-batch-stability" },
    { name: "Chinese path", path: "D:\\客户资料\\格式转换\\输出目录" },
    { name: "Path with spaces", path: "D:\\Format Converter Test\\output folder" },
    { name: "Long path", path: `D:\\${"长路径".repeat(40)}\\输出` },
    { name: "Missing output directory", path: "D:\\不存在的输出目录\\batch-result" },
    { name: "Restricted output directory", path: "C:\\Windows\\System32\\config" }
  ],
  privacy: {
    externalNetworkRequests: 0,
    uploadsAttempted: false,
    localOnly: true
  },
  cleanup: "pending"
};

try {
  await createJpegWithComments(path.join(tempDir, "5MB_中文文件名_压缩测试.jpg"), 5 * 1024 * 1024);
  await createPngWithTextPayload(path.join(tempDir, "10MB_表格截图_压缩测试.png"), 10 * 1024 * 1024);
  await createLargeDimensionPng(path.join(tempDir, "大分辨率_2500x2500.png"), 2500, 2500);
  await writeFile(path.join(tempDir, "损坏图片.jpg"), Buffer.from([0xff, 0xd8, 0x00, 0x11, 0x22]));
  await writeFile(path.join(tempDir, `${"长文件名_".repeat(18)}.jpg`), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  await createWav(path.join(tempDir, "WAV 转 MP3_30秒.wav"), 30);
  await writeFile(path.join(tempDir, "损坏视频.mp4"), Buffer.from("not-a-real-video"));
  await writeFile(path.join(tempDir, "损坏文档.docx"), Buffer.from("not-a-real-docx"));
  await writeFile(path.join(tempDir, "损坏表格.xlsx"), Buffer.from("not-a-real-xlsx"));

  for (const fileName of await readdirSafe(tempDir)) {
    const filePath = path.join(tempDir, fileName);
    const info = await stat(filePath);
    result.fixtures.push({
      fileName,
      fileSize: info.size,
      inputFormat: path.extname(fileName).slice(1).toUpperCase() || "UNKNOWN",
      outputFormat: suggestedOutputFormat(fileName),
      expected: expectedOutcome(fileName),
      memoryRisk: info.size > 8 * 1024 * 1024 || fileName.includes("大分辨率") ? "需要分批处理并观察内存占用" : "低",
      externalNetworkRequests: 0
    });
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
  result.cleanup = "removed temporary stress fixtures";
  await writeFile(path.join(evidenceDir, "batch-stability-stress-result.json"), JSON.stringify(result, null, 2), "utf8");
}

async function readdirSafe(directory) {
  const { readdir } = await import("node:fs/promises");
  return readdir(directory);
}

async function createJpegWithComments(filePath, targetBytes) {
  const minimalJpeg = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z", "base64");
  const parts = [minimalJpeg.subarray(0, 2)];
  let remaining = Math.max(0, targetBytes - minimalJpeg.length);
  while (remaining > 0) {
    const payloadSize = Math.min(remaining, 65520);
    const chunk = Buffer.alloc(payloadSize + 4, 0x41);
    chunk[0] = 0xff;
    chunk[1] = 0xfe;
    chunk.writeUInt16BE(payloadSize + 2, 2);
    parts.push(chunk);
    remaining -= chunk.length;
  }
  parts.push(minimalJpeg.subarray(2));
  await writeFile(filePath, Buffer.concat(parts));
}

async function createPngWithTextPayload(filePath, targetBytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0);
  ihdrData.writeUInt32BE(1, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const idatData = deflateSync(Buffer.from([0, 0, 0, 0, 0]));
  const padding = Buffer.alloc(Math.max(1024, targetBytes - 256), 0x61);
  await writeFile(filePath, Buffer.concat([
    signature,
    pngChunk("IHDR", ihdrData),
    pngChunk("tEXt", Buffer.concat([Buffer.from("local-only\0"), padding])),
    pngChunk("IDAT", idatData),
    pngChunk("IEND", Buffer.alloc(0))
  ]));
}

async function createLargeDimensionPng(filePath, width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  const row = Buffer.alloc(width * 3 + 1, 240);
  row[0] = 0;
  const rows = Array.from({ length: height }, () => row);
  await writeFile(filePath, Buffer.concat([
    signature,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", deflateSync(Buffer.concat(rows), { level: 1 })),
    pngChunk("IEND", Buffer.alloc(0))
  ]));
}

async function createWav(filePath, seconds) {
  const sampleRate = 44100;
  const samples = sampleRate * seconds;
  const dataSize = samples * 2;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  const data = Buffer.alloc(dataSize);
  for (let i = 0; i < samples; i += 1) {
    const sample = Math.round(Math.sin((i / sampleRate) * Math.PI * 2 * 440) * 16000);
    data.writeInt16LE(sample, i * 2);
  }
  await writeFile(filePath, Buffer.concat([header, data]));
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function suggestedOutputFormat(fileName) {
  const lower = fileName.toLowerCase();
  if (/\.(jpg|jpeg|png|webp)$/.test(lower)) return "JPG";
  if (lower.endsWith(".wav")) return "MP3";
  if (lower.endsWith(".mp4")) return "MP4/AAC";
  if (lower.endsWith(".docx") || lower.endsWith(".xlsx")) return "PNG";
  return "N/A";
}

function expectedOutcome(fileName) {
  if (fileName.includes("损坏")) return "应仅当前任务失败，队列继续，记录失败原因";
  if (fileName.includes("长文件名") || fileName.includes("中文")) return "应成功处理，输出文件名安全化";
  if (fileName.includes("大分辨率") || fileName.includes("10MB")) return "应提示内存风险，必要时分批处理";
  return "应成功或进入可重试失败状态";
}
