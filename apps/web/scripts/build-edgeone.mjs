import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const outDir = path.join(appRoot, "out");
const nextBin = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");
const maxEdgeOneFileSize = 25 * 1024 * 1024;
const wasmPartSize = 16 * 1024 * 1024;
const installerPartSize = 16 * 1024 * 1024;
const releaseVersion = "1.0.0";
const releaseInstallerDir = path.resolve(appRoot, "..", "..", "release", `v${releaseVersion}`, "installers");
const edgeOneReleaseDir = path.join(outDir, "release", `v${releaseVersion}`, "edgeone");
const cloudFunctionsDir = path.join(appRoot, "cloud-functions");
const edgeOneCloudFunctionsDir = path.join(outDir, "cloud-functions");
const installerPackages = [
  {
    type: "exe",
    fileName: "万能格式转换离线专业版_1.0.0_x64-setup.exe",
    sha256: "E2A03FDDE5907DD0462FF76C4A440869201B82A71533E82FD0EB25E2826D5564",
    contentType: "application/vnd.microsoft.portable-executable"
  },
  {
    type: "msi",
    fileName: "万能格式转换离线专业版_1.0.0_x64_zh-CN.msi",
    sha256: "17B59355E550C5295CF3B9383E4391F57D1789AF1F2783302B483663555C850C",
    contentType: "application/x-msi"
  }
];
const wasmPartUrls = [
  "/ffmpeg/ffmpeg-core.wasm.part1",
  "/ffmpeg/ffmpeg-core.wasm.part2"
];

await import("./prepare-static.mjs");
await rm(path.join(appRoot, ".next"), { recursive: true, force: true });
await rm(outDir, { recursive: true, force: true });

const child = spawn(process.execPath, [nextBin, "build"], {
  cwd: appRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_MODE: "web",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://gszhmrx.cn",
    NEXT_PUBLIC_FFMPEG_WASM_PARTS: wasmPartUrls.join(",")
  },
  stdio: "inherit"
});

const code = await new Promise((resolve) => {
  child.on("close", resolve);
  child.on("error", () => resolve(1));
});

if (code !== 0) process.exit(Number(code) || 1);

const wasmPath = path.join(outDir, "ffmpeg", "ffmpeg-core.wasm");
const wasmBytes = await readFile(wasmPath);
const wasmParts = [];
for (let offset = 0; offset < wasmBytes.length; offset += wasmPartSize) {
  const partPath = `${wasmPath}.part${wasmParts.length + 1}`;
  await writeFile(partPath, wasmBytes.subarray(offset, offset + wasmPartSize));
  wasmParts.push(partPath);
}
if (wasmParts.length !== wasmPartUrls.length) {
  console.error(`Expected ${wasmPartUrls.length} FFmpeg WASM parts, created ${wasmParts.length}.`);
  process.exit(1);
}
await rm(wasmPath);
await writeInstallerParts();
await cp(cloudFunctionsDir, edgeOneCloudFunctionsDir, { recursive: true });
await writeFunctionRuntimePackage();
await copyFile(path.join(appRoot, "edgeone.json"), path.join(outDir, "edgeone.json"));
await assertNoPrivateLicenseMaterial();

const oversizedFiles = [];
for (const filePath of await collectFiles(outDir)) {
  const fileStat = await stat(filePath);
  if (fileStat.size > maxEdgeOneFileSize) {
    oversizedFiles.push(`${path.relative(outDir, filePath)} (${fileStat.size} bytes)`);
  }
}

if (oversizedFiles.length > 0) {
  console.error(`EdgeOne output contains files larger than 25 MiB:\n${oversizedFiles.join("\n")}`);
  process.exit(1);
}

async function writeInstallerParts() {
  const manifest = {
    version: 1,
    packages: {}
  };

  await mkdir(edgeOneReleaseDir, { recursive: true });
  for (const installer of installerPackages) {
    const sourcePath = path.join(releaseInstallerDir, installer.fileName);
    const sourceBytes = await readFile(sourcePath);
    const sourceHash = sha256(sourceBytes);
    if (sourceHash !== installer.sha256) {
      throw new Error(`${installer.fileName} SHA256 mismatch: ${sourceHash}`);
    }

    const packageDir = path.join(edgeOneReleaseDir, installer.type);
    await mkdir(packageDir, { recursive: true });
    const parts = [];
    for (let offset = 0; offset < sourceBytes.length; offset += installerPartSize) {
      const partNumber = parts.length + 1;
      const partName = `part-${String(partNumber).padStart(3, "0")}.bin`;
      const partBytes = sourceBytes.subarray(offset, offset + installerPartSize);
      await writeFile(path.join(packageDir, partName), partBytes);
      parts.push({
        url: `/release/v${releaseVersion}/edgeone/${installer.type}/${partName}`,
        size: partBytes.length,
        sha256: sha256(partBytes)
      });
    }

    manifest.packages[installer.type] = {
      fileName: installer.fileName,
      size: sourceBytes.length,
      sha256: installer.sha256,
      contentType: installer.contentType,
      parts
    };
  }

  await writeFile(
    path.join(edgeOneReleaseDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

async function writeFunctionRuntimePackage() {
  const runtimePackage = {
    name: "format-converter-edgeone-functions",
    version: "1.0.0",
    private: true,
    type: "module",
    engines: {
      node: "20.x"
    },
    dependencies: {
      "@edgeone/pages-blob": "0.0.14"
    }
  };

  await writeFile(
    path.join(outDir, "package.json"),
    `${JSON.stringify(runtimePackage, null, 2)}\n`
  );
}

async function assertNoPrivateLicenseMaterial() {
  const forbiddenNames = new Set([
    "private_key.pem",
    "license_records.json"
  ]);
  const textExtensions = new Set([
    ".cjs",
    ".env",
    ".js",
    ".json",
    ".mjs",
    ".pem",
    ".ts",
    ".txt"
  ]);
  const violations = [];

  for (const filePath of await collectFiles(outDir)) {
    const fileName = path.basename(filePath).toLowerCase();
    if (forbiddenNames.has(fileName) || fileName.endsWith(".mrx")) {
      violations.push(path.relative(outDir, filePath));
      continue;
    }

    const fileStat = await stat(filePath);
    if (fileStat.size > 1024 * 1024 || !textExtensions.has(path.extname(fileName))) continue;
    const content = await readFile(filePath, "utf8");
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
      violations.push(path.relative(outDir, filePath));
    }
  }

  if (violations.length > 0) {
    throw new Error(`EdgeOne output contains private license material:\n${violations.join("\n")}`);
  }
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}
