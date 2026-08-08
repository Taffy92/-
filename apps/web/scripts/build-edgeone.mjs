import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const outDir = path.join(appRoot, "out");
const nextBin = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");
const maxEdgeOneFileSize = 25 * 1024 * 1024;
const wasmPartSize = 16 * 1024 * 1024;
const installerPartSize = 24 * 1024 * 1024;
const publishedPartDownloadConcurrency = 6;
const releaseVersion = "2.0.0";
const msiFileName = "万能格式转换器_2.0.0_x64_zh-CN.msi";
const msiSha256 = "120FF8C66BA7EFD38280EE01985886EC4C925B32BAA7CE899736E55EB2131F9C";
const releaseInstallerDir = path.resolve(appRoot, "..", "..", "release", `v${releaseVersion}`, "installers");
const edgeOneInstallerDirectory = "edgeone-v24";
const edgeOneReleaseDir = path.join(outDir, "release", `v${releaseVersion}`, edgeOneInstallerDirectory);
const publishedReleaseBaseUrl =
  process.env.EDGEONE_RELEASE_SOURCE_URL || "https://gszhmrx.cn";
const installerAssetBaseUrl =
  process.env.EDGEONE_INSTALLER_SOURCE_URL ||
  `https://github.com/Taffy92/-/releases/download/v${releaseVersion}/`;
