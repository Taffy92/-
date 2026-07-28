import { createHash } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const now = new Date().toISOString();

const paths = {
  pnpmLock: path.join(root, "pnpm-lock.yaml"),
  cargoLock: path.join(root, "apps/desktop/src-tauri/Cargo.lock"),
  rootNotices: path.join(root, "THIRD_PARTY_NOTICES.md"),
  docsNotices: path.join(root, "docs/third-party-notices.md"),
  docsLicenses: path.join(root, "docs/licenses.md"),
  generatedTs: path.join(root, "apps/web/src/generated/thirdPartyNotices.ts")
};

const lockPackages = parsePnpmLockPackages(await readTextIfExists(paths.pnpmLock));
const directNames = await collectDirectDependencyNames();
const npmPackages = await collectPnpmPackages(lockPackages, directNames);
const rustCrates = await collectRustCrates();
const bundledArtifacts = await collectBundledArtifacts();
const embeddedArtifacts = bundledArtifacts.filter((item) => !item.path.startsWith("release/v2.0.0/installers/"));
const directNpmPackages = npmPackages.filter((item) => item.direct);

const meta = {
  generatedAt: now,
  npmPackageCount: npmPackages.length,
  directNpmPackageCount: directNpmPackages.length,
  rustCrateCount: rustCrates.length,
  bundledArtifactCount: bundledArtifacts.length,
  sources: [
    "pnpm-lock.yaml",
    "node_modules/.pnpm/**/package.json",
    "apps/desktop/src-tauri/Cargo.lock",
    "本机 Cargo registry manifest（可用时）",
    "apps/web/out",
    "release/v2.0.0/installers"
  ]
};

await mkdir(path.dirname(paths.generatedTs), { recursive: true });
await mkdir(path.dirname(paths.docsNotices), { recursive: true });

const markdown = renderMarkdown(meta, bundledArtifacts, directNpmPackages, npmPackages, rustCrates);
await writeUtf8Bom(paths.rootNotices, markdown);
await writeUtf8Bom(paths.docsNotices, markdown);
await writeUtf8Bom(paths.docsLicenses, markdown);
await writeUtf8Bom(paths.generatedTs, renderTypescript({
  ...meta,
  bundledArtifactCount: embeddedArtifacts.length,
  sources: meta.sources.filter((source) => source !== "release/v2.0.0/installers")
}, embeddedArtifacts, directNpmPackages, npmPackages, rustCrates));

console.log(`Generated ${paths.rootNotices}`);
console.log(`Generated ${paths.docsNotices}`);
console.log(`Generated ${paths.docsLicenses}`);
console.log(`Generated ${paths.generatedTs}`);
console.log(`NPM packages: ${npmPackages.length}, Rust crates: ${rustCrates.length}, artifacts: ${bundledArtifacts.length}`);

async function collectDirectDependencyNames() {
  const files = [
    "package.json",
    "apps/web/package.json",
    "apps/desktop/package.json",
    "packages/ui/package.json",
    "packages/image-core/package.json",
    "packages/pdf-core/package.json",
    "packages/export-core/package.json",
    "packages/media-core/package.json",
    "packages/ocr-core/package.json",
    "packages/shared/package.json"
  ];
  const names = new Set();
  for (const file of files) {
    const json = await readJsonIfExists(path.join(root, file));
    if (!json) continue;
    for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
      for (const name of Object.keys(json[section] || {})) {
        if (!name.startsWith("@doctool/")) names.add(name);
      }
    }
  }
  return names;
}

