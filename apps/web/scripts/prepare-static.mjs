import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const publicRoot = path.join(repoRoot, "public");
const appPublic = path.join(appRoot, "public");

await mkdir(appPublic, { recursive: true });

for (const dir of ["wasm", "pdfjs", "ffmpeg", "icons", "samples"]) {
  await copyDirIfExists(path.join(publicRoot, dir), path.join(appPublic, dir));
}

await copyFirstExisting(
  [
    path.join(repoRoot, "node_modules/pdfjs-dist/build/pdf.mjs"),
    path.join(appRoot, "node_modules/pdfjs-dist/build/pdf.mjs")
  ],
  path.join(appPublic, "pdfjs/pdf.mjs")
);

await copyFirstExisting(
  [
    path.join(repoRoot, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
    path.join(appRoot, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs")
  ],
  path.join(appPublic, "pdfjs/pdf.worker.min.mjs")
);

await copyDirIfExists(firstExistingDir([
  path.join(repoRoot, "node_modules/pdfjs-dist/cmaps"),
  path.join(appRoot, "node_modules/pdfjs-dist/cmaps")
]), path.join(appPublic, "pdfjs/cmaps"));

await copyDirIfExists(firstExistingDir([
  path.join(repoRoot, "node_modules/pdfjs-dist/standard_fonts"),
  path.join(appRoot, "node_modules/pdfjs-dist/standard_fonts")
]), path.join(appPublic, "pdfjs/standard_fonts"));

await copyFfmpegCoreFiles();
await copyBrowserImageCompressionWorker();
await copyOcrAssets();

async function copyDirIfExists(src, dest) {
  if (!src || !existsSync(src)) return;
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true, force: true });
}

async function copyFirstExisting(candidates, dest) {
  const src = candidates.find((candidate) => existsSync(candidate));
  if (!src) return;
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { force: true });
}

function firstExistingDir(candidates) {
  return candidates.find((candidate) => existsSync(candidate));
}

async function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) files.push(...await listFiles(full));
    else files.push(full);
  }
  return files;
}

async function copyFfmpegCoreFiles() {
  const pnpmCoreDir = await findPnpmPackageDir("@ffmpeg/core");
  const dirs = [
    path.join(repoRoot, "node_modules/@ffmpeg/core/dist/umd"),
    path.join(appRoot, "node_modules/@ffmpeg/core/dist/umd"),
    pnpmCoreDir ? path.join(pnpmCoreDir, "dist/umd") : undefined
  ].filter(Boolean);
  const src = dirs.find((dir) => existsSync(dir));
  if (!src) {
    console.warn("[prepare-static] FFmpeg WASM files are not bundled yet. Install @ffmpeg/core before production/offline packaging.");
    return;
  }
  await mkdir(path.join(appPublic, "ffmpeg"), { recursive: true });
  for (const name of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
    await copyFirstExisting([path.join(src, name)], path.join(appPublic, "ffmpeg", name));
  }
}

async function copyBrowserImageCompressionWorker() {
  const pnpmPackageDir = await findPnpmPackageDir("browser-image-compression");
  await copyFirstExisting(
    [
      path.join(repoRoot, "node_modules/browser-image-compression/dist/browser-image-compression.js"),
      path.join(appRoot, "node_modules/browser-image-compression/dist/browser-image-compression.js"),
      pnpmPackageDir ? path.join(pnpmPackageDir, "dist/browser-image-compression.js") : undefined
    ].filter(Boolean),
    path.join(appPublic, "vendor/browser-image-compression/browser-image-compression.js")
  );
}

async function copyOcrAssets() {
  const tesseractDir = await findPnpmPackageDir("tesseract.js");
  const coreDir = await findPnpmPackageDir("tesseract.js-core");
  const chineseDataDir = await findPnpmPackageDir("@tesseract.js-data/chi_sim");
  const englishDataDir = await findPnpmPackageDir("@tesseract.js-data/eng");
  if (!tesseractDir || !coreDir || !chineseDataDir || !englishDataDir) {
    console.warn("[prepare-static] OCR assets are incomplete. Install tesseract.js and local language packages before building.");
    return;
  }

  await copyFirstExisting(
    [path.join(tesseractDir, "dist/worker.min.js")],
    path.join(appPublic, "ocr/worker.min.js")
  );
  const coreOutputDir = path.join(appPublic, "ocr/core");
  await rm(coreOutputDir, { recursive: true, force: true });
  await mkdir(coreOutputDir, { recursive: true });
  for (const name of [
    "tesseract-core-lstm.wasm.js",
    "tesseract-core-simd-lstm.wasm.js",
    "tesseract-core-relaxedsimd-lstm.wasm.js",
    "LICENSE"
  ]) {
    await copyFirstExisting([path.join(coreDir, name)], path.join(coreOutputDir, name));
  }
  await copyFirstExisting(
    [path.join(chineseDataDir, "4.0.0_best_int/chi_sim.traineddata.gz")],
    path.join(appPublic, "ocr/lang/chi_sim.traineddata.gz")
  );
  await copyFirstExisting(
    [path.join(englishDataDir, "4.0.0_best_int/eng.traineddata.gz")],
    path.join(appPublic, "ocr/lang/eng.traineddata.gz")
  );
}

async function findPnpmPackageDir(packageName) {
  const pnpmDir = path.join(repoRoot, "node_modules/.pnpm");
  if (!existsSync(pnpmDir)) return undefined;
  const entries = await readdir(pnpmDir);
  const normalized = packageName.replace("/", "+");
  const match = entries.find((entry) => entry.startsWith(`${normalized}@`) || entry.startsWith(`${packageName}@`));
  if (!match) return undefined;
  return path.join(pnpmDir, match, "node_modules", packageName);
}