const installerPackages = [
  {
    type: "zip",
    fileName: "万能格式转换器_2.0.0_x64_zh-CN.zip",
    assetName: "format-converter_2.0.0_x64_zh-CN.zip",
    sha256: "191767A4402244E58EAE44DA4AFBC516EF7458C83B014C7EB7A21158C1CD87EC",
    contentType: "application/zip"
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

await copyCloudFunctionSources();
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
await writeDirectUploadConfig();
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
  let publishedManifest;

  await mkdir(edgeOneReleaseDir, { recursive: true });
  for (const installer of installerPackages) {
    const sourcePath = path.join(releaseInstallerDir, installer.fileName);
    let sourceBytes;
    try {
      sourceBytes = await readFile(sourcePath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      if (installer.type === "zip") sourceBytes = await createMsiOnlyZip();
    }

    if (!sourceBytes) {
      try {
        publishedManifest ??= await fetchPublishedInstallerManifest();
        manifest.packages[installer.type] = await reusePublishedInstallerParts(
          installer,
          publishedManifest
        );
        continue;
      } catch (error) {
        console.warn(
          `Published EdgeOne parts are unavailable for ${installer.type}; downloading the signed release asset.`
        );
        sourceBytes = await fetchVerifiedInstallerAsset(installer, error);
      }
    }

    const sourceHash = sha256(sourceBytes);
    if (sourceHash !== installer.sha256) {
      throw new Error(`${installer.fileName} SHA256 mismatch: ${sourceHash}`);
    }
    await assertMsiOnlyZip(sourceBytes);

    const packageDir = path.join(edgeOneReleaseDir, installer.type);
    await mkdir(packageDir, { recursive: true });
    const parts = [];
    for (let offset = 0; offset < sourceBytes.length; offset += installerPartSize) {
      const partNumber = parts.length + 1;
      const partName = `part-${String(partNumber).padStart(3, "0")}.bin`;
      const partBytes = sourceBytes.subarray(offset, offset + installerPartSize);
      await writeFile(path.join(packageDir, partName), partBytes);
      parts.push({
        url: `/release/v${releaseVersion}/${edgeOneInstallerDirectory}/${installer.type}/${partName}`,
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

async function writeDirectUploadConfig() {
  const sourcePath = path.join(repoRoot, "edgeone.json");
  const config = JSON.parse(await readFile(sourcePath, "utf8"));
  delete config.buildCommand;
  delete config.installCommand;
  delete config.outputDirectory;
  await writeFile(path.join(outDir, "edgeone.json"), `${JSON.stringify(config, null, 2)}\n`);
}

async function copyCloudFunctionSources() {
  const publishedFunctionRoot = path.join(outDir, "cloud-functions");
  await cp(
    path.join(repoRoot, "cloud-functions"),
    publishedFunctionRoot,
    { recursive: true, force: true }
  );
  await cp(
    path.join(appRoot, "cloud-functions", "api", "admin", "license", "_lib"),
    path.join(publishedFunctionRoot, "api", "admin", "license", "_lib"),
    { recursive: true, force: true }
  );
  await rewritePublishedFunctionImports(publishedFunctionRoot);
  await writeFunctionRuntimePackage();
}

async function rewritePublishedFunctionImports(publishedFunctionRoot) {
  const apiPath = path.join(publishedFunctionRoot, "api", "admin", "license", "_lib", "api.ts");
  const functionFiles = (await collectFiles(publishedFunctionRoot)).filter((filePath) =>
    filePath.endsWith(".ts")
  );
  for (const filePath of functionFiles) {
    const source = await readFile(filePath, "utf8");
    if (!source.includes("apps/web/cloud-functions/api/admin/license/_lib/api")) continue;
    let importPath = path.relative(path.dirname(filePath), apiPath).replaceAll(path.sep, "/");
    importPath = importPath.replace(/\.ts$/, "");
    if (!importPath.startsWith(".")) importPath = `./${importPath}`;
    const rewritten = source.replace(
      /(?:\.\.\/)+apps\/web\/cloud-functions\/api\/admin\/license\/_lib\/api/,
      importPath
    );
    await writeFile(filePath, rewritten);
  }
}

async function writeFunctionRuntimePackage() {
  const rootPackage = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
  const pagesBlobVersion = rootPackage.dependencies?.["@edgeone/pages-blob"];
  if (!pagesBlobVersion) throw new Error("Missing @edgeone/pages-blob runtime dependency.");
  await writeFile(
    path.join(outDir, "package.json"),
    `${JSON.stringify({ private: true, dependencies: { "@edgeone/pages-blob": pagesBlobVersion } }, null, 2)}\n`
  );
}

async function fetchPublishedInstallerManifest() {
  const manifestUrl = new URL(
    `/release/v${releaseVersion}/${edgeOneInstallerDirectory}/manifest.json`,
    publishedReleaseBaseUrl
  );
  console.log(`Local installers are unavailable; reusing verified parts from ${manifestUrl.origin}.`);
  const response = await fetch(manifestUrl, {
    signal: AbortSignal.timeout(120_000)
  });
  if (!response.ok) {
    throw new Error(`Unable to fetch published installer manifest: HTTP ${response.status}`);
  }
  return response.json();
}

async function createMsiOnlyZip() {
  let msiBytes;
  try {
    msiBytes = await readFile(path.join(releaseInstallerDir, msiFileName));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  if (sha256(msiBytes) !== msiSha256) {
    throw new Error(`${msiFileName} SHA256 mismatch while creating the ZIP.`);
  }
  const zip = new JSZip();
  zip.file(msiFileName, msiBytes, { date: new Date(0), compression: "STORE" });
  const zipBytes = await zip.generateAsync({ type: "nodebuffer", compression: "STORE", platform: "DOS" });
  await writeFile(path.join(releaseInstallerDir, "万能格式转换器_2.0.0_x64_zh-CN.zip"), zipBytes);
  return zipBytes;
}

async function assertMsiOnlyZip(zipBytes) {
  const zip = await JSZip.loadAsync(zipBytes);
  const files = Object.entries(zip.files).filter(([, entry]) => !entry.dir);
  if (files.length !== 1 || files[0][0] !== msiFileName) {
    throw new Error("The release ZIP must contain exactly one MSI installer.");
  }
  const innerMsi = await files[0][1].async("nodebuffer");
  if (sha256(innerMsi) !== msiSha256) {
    throw new Error("The MSI inside the release ZIP failed SHA256 verification.");
  }
}

async function fetchVerifiedInstallerAsset(installer, publishedPartsError) {
  const assetUrl = new URL(
    installer.assetName,
    installerAssetBaseUrl.endsWith("/") ? installerAssetBaseUrl : `${installerAssetBaseUrl}/`
  );
  const response = await fetch(assetUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(600_000)
  });
  if (!response.ok) {
    throw new AggregateError(
      [publishedPartsError, new Error(`HTTP ${response.status} from ${assetUrl.origin}`)],
      `Unable to recover ${installer.type} installer for the EdgeOne build.`
    );
  }

  const sourceBytes = Buffer.from(await response.arrayBuffer());
  const sourceHash = sha256(sourceBytes);
  if (sourceHash !== installer.sha256) {
    throw new Error(
      `Downloaded ${installer.type} installer failed complete SHA256 verification: ${sourceHash}`
    );
  }
  console.log(`Recovered and verified ${installer.type} installer from the v${releaseVersion} release.`);
  return sourceBytes;
}

async function reusePublishedInstallerParts(installer, publishedManifest) {
  const publishedPackage = publishedManifest?.packages?.[installer.type];
  if (
    !publishedPackage ||
    publishedPackage.fileName !== installer.fileName ||
    publishedPackage.sha256 !== installer.sha256 ||
    !Array.isArray(publishedPackage.parts) ||
    publishedPackage.parts.length === 0 ||
    !usesCurrentInstallerPartLayout(publishedPackage)
  ) {
    throw new Error(`Published ${installer.type} installer manifest does not match this release.`);
  }

  const packageDir = path.join(edgeOneReleaseDir, installer.type);
  const expectedPrefix = `/release/v${releaseVersion}/${edgeOneInstallerDirectory}/${installer.type}/`;
  const publishedBase = new URL(publishedReleaseBaseUrl);
  const combinedHash = createHash("sha256");
  const parts = [];
  let totalSize = 0;
  await mkdir(packageDir, { recursive: true });

  const publishedPartDownloads = publishedPackage.parts.map((publishedPart, index) => {
    if (
      typeof publishedPart?.url !== "string" ||
      !publishedPart.url.startsWith(expectedPrefix)
    ) {
      throw new Error(`Published ${installer.type} installer contains an invalid part URL.`);
    }

    const partUrl = new URL(publishedPart.url, publishedBase);
    if (partUrl.origin !== publishedBase.origin) {
      throw new Error(`Published ${installer.type} installer part uses an unexpected origin.`);
    }

    return { index, partUrl, publishedPart };
  });

  console.log(
    `Reusing ${publishedPartDownloads.length} verified ${installer.type} parts with ` +
    `${Math.min(publishedPartDownloadConcurrency, publishedPartDownloads.length)} parallel downloads.`
  );
  const downloadedParts = await mapWithConcurrency(
    publishedPartDownloads,
    publishedPartDownloadConcurrency,
    async ({ index, partUrl, publishedPart }) => {
      const response = await fetch(partUrl, {
        signal: AbortSignal.timeout(120_000)
      });
      if (!response.ok) {
        throw new Error(`Unable to fetch ${partUrl.pathname}: HTTP ${response.status}`);
      }

      const partBytes = Buffer.from(await response.arrayBuffer());
      const partHash = sha256(partBytes);
      if (partBytes.length !== publishedPart.size || partHash !== publishedPart.sha256) {
        throw new Error(`${partUrl.pathname} failed size or SHA256 verification.`);
      }

      const partName = path.basename(partUrl.pathname);
      const partPath = path.join(packageDir, partName);
      await writeFile(partPath, partBytes);
      console.log(`Reused ${installer.type} part ${index + 1}/${publishedPartDownloads.length}.`);
      return {
        partPath,
        url: `${expectedPrefix}${partName}`,
        size: partBytes.length,
        sha256: partHash
      };
    }
  );

  for (const downloadedPart of downloadedParts) {
    const partBytes = await readFile(downloadedPart.partPath);
    combinedHash.update(partBytes);
    totalSize += downloadedPart.size;
    parts.push({
      url: downloadedPart.url,
      size: downloadedPart.size,
      sha256: downloadedPart.sha256
    });
  }

  const combinedDigest = combinedHash.digest("hex").toUpperCase();
  if (totalSize !== publishedPackage.size || combinedDigest !== installer.sha256) {
    throw new Error(`Published ${installer.type} installer failed complete SHA256 verification.`);
  }

  return {
    fileName: installer.fileName,
    size: totalSize,
    sha256: installer.sha256,
    contentType: installer.contentType,
    parts
  };
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, items.length);

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }));

  return results;
}

function usesCurrentInstallerPartLayout(packageInfo) {
  if (!Number.isSafeInteger(packageInfo?.size) || !Array.isArray(packageInfo.parts) || packageInfo.parts.length === 0) {
    return false;
  }
  if (packageInfo.parts.length !== Math.ceil(packageInfo.size / installerPartSize)) return false;
  return packageInfo.parts.every((part, index, parts) => {
    if (!Number.isSafeInteger(part?.size) || part.size <= 0 || part.size > installerPartSize) return false;
    return index === parts.length - 1 || part.size === installerPartSize;
  });
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