function parsePnpmLockPackages(text) {
  const packages = new Set();
  const lines = text.split(/\r?\n/);
  let inPackages = false;
  for (const line of lines) {
    if (line === "packages:") {
      inPackages = true;
      continue;
    }
    if (inPackages && /^[a-zA-Z].*:$/.test(line)) break;
    const match = line.match(/^ {2}['"]?(?:\/)?(.+?)['"]?:\s*$/);
    if (!match) continue;
    const parsed = parsePackageKey(match[1]);
    if (parsed) packages.add(`${parsed.name}@${parsed.version}`);
  }
  return packages;
}

function parsePackageKey(key) {
  const clean = key.replace(/\(.+$/, "");
  const at = clean.lastIndexOf("@");
  if (at <= 0) return null;
  return { name: clean.slice(0, at), version: clean.slice(at + 1) };
}

async function collectPnpmPackages(lockPackages, directNames) {
  const pnpmDir = path.join(root, "node_modules/.pnpm");
  if (!existsSync(pnpmDir)) return [];
  const entries = await readdir(pnpmDir, { withFileTypes: true });
  const packages = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const modulesDir = path.join(pnpmDir, entry.name, "node_modules");
    if (!existsSync(modulesDir)) continue;
    await collectPackageJsons(modulesDir, async (packageRoot, packageJsonPath) => {
      const pkg = await readJsonIfExists(packageJsonPath);
      if (!pkg?.name || !pkg?.version || pkg.private) return;
      const key = `${pkg.name}@${pkg.version}`;
      if (lockPackages.size > 0 && !lockPackages.has(key)) return;
      if (packages.has(key)) return;
      packages.set(key, normalizeNpmPackage(pkg, packageRoot, {
        direct: directNames.has(pkg.name),
        inLockfile: true
      }));
    });
  }

  return [...packages.values()].sort(sortByNameVersion);
}

async function collectPackageJsons(dir, onPackage) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("@")) {
      const scopedDir = path.join(dir, entry.name);
      const scopedEntries = await readdir(scopedDir, { withFileTypes: true });
      for (const scoped of scopedEntries) {
        if (!scoped.isDirectory()) continue;
        const packageRoot = path.join(scopedDir, scoped.name);
        const packageJsonPath = path.join(packageRoot, "package.json");
        if (existsSync(packageJsonPath)) await onPackage(packageRoot, packageJsonPath);
      }
      continue;
    }
    const packageRoot = path.join(dir, entry.name);
    const packageJsonPath = path.join(packageRoot, "package.json");
    if (existsSync(packageJsonPath)) await onPackage(packageRoot, packageJsonPath);
  }
}

function normalizeNpmPackage(pkg, packageRoot, extra) {
  return {
    name: pkg.name,
    version: pkg.version,
    license: normalizeLicense(pkg.license || pkg.licenses),
    repository: normalizeRepository(pkg.repository),
    homepage: normalizeString(pkg.homepage),
    author: normalizeAuthor(pkg.author),
    licenseFiles: findLicenseFilesSync(packageRoot),
    noticeFiles: findNoticeFilesSync(packageRoot),
    direct: Boolean(extra.direct),
    inLockfile: Boolean(extra.inLockfile)
  };
}

async function collectRustCrates() {
  const text = await readTextIfExists(paths.cargoLock);
  if (!text) return [];
  const blocks = text.split(/\n(?=\[\[package\]\])/g).filter((block) => block.includes("[[package]]"));
  const crates = [];
  for (const block of blocks) {
    const name = matchTomlString(block, "name");
    const version = matchTomlString(block, "version");
    if (!name || !version || name === "doctool_desktop") continue;
    const manifest = await readCargoManifest(name, version);
    crates.push({
      name,
      version,
      license: manifest.license || "未在本地 Cargo manifest 中声明",
      repository: manifest.repository || "",
      homepage: manifest.homepage || "",
      source: matchTomlString(block, "source") || "",
      checksum: matchTomlString(block, "checksum") || ""
    });
  }
  return crates.sort(sortByNameVersion);
}

async function readCargoManifest(name, version) {
  const cargoSrcRoot = path.join(os.homedir(), ".cargo/registry/src");
  if (!existsSync(cargoSrcRoot)) return {};
  const registries = await readdir(cargoSrcRoot, { withFileTypes: true });
  for (const registry of registries) {
    if (!registry.isDirectory()) continue;
    const manifestPath = path.join(cargoSrcRoot, registry.name, `${name}-${version}`, "Cargo.toml");
    const text = await readTextIfExists(manifestPath);
    if (!text) continue;
    return {
      license: matchTomlString(text, "license"),
      repository: matchTomlString(text, "repository"),
      homepage: matchTomlString(text, "homepage")
    };
  }
  return {};
}

async function collectBundledArtifacts() {
  const artifacts = [];
  await addDirArtifact(artifacts, "Next.js 静态网站产物", "apps/web/out", "在线版和离线版共用的静态页面、JS、CSS 和静态资源。");
  await addDirArtifact(artifacts, "PDF.js 静态资源", "apps/web/out/pdfjs", "来自 pdfjs-dist 的主模块、worker、CMaps 和字体资源。");
  await addDirArtifact(artifacts, "FFmpeg WASM 静态资源", "apps/web/out/ffmpeg", "来自 @ffmpeg/core 的 ffmpeg-core.js 和 ffmpeg-core.wasm。");
  await addBundleFiles(artifacts, "release/v2.0.0/installers", /\.exe$/i, "Windows NSIS 安装包", "离线版 Windows x64 EXE 安装包。");
  await addBundleFiles(artifacts, "release/v2.0.0/installers", /\.msi$/i, "Windows MSI 安装包", "离线版 Windows x64 MSI 安装包。");
  return artifacts;
}

