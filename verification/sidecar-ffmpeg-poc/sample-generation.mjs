import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");
const sampleRoot = path.join(repoRoot, "verification", "sidecar-ffmpeg-poc", "samples");
const inputDir = path.join(sampleRoot, "输入 文件夹");
const outputDir = path.join(sampleRoot, "输出 文件夹");

await mkdir(inputDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

await writeFile(path.join(inputDir, "测试 音频.wav"), createWavTone());
await writeFile(path.join(inputDir, "损坏 视频.mp4"), Buffer.from("not a real mp4 file\n", "utf8"));
await writeFile(path.join(inputDir, "带 空格 文件名.wav"), createWavTone(330));

console.log(JSON.stringify({
  status: "ok",
  inputDir,
  outputDir,
  files: [
    "测试 音频.wav",
    "损坏 视频.mp4",
    "带 空格 文件名.wav"
  ]
}, null, 2));

function createWavTone(freq = 440) {
  const sampleRate = 44100;
  const seconds = 1;
  const samples = sampleRate * seconds;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i += 1) {
    const value = Math.round(Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.25 * 32767);
    buffer.writeInt16LE(value, 44 + i * 2);
  }
  return buffer;
}
