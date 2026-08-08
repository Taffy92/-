import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = path.join(projectRoot, "apps", "web");
const tauriRoot = path.join(projectRoot, "apps", "desktop", "src-tauri");
const cargoManifest = path.join(tauriRoot, "Cargo.toml");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const cargoCommand = process.platform === "win32" ? "cargo.exe" : "cargo";
const completedStages = new Set();

class ReleaseStageError extends Error {
  constructor(stage, command, exitCode) {
    super(`${stage} failed: ${command}`);
    this.exitCode = exitCode;
  }
}

const stages = [
  externalStage("toolchain", "Verify Node and pnpm toolchain", npmCommand, ["run", "verify:toolchain"]),
  externalStage("tests", "Run the complete web test suite", npmCommand, ["test"]),
  externalStage("privacy", "Verify the local-processing privacy boundary", npmCommand, ["run", "check:privacy"]),
  externalStage("network", "Verify the network-upload boundary", npmCommand, ["run", "check:network"]),
  externalStage("cargo-check", "Check the Tauri Rust application", cargoCommand, ["check", "--manifest-path", cargoManifest]),
  externalStage("cargo-test", "Run the Tauri Rust tests", cargoCommand, ["test", "--manifest-path", cargoManifest]),
  externalStage("office", "Run mandatory real Office conversion verification", process.execPath, [
    "scripts/run-pnpm.cjs",
    "--filter",
    "web",
    "verify:office"
  ]),
  externalStage("edgeone-build", "Build and validate the EdgeOne release output", npmCommand, ["run", "build:edgeone"]),
  internalStage("artifacts", "Verify installer, ZIP, version, SHA256, and EdgeOne parts", verifyReleaseArtifacts),
  internalStage("secret-scan", "Scan tracked and published files for private release material", verifyNoPrivateMaterial),
  internalStage("skip-scan", "Reject skipped critical conversion verification", verifyCriticalTests)
];

if (process.argv.includes("--list")) {
  for (const stage of stages) console.log(`${stage.id}\t${stage.command}`);
  process.exit(0);
}

for (const [index, stage] of stages.entries()) {
  console.log(`\n[release ${index + 1}/${stages.length}] ${stage.label}`);
  console.log(`[release] ${stage.command}`);
  try {
    const exitCode = await stage.run();
    if (exitCode !== 0) throw new ReleaseStageError(stage.id, stage.command, exitCode);
    completedStages.add(stage.id);
  } catch (error) {
    const exitCode = error instanceof ReleaseStageError ? error.exitCode : 1;
    console.error(`\n[release] FAILED stage=${stage.id}`);
    console.error(`[release] command=${stage.command}`);
    console.error(`[release] exit=${exitCode}`);
    if (!(error instanceof ReleaseStageError)) {
      console.error(`[release] reason=${error instanceof Error ? error.message : String(error)}`);
    }
    process.exit(exitCode || 1);
  }
}

console.log(`\n[release] PASS ${stages.length}/${stages.length} stages completed.`);

function externalStage(id, label, file, args) {
  return {
    id,
    label,
    command: formatCommand(file, args),
    run: () => runCommand(file, args)
  };
}

function internalStage(id, label, run) {
  return { id, label, command: `internal:${run.name}`, run: async () => { await run(); return 0; } };
}

function formatCommand(file, args) {
  const displayFile = file === process.execPath ? "node" : path.basename(file);
  return [displayFile, ...args.map((arg) => arg.includes(" ") ? `"${arg}"` : arg)].join(" ");
}

function runCommand(file, args) {
  return new Promise((resolveRun) => {
    const child = spawn(file, args, {
      cwd: projectRoot,
      env: process.env,
      shell: process.platform === "win32" && file !== process.execPath,
      stdio: "inherit"
    });
    child.on("close", (code) => resolveRun(code ?? 1));
    child.on("error", () => resolveRun(1));
  });
}