async function addBundleFiles(artifacts, relativeDir, pattern, label, note) {
  const full = path.join(root, relativeDir);
  if (!existsSync(full)) return;
  const entries = await readdir(full, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !pattern.test(entry.name)) continue;
    await addFileArtifact(artifacts, label, path.join(relativeDir, entry.name), note);
  }
}

async function addDirArtifact(artifacts, label, relativePath, note) {
  const full = path.join(root, relativePath);
  if (!existsSync(full)) return;
  const files = await listFiles(full);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  artifacts.push({
    label,
    path: relativePath.replaceAll("\\", "/"),
    kind: "目录",
    files: files.length,
    sizeBytes: totalBytes,
    sha256: "",
    note
  });
}

async function addFileArtifact(artifacts, label, relativePath, note) {
  const full = path.join(root, relativePath);
  if (!existsSync(full)) return;
  const info = await stat(full);
  artifacts.push({
    label,
    path: relativePath.replaceAll("\\", "/"),
    kind: "文件",
    files: 1,
    sizeBytes: info.size,
    sha256: await sha256File(full),
    note
  });
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(full));
    else if (entry.isFile()) files.push({ path: full, size: (await stat(full)).size });
  }
  return files;
}

function renderMarkdown(meta, artifacts, directNpm, npmPackages, rustCrates) {
  const ffmpeg = npmPackages.find((item) => item.name === "@ffmpeg/core");
  const sheetPackage = npmPackages.find((item) => item.name === "xlsx");
  return `# 第三方开源许可证与 Notices

本文件为“万能格式转换器”在线版和 Windows 离线安装版的第三方开源软件 Notices。内容根据锁文件、本地依赖元数据和最终构建产物生成，用于正式发布前的许可证归档和产品内展示。

- 生成时间：${meta.generatedAt}
- npm 依赖数量：${meta.npmPackageCount}
- 直接 npm 依赖数量：${meta.directNpmPackageCount}
- Rust crate 数量：${meta.rustCrateCount}
- 构建产物记录数量：${meta.bundledArtifactCount}
- 开发者：MR.谢
- 联系邮箱：370298218@qq.com

## 生成来源

${meta.sources.map((item) => `- \`${item}\``).join("\n")}

## 发布前必须保留的重点说明

- 本项目使用的第三方库大多数允许商业使用，但必须保留对应版权声明、许可证文本和必要 NOTICE。
- Next.js、React、PDF.js、JSZip、Tauri、Rust 依赖等应随网站“开源许可证”页面和离线安装包保留许可证说明。
- 当前项目音视频转换使用 \`@ffmpeg/core\`${ffmpeg ? `（包声明许可证：\`${ffmpeg.license}\`）` : ""}。如果正式发布包内包含 FFmpeg WASM 静态资源，需要按 FFmpeg 对应构建许可证提供源代码获取方式、许可证文本和版权声明。
- 如果继续保留 \`@ffmpeg/core\` 默认构建且其许可证为 GPL-2.0-or-later，发布方需要按 GPL 要求履行源代码提供义务；可选替代方案包括使用合规的 LGPL FFmpeg 构建、改为用户本机 sidecar FFmpeg，或保留现状并补齐 GPL 声明和源代码获取方式。
${sheetPackage ? `- 旧版 \`xlsx\` 依赖仍出现在锁文件或本地依赖中：${sheetPackage.version}。正式发布前应确认运行时代码不再直接使用该包。` : "- 本轮已将 Excel 转图片链路从 xlsx 切换到 ExcelJS，并增加文件大小、工作表数量、行数和单元格数量限制。"}
- 本文件不是法律意见。正式商业发布前，建议根据投放地区、应用商店要求和广告平台要求进行最终合规审查。

## 最终构建产物记录

${markdownTable(["名称", "路径", "类型", "文件数", "大小", "SHA256", "说明"], artifacts.map((item) => [
  item.label,
  `\`${item.path}\``,
  item.kind,
  String(item.files),
  item.sizeBytes == null ? "-" : formatBytes(item.sizeBytes),
  item.sha256 || "-",
  item.note
]))}

## 直接 npm 依赖

