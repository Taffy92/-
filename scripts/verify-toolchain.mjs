import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const expectedNodeMajor = 24;
const expectedPnpmVersion = "9.15.4";
const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(scriptPath), "..");

export function validateToolchain({ nodeVersion, pnpmVersion }) {
  const errors = [];
  if (!new RegExp(`^v?${expectedNodeMajor}\\.`).test(nodeVersion.trim())) {
    errors.push(`Node.js 必须为 24.x，当前为 ${nodeVersion || "未知"}。`);
  }
  if (pnpmVersion.trim() !== expectedPnpmVersion) {
    errors.push(`pnpm 必须为 ${expectedPnpmVersion}，当前为 ${pnpmVersion || "未知"}。`);
  }
  return { ok: errors.length === 0, errors };
}

function readPnpmVersion() {
  const localPnpm = resolve(
    projectRoot,
    ".pnpm-home",
    ...(process.platform === "win32"
      ? ["global", "5", "node_modules", "@pnpm", "exe", "pnpm.exe"]
      : ["pnpm"])
  );
  const command = existsSync(localPnpm) ? localPnpm : "pnpm";
  const result = spawnSync(command, ["--version"], {
    cwd: projectRoot,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.error?.message || "无法执行 pnpm").trim();
    throw new Error(`无法读取 pnpm 版本：${detail}`);
  }
  return result.stdout.trim();
}

function run() {
  let pnpmVersion = "";
  try {
    pnpmVersion = readPnpmVersion();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  const result = validateToolchain({
    nodeVersion: process.version,
    pnpmVersion
  });
  console.log(`Node.js ${process.version}（要求 24.x）`);
  console.log(`pnpm ${pnpmVersion}（要求 ${expectedPnpmVersion}）`);
  if (!result.ok) {
    for (const error of result.errors) console.error(error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) run();
