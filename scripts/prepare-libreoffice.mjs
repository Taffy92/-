import { createWriteStream } from "node:fs";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const version = "26.2.5";
const resourceRoot = path.join(projectRoot, "apps", "desktop", "src-tauri", "resources", "libreoffice");
const resourceExecutable = path.join(resourceRoot, "program", "soffice.exe");
const downloadUrl = `https://download.documentfoundation.org/libreoffice/stable/${version}/win/x86_64/LibreOffice_${version}_Win_x86-64.msi`;
const tempRoot = path.join(projectRoot, ".tmp", `libreoffice-build-${version}`);
const tempInstaller = path.join(tempRoot, `LibreOffice_${version}_Win_x86-64.msi`);
const tempExtract = path.join(tempRoot, "extract");

if (await isUsableResource()) {
  console.log(`LibreOffice ${version} resource is ready.`);
  process.exit(0);
}

await mkdir(tempRoot, { recursive: true });
await rm(tempExtract, { recursive: true, force: true });

if (!(await fileExists(tempInstaller))) {
  console.log(`Downloading LibreOffice ${version} from the official distribution site...`);
  const response = await fetch(downloadUrl);
  if (!response.ok || !response.body) {
    throw new Error(`LibreOffice download failed: HTTP ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(tempInstaller));
}

const installerStats = await stat(tempInstaller);
if (installerStats.size < 300 * 1024 * 1024) {
  throw new Error(`LibreOffice installer is incomplete: ${installerStats.size} bytes`);
}

await mkdir(tempExtract, { recursive: true });
await extractMsi(tempInstaller, tempExtract);
await waitForFile(path.join(tempExtract, "program", "soffice.exe"), 10 * 60 * 1000);

await rm(resourceRoot, { recursive: true, force: true });
await cp(tempExtract, resourceRoot, { recursive: true, force: true });
await rm(path.join(resourceRoot, `LibreOffice_${version}_Win_x86-64.msi`), { force: true });
await writeFile(path.join(resourceRoot, "README.md"), `# Bundled LibreOffice component

The offline Windows application bundles LibreOffice for local Word/Excel to PDF rasterization. The runtime never downloads or uploads user files.

- Version: ${version}
- Platform: Windows x86-64
- Source: ${downloadUrl}
- License: MPL-2.0 / LGPL-3.0-or-later

The binary tree is prepared locally before a desktop build by running npm run prepare:libreoffice. The installer is not committed to the public repository.
`, "utf8");
await writeFile(path.join(resourceRoot, "manifest.json"), `${JSON.stringify({
  component: "LibreOffice",
  version,
  platform: "Windows x86-64",
  source: downloadUrl,
  license: "MPL-2.0 / LGPL-3.0-or-later",
  bundledFor: "Offline Word/Excel to PDF rasterization"
}, null, 2)}\n`, "utf8");

console.log(`LibreOffice ${version} resource prepared at ${resourceRoot}`);

async function extractMsi(installer, destination) {
  if (process.platform !== "win32") {
    throw new Error("Bundled LibreOffice preparation currently requires Windows MSI administrative extraction.");
  }

  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn("msiexec.exe", ["/a", installer, "/qn", `TARGETDIR=${destination}`], {
      windowsHide: true,
      stdio: "ignore"
    });
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) {
    throw new Error(`LibreOffice administrative extraction failed with exit code ${exitCode}`);
  }
}

async function waitForFile(filePath, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fileExists(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`LibreOffice extraction timed out: ${filePath}`);
}

async function isUsableResource() {
  if (!(await fileExists(resourceExecutable))) return false;
  const manifestPath = path.join(resourceRoot, "manifest.json");
  if (!(await fileExists(manifestPath))) return false;
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    return manifest.component === "LibreOffice" && manifest.version === version;
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}