${markdownTable(["包名", "版本", "许可证", "仓库/主页", "许可证文件"], directNpm.map(npmNoticeRow))}

## 完整 npm 依赖 Notices

${markdownTable(["包名", "版本", "许可证", "直接依赖", "锁文件", "仓库/主页", "许可证文件", "NOTICE 文件"], npmPackages.map((item) => [
  item.name,
  item.version,
  item.license,
  item.direct ? "是" : "否",
  item.inLockfile ? "是" : "否",
  item.repository || item.homepage || "-",
  item.licenseFiles.join(", ") || "-",
  item.noticeFiles.join(", ") || "-"
]))}

## Rust / Tauri 依赖 Notices

${markdownTable(["crate", "版本", "许可证", "仓库/主页", "来源", "checksum"], rustCrates.map((item) => [
  item.name,
  item.version,
  item.license,
  item.repository || item.homepage || "-",
  item.source || "-",
  item.checksum || "-"
]))}

## 保留方式建议

1. 在线版：在网站 \`/licenses\` 页面展示本 Notices 摘要和完整依赖表。
2. 离线版：在程序的“开源许可证”页面展示同一份 Notices，并随安装包或安装目录保留 \`THIRD_PARTY_NOTICES.md\`。
3. 发布包：保留项目根目录 \`LICENSE\`、\`THIRD_PARTY_NOTICES.md\`、\`docs/licenses.md\` 和 \`docs/third-party-notices.md\`。
4. 如果更新依赖、重新打包离线版或替换 WASM/PDF/FFmpeg 静态资源，请重新运行 \`pnpm generate:notices\`。
`;
}

function npmNoticeRow(item) {
  return [
    item.name,
    item.version,
    item.license,
    item.repository || item.homepage || "-",
    item.licenseFiles.join(", ") || "-"
  ];
}

function renderTypescript(meta, artifacts, directNpm, npmPackages, rustCrates) {
  return `// This file is generated by scripts/generate-third-party-notices.mjs.
// Do not edit it by hand.

export const thirdPartyNoticeMeta = ${JSON.stringify(meta, null, 2)} as const;

export const bundledArtifacts = ${JSON.stringify(artifacts, null, 2)} as const;

export const directNpmPackages = ${JSON.stringify(directNpm, null, 2)} as const;

export const npmPackages = ${JSON.stringify(npmPackages, null, 2)} as const;

export const rustCrates = ${JSON.stringify(rustCrates, null, 2)} as const;
`;
}

function markdownTable(headers, rows) {
  const header = `| ${headers.map(escapeTableCell).join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => escapeTableCell(String(cell ?? ""))).join(" | ")} |`).join("\n");
  return [header, sep, body].filter(Boolean).join("\n");
}

function escapeTableCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function normalizeLicense(value) {
  if (!value) return "未声明";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => normalizeLicense(item.type || item)).join(" OR ");
  if (typeof value === "object") return normalizeLicense(value.type || value.url);
  return String(value);
}

function normalizeRepository(repository) {
  if (!repository) return "";
  if (typeof repository === "string") return repository;
  return repository.url || "";
}

function normalizeAuthor(author) {
  if (!author) return "";
  if (typeof author === "string") return author;
  return [author.name, author.email].filter(Boolean).join(" ");
}

function normalizeString(value) {
  return typeof value === "string" ? value : "";
}

function findLicenseFilesSync(packageRoot) {
  return findFilesByNameSync(packageRoot, /^(license|licence|copying|copyright)(\..*)?$/i);
}

function findNoticeFilesSync(packageRoot) {
  return findFilesByNameSync(packageRoot, /^notice(\..*)?$/i);
}

function findFilesByNameSync(packageRoot, pattern) {
  try {
    return readdirSync(packageRoot).filter((name) => pattern.test(name)).sort();
  } catch {
    return [];
  }
}

function matchTomlString(text, key) {
  const match = text.match(new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m"));
  return match?.[1] || "";
}

async function readTextIfExists(file) {
  if (!existsSync(file)) return "";
  return readFile(file, "utf8");
}

async function writeUtf8Bom(file, text) {
  await writeFile(file, `\ufeff${text.replace(/^\ufeff/, "")}`, "utf8");
}

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await readTextIfExists(file));
  } catch {
    return null;
  }
}

async function sha256File(file) {
  const hash = createHash("sha256");
  hash.update(await readFile(file));
  return hash.digest("hex").toUpperCase();
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function sortByNameVersion(a, b) {
  return a.name.localeCompare(b.name) || a.version.localeCompare(b.version);
}