async function verifyReleaseArtifacts() {
  const rootPackage = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"));
  const webPackage = JSON.parse(await readFile(path.join(webRoot, "package.json"), "utf8"));
  const tauriConfig = JSON.parse(await readFile(path.join(tauriRoot, "tauri.conf.json"), "utf8"));
  const downloadsSource = await readFile(path.join(webRoot, "src", "config", "downloads.ts"), "utf8");
  const edgeOneBuildSource = await readFile(path.join(webRoot, "scripts", "build-edgeone.mjs"), "utf8");
  const version = rootPackage.version;

  assertEqual(webPackage.version, version, "web package version");
  assertEqual(tauriConfig.package.version, version, "Tauri package version");
  assertEqual(extractLiteral(downloadsSource, /version:\s*"([^"]+)"/, "download version"), version, "download version");
  assertEqual(extractLiteral(edgeOneBuildSource, /const releaseVersion = "([^"]+)"/, "EdgeOne release version"), version, "EdgeOne release version");

  const zipFileName = extractLiteral(downloadsSource, /const zipFileName = "([^"]+)"/, "ZIP file name");
  const configuredZipHash = extractLiteral(downloadsSource, /sha256:\s*"([A-F0-9]{64})"/, "download SHA256");
  const configuredFileSize = extractLiteral(downloadsSource, /fileSize:\s*"([0-9.]+ MB)"/, "download file size");
  const msiFileName = extractLiteral(edgeOneBuildSource, /const msiFileName = "([^"]+)"/, "MSI file name");
  const configuredMsiHash = extractLiteral(edgeOneBuildSource, /const msiSha256 = "([A-F0-9]{64})"/, "MSI SHA256");
  const releaseDir = path.join(projectRoot, "release", `v${version}`, "installers");
  const zipPath = path.join(releaseDir, zipFileName);
  const msiPath = path.join(releaseDir, msiFileName);
  const sumsPath = path.join(releaseDir, "SHA256SUMS.txt");
  const [zipStat, msiStat, zipHash, msiHash, sums] = await Promise.all([
    stat(zipPath),
    stat(msiPath),
    hashFile(zipPath),
    hashFile(msiPath),
    readFile(sumsPath, "utf8")
  ]);

  if (zipStat.size <= 0 || msiStat.size <= 0) throw new Error("Release ZIP or MSI is empty.");
  assertEqual(zipHash, configuredZipHash, "release ZIP SHA256");
  assertEqual(msiHash, configuredMsiHash, "release MSI SHA256");
  assertEqual(configuredFileSize, formatMiB(zipStat.size), "download file size");

  const sumMatch = sums.trim().match(/^([A-F0-9]{64})\s+(.+)$/);
  if (!sumMatch) throw new Error("SHA256SUMS.txt must contain exactly one uppercase SHA256 entry.");
  assertEqual(sumMatch[1], zipHash, "SHA256SUMS ZIP digest");
  assertEqual(sumMatch[2], zipFileName, "SHA256SUMS ZIP name");

  const manifestPath = path.join(webRoot, "out", "release", `v${version}`, "edgeone-v24", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const zipPackage = manifest?.packages?.zip;
  if (!zipPackage) throw new Error("EdgeOne output manifest is missing the ZIP package.");
  assertEqual(zipPackage.fileName, zipFileName, "EdgeOne ZIP name");
  assertEqual(zipPackage.size, zipStat.size, "EdgeOne ZIP size");
  assertEqual(zipPackage.sha256, zipHash, "EdgeOne ZIP SHA256");
  await verifyInstallerParts(zipPackage, path.dirname(manifestPath), zipHash, zipStat.size);

  const outputFiles = await collectFiles(path.join(webRoot, "out"));
  const rawInstallers = outputFiles.filter((filePath) => /\.(?:msi|zip)$/i.test(filePath));
  if (rawInstallers.length > 0) throw new Error("EdgeOne output contains a raw MSI or ZIP installer.");

  const windowsSigning = tauriConfig.tauri?.bundle?.windows;
  if (windowsSigning?.certificateThumbprint) {
    if (!/^https:\/\//i.test(windowsSigning.timestampUrl || "")) {
      throw new Error("Signed Windows builds require an HTTPS timestampUrl.");
    }
  } else if (windowsSigning?.timestampUrl) {
    throw new Error("Unsigned Windows builds must keep timestampUrl empty.");
  }
}

