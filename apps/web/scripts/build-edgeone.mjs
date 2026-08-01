import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
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
const releaseVersion = "2.0.0";
const releaseInstallerDir = path.resolve(appRoot, "..", "..", "release", `v${releaseVersion}`, "installers");
const edgeOneReleaseDir = path.join(outDir, "release", `v${releaseVersion}`, "edgeone");
const publishedReleaseBaseUrl =
  process.env.EDGEONE_RELEASE_SOURCE_URL || "https://gszhmrx.cn";
const installerAssetBaseUrl =
  process.env.EDGEONE_INSTALLER_SOURCE_URL ||
  `https://github.com/Taffy92/-/releases/download/v${releaseVersion}/`;
const installerPackages = [
  {
    type: "exe",
    fileName: "万能格式转换器_2.0.0_x64-setup.exe",
    assetName: "format-converter_2.0.0_x64-setup.exe",
    sha256: "8BF3361BE8FED6C6123AD51B90D6298319AEFB9EE3C2A6143F4ABDD900886E3B",
    contentType: "application/vnd.microsoft.portable-executable"
  },
  {
    type: "msi",
    fileName: "万能格式转换器_2.0.0_x64_zh-CN.msi",
    assetName: "format-converter_2.0.0_x64_zh-CN.msi",
    sha256: "C992027904CAC48B77DD3FB79F11314D3D2689AC4E09161822BDA64B0D5DACFB",
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

async function fetchPublishedInstallerManifest() {
  const manifestUrl = new URL(
    `/release/v${releaseVersion}/edgeone/manifest.json`,
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
    publishedPackage.parts.length === 0
  ) {
    throw new Error(`Published ${installer.type} installer manifest does not match this release.`);
  }

  const packageDir = path.join(edgeOneReleaseDir, installer.type);
  const expectedPrefix = `/release/v${releaseVersion}/edgeone/${installer.type}/`;
  const publishedBase = new URL(publishedReleaseBaseUrl);
  const combinedHash = createHash("sha256");
  const parts = [];
  let totalSize = 0;
  await mkdir(packageDir, { recursive: true });

  for (const publishedPart of publishedPackage.parts) {
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
    await writeFile(path.join(packageDir, partName), partBytes);
    combinedHash.update(partBytes);
    totalSize += partBytes.length;
    parts.push({
      url: `${expectedPrefix}${partName}`,
      size: partBytes.length,
      sha256: partHash
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
