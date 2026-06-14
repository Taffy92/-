import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const output = resolve(__dirname, "../assets/bgm.wav");

const sampleRate = 48000;
const durationSeconds = 48;
const totalSamples = sampleRate * durationSeconds;
const channels = 2;
const bitsPerSample = 16;
const dataSize = totalSamples * channels * (bitsPerSample / 8);
const buffer = Buffer.alloc(44 + dataSize);

function writeString(offset, value) {
  buffer.write(value, offset, value.length, "ascii");
}

writeString(0, "RIFF");
buffer.writeUInt32LE(36 + dataSize, 4);
writeString(8, "WAVE");
writeString(12, "fmt ");
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
buffer.writeUInt16LE(bitsPerSample, 34);
writeString(36, "data");
buffer.writeUInt32LE(dataSize, 40);

function envelope(t) {
  const fadeIn = Math.min(1, t / 2.5);
  const fadeOut = Math.min(1, (durationSeconds - t) / 3);
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

function pulse(t, beatHz) {
  const phase = (t * beatHz) % 1;
  return phase < 0.09 ? Math.exp(-phase * 22) : 0;
}

for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  const env = envelope(t);
  const pad =
    Math.sin(2 * Math.PI * 110 * t) * 0.14 +
    Math.sin(2 * Math.PI * 164.81 * t) * 0.08 +
    Math.sin(2 * Math.PI * 220 * t) * 0.06;
  const shimmer =
    Math.sin(2 * Math.PI * 440 * t + Math.sin(2 * Math.PI * 0.07 * t) * 0.6) * 0.012 +
    Math.sin(2 * Math.PI * 660 * t) * 0.006;
  const kick = Math.sin(2 * Math.PI * 58 * t) * pulse(t, 1.5) * 0.12;
  const value = Math.max(-1, Math.min(1, (pad + shimmer + kick) * env * 0.3));
  const left = Math.round(value * 32767);
  const right = Math.round((value * 0.96 + shimmer * 0.02) * 32767);
  const offset = 44 + i * channels * 2;
  buffer.writeInt16LE(left, offset);
  buffer.writeInt16LE(right, offset + 2);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, buffer);
console.log(`Generated ${output}`);