async function verifyInstallerParts(packageInfo, manifestDirectory, expectedHash, expectedSize) {
  if (!Array.isArray(packageInfo.parts) || packageInfo.parts.length === 0) {
    throw new Error("EdgeOne installer manifest contains no parts.");
  }

  const combined = createHash("sha256");
  let totalSize = 0;
  for (const [index, part] of packageInfo.parts.entries()) {
    if (typeof part.url !== "string" || !part.url.startsWith("/release/")) {
      throw new Error(`Installer part ${index + 1} has an invalid URL.`);
    }
    const partName = path.posix.basename(part.url);
    const partPath = path.join(manifestDirectory, "zip", partName);
    const individual = createHash("sha256");
    let partSize = 0;
    for await (const chunk of createReadStream(partPath)) {
      individual.update(chunk);
      combined.update(chunk);
      partSize += chunk.length;
    }
    assertEqual(partSize, part.size, `installer part ${index + 1} size`);
    assertEqual(individual.digest("hex").toUpperCase(), part.sha256, `installer part ${index + 1} SHA256`);
    totalSize += partSize;
  }
  assertEqual(totalSize, expectedSize, "combined installer size");
  assertEqual(combined.digest("hex").toUpperCase(), expectedHash, "combined installer SHA256");
}

async function verifyNoPrivateMaterial() {
  const forbiddenNames = new Set(["private_key.pem", "license_records.json"]);
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: projectRoot, encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
  const published = await collectFiles(path.join(webRoot, "out"));

  for (const relativePath of tracked) {
    const normalized = relativePath.replaceAll("\\", "/").toLowerCase();
    const baseName = path.posix.basename(normalized);
    if (forbiddenNames.has(baseName) || normalized.endsWith(".mrx")) {
      throw new Error(`Tracked private release material: ${relativePath}`);
    }
    await assertNoPrivateKeyBlock(path.join(projectRoot, relativePath), relativePath);
  }

  for (const filePath of published) {
    const baseName = path.basename(filePath).toLowerCase();
    if (forbiddenNames.has(baseName) || baseName.endsWith(".mrx")) {
      throw new Error(`Published private release material: ${path.relative(webRoot, filePath)}`);
    }
    await assertNoPrivateKeyBlock(filePath, path.relative(webRoot, filePath));
  }
}

async function assertNoPrivateKeyBlock(filePath, displayPath) {
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (!fileStat.isFile() || fileStat.size > 2 * 1024 * 1024) return;
  const content = await readFile(filePath, "utf8");
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{64,}-----END/.test(content)) {
    throw new Error(`Private key block detected: ${displayPath}`);
  }
}

async function verifyCriticalTests() {
  if (!completedStages.has("office")) throw new Error("Office verification stage did not execute.");
  const criticalTests = [
    "conversionBaseline.test.ts",
    "officeImages.test.ts",
    "officeDesktopIntegration.test.ts",
    "mediaConversionBehavior.test.ts",
    "batchQueue.test.ts"
  ];
  const skipPattern = /\b(?:test|it|describe)\.(?:skip|todo)\s*\(|\b(?:xit|xdescribe)\s*\(/;
  for (const fileName of criticalTests) {
    const filePath = path.join(webRoot, "src", "tests", fileName);
    const source = await readFile(filePath, "utf8");
    if (skipPattern.test(source)) throw new Error(`Critical conversion test contains skip/todo: ${fileName}`);
  }
}

async function hashFile(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex").toUpperCase();
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function extractLiteral(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Unable to read ${label}.`);
  return match[1];
}

function formatMiB(byteLength) {
  return `${(byteLength / 1024 / 1024).toFixed(2)} MB`;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} mismatch: expected ${expected}, received ${actual}`);
}
