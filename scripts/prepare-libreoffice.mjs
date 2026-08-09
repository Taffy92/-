import { createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const version = "26.2.5";
const vcRuntimeVersion = "14.51.36247.0";
const vcRedistUrl = "https://aka.ms/vc14/vc_redist.x64.exe";
const vcRedistSha256 = "843068991daaa1f73ad9f6239bce4d0f6a07a51f18c37ea2a867e9beca71295c";
const vcRuntimeFiles = {
  "concrt140.dll": "54716f0738af891f283d213b5c8d11b25896bb8ee3097d301eae718560cf974e",
  "msvcp140.dll": "7c26614e1d733892c2deac7e245ce115504b1d80592dd0a01b08e3e5a55f89ca",
  "msvcp140_1.dll": "206c931bf90fdad8816de3b5e2ef80b2bcaa9406c89ecc05fe6fddffe251e982",
  "msvcp140_2.dll": "d50d7883f20d1dc6191768d3746f52dd9cac89c346ffaed5be1f110c2f34a838",
  "msvcp140_atomic_wait.dll": "3d0cbfaa1bf3eecf5a3f4491d2960ee803cb994f30292c6adc4a07c498f60e2b",
  "msvcp140_codecvt_ids.dll": "8a65c7596ef2e6938731f5a1058e7e40145b6d97967cc649231a076b9a608d78",
  "vccorlib140.dll": "09f93d5ff96ae09767f3e1af3cdd43a5a58f2598654fc63089429bb6f9f4737f",
  "vcruntime140.dll": "d1f4225df2cd877dbf130d5668a021dce3f94118455ff5ec952061c30afc9ce7",
  "vcruntime140_1.dll": "a7146c08f89fe5b04541ab507cdb59ff7b44534d4ba3c668a426c6450a03434e",
  "vcruntime140_threads.dll": "40f39e8cee5f5a531b4010e18b807e8fe265b908dc58f959ecb7ebc6ea6cb11a"
};
const resourceRoot = path.join(projectRoot, "apps", "desktop", "src-tauri", "resources", "libreoffice");
const resourceExecutable = path.join(resourceRoot, "program", "soffice.exe");
const downloadUrl = `https://download.documentfoundation.org/libreoffice/stable/${version}/win/x86_64/LibreOffice_${version}_Win_x86-64.msi`;
const tempRoot = path.join(projectRoot, ".tmp", `libreoffice-build-${version}`);
const tempInstaller = path.join(tempRoot, `LibreOffice_${version}_Win_x86-64.msi`);
const tempExtract = path.join(tempRoot, "extract");
const vcTempRoot = path.join(projectRoot, ".tmp", `vc-redist-${vcRuntimeVersion}`);
const vcRedistInstaller = path.join(vcTempRoot, "vc_redist.x64.exe");
const vcRedistExtract = path.join(vcTempRoot, "extract");
const vcRedistAdmin = path.join(vcTempRoot, "admin");

if (await isUsableResource()) {
  console.log(`LibreOffice ${version} resource is ready.`);
  process.exit(0);
}

if (!(await isLibreOfficeTreeUsable())) {
  await mkdir(tempRoot, { recursive: true });
  await rm(tempExtract, { recursive: true, force: true });

  if (!(await fileExists(tempInstaller))) {
    console.log(`Downloading LibreOffice ${version} from the official distribution site...`);
    await downloadFile(downloadUrl, tempInstaller, "LibreOffice");
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
}

await prepareVisualCppRuntime();
await writeFile(path.join(resourceRoot, "README.md"), `# Bundled LibreOffice component

The offline Windows application bundles LibreOffice for local Word/Excel to PDF rasterization. The runtime never downloads or uploads user files.

- Version: ${version}
- Platform: Windows x86-64
- Source: ${downloadUrl}
- License: MPL-2.0 / LGPL-3.0-or-later
- Runtime dependency: Microsoft Visual C++ v14 Runtime ${vcRuntimeVersion} (x64), application-local deployment
- Runtime source: ${vcRedistUrl}
- Runtime license: https://aka.ms/VCRedistLicense

The binary tree is prepared locally before a desktop build by running npm run prepare:libreoffice. The installer is not committed to the public repository.
`, "utf8");
await writeFile(path.join(resourceRoot, "manifest.json"), `${JSON.stringify({
  component: "LibreOffice",
  version,
  platform: "Windows x86-64",
  source: downloadUrl,
  license: "MPL-2.0 / LGPL-3.0-or-later",
  visualCppRuntime: {
    component: "Microsoft Visual C++ v14 Runtime",
    version: vcRuntimeVersion,
    architecture: "x64",
    deployment: "application-local",
    source: vcRedistUrl,
    sourceSha256: vcRedistSha256,
    license: "https://aka.ms/VCRedistLicense",
    files: Object.keys(vcRuntimeFiles),
    sha256: vcRuntimeFiles
  },
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

async function prepareVisualCppRuntime() {
  if (await areRuntimeFilesUsable()) return;
  if (process.platform !== "win32") {
    throw new Error("Microsoft Visual C++ runtime preparation currently requires Windows.");
  }

  await mkdir(vcTempRoot, { recursive: true });
  if (!(await fileExists(vcRedistInstaller))) {
    console.log(`Downloading Microsoft Visual C++ v14 Runtime ${vcRuntimeVersion}...`);
    await downloadFile(vcRedistUrl, vcRedistInstaller, "Visual C++ Redistributable");
  }
  await verifySha256(vcRedistInstaller, vcRedistSha256, "Visual C++ Redistributable");

  await rm(vcRedistExtract, { recursive: true, force: true });
  await rm(vcRedistAdmin, { recursive: true, force: true });
  await mkdir(vcRedistExtract, { recursive: true });
  await mkdir(vcRedistAdmin, { recursive: true });

  const darkExe = await findWixDarkExe();
  await runProcess(darkExe, ["-x", vcRedistExtract, vcRedistInstaller], "Visual C++ Redistributable extraction");
  const minimumMsi = path.join(
    vcRedistExtract,
    "AttachedContainer",
    "packages",
    "vcRuntimeMinimum_amd64",
    "vc_runtimeMinimum_x64.msi"
  );
  await extractMsi(minimumMsi, vcRedistAdmin);

  const runtimeSource = path.join(vcRedistAdmin, "System64");
  const runtimeDestination = path.join(resourceRoot, "program");
  for (const [fileName, expectedSha256] of Object.entries(vcRuntimeFiles)) {
    const source = path.join(runtimeSource, fileName);
    await verifySha256(source, expectedSha256, fileName);
    await cp(source, path.join(runtimeDestination, fileName), { force: true });
  }
}

async function areRuntimeFilesUsable() {
  for (const [fileName, expectedSha256] of Object.entries(vcRuntimeFiles)) {
    const filePath = path.join(resourceRoot, "program", fileName);
    if (!(await fileExists(filePath)) || (await sha256(filePath)) !== expectedSha256) return false;
  }
  return true;
}

async function findWixDarkExe() {
  const tauriCache = path.join(process.env.LOCALAPPDATA || "", "tauri");
  const candidates = [path.join(tauriCache, "WixTools314", "dark.exe")];
  if (await fileExists(tauriCache)) {
    for (const entry of await readdir(tauriCache, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("WixTools")) {
        candidates.push(path.join(tauriCache, entry.name, "dark.exe"));
      }
    }
  }
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  throw new Error("WiX dark.exe is required to extract the official Visual C++ Redistributable. Run a Tauri MSI build once to install WixTools, then retry.");
}

async function runProcess(executable, args, description) {
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(executable, args, { windowsHide: true, stdio: "ignore" });
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) throw new Error(`${description} failed with exit code ${exitCode}`);
}

async function downloadFile(url, destination, component) {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`${component} download failed: HTTP ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination));
}

async function verifySha256(filePath, expected, component) {
  const actual = await sha256(filePath);
  if (actual !== expected.toLowerCase()) {
    throw new Error(`${component} SHA-256 mismatch: expected ${expected}, received ${actual}`);
  }
}

async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
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
  if (!(await isLibreOfficeTreeUsable()) || !(await areRuntimeFilesUsable())) return false;
  try {
    const manifest = JSON.parse(await readFile(path.join(resourceRoot, "manifest.json"), "utf8"));
    return manifest.visualCppRuntime?.version === vcRuntimeVersion;
  } catch {
    return false;
  }
}

async function isLibreOfficeTreeUsable() {
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
