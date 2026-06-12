import { readFile, readdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const nextBin = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");

await rm(path.join(appRoot, ".next"), { recursive: true, force: true });
await rm(path.join(appRoot, "out"), { recursive: true, force: true });

const child = spawn(process.execPath, [nextBin, "build"], {
  cwd: appRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_MODE: "desktop"
  },
  stdio: "inherit"
});

const code = await new Promise((resolve) => {
  child.on("close", resolve);
  child.on("error", () => resolve(1));
});

if (code !== 0) process.exit(Number(code) || 1);

const outDir = path.join(appRoot, "out");
await Promise.all([
  rm(path.join(outDir, "download"), { recursive: true, force: true }),
  rm(path.join(outDir, "release"), { recursive: true, force: true }),
  rm(path.join(outDir, "_next", "static", "chunks", "app", "download"), { recursive: true, force: true }),
  rm(path.join(outDir, "_next", "static", "chunks", "app", "release"), { recursive: true, force: true })
]);

const releaseSumsPath = path.resolve(appRoot, "..", "..", "release", "v1.0.0", "installers", "SHA256SUMS.txt");
const releaseSums = await readFile(releaseSumsPath, "utf8");
const installerHashes = releaseSums.match(/\b[A-F0-9]{64}\b/g) || [];
const textExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".md", ".txt"]);
const leakedFiles = [];

for (const filePath of await collectFiles(outDir)) {
  if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue;
  const source = await readFile(filePath, "utf8");
  if (installerHashes.some((hash) => source.includes(hash))) {
    leakedFiles.push(path.relative(outDir, filePath));
  }
}

if (leakedFiles.length > 0) {
  console.error(`Desktop output contains installer self-hashes:\n${leakedFiles.join("\n")}`);
  process.exit(1);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}
