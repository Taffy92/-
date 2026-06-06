const { existsSync, mkdirSync } = require("node:fs");
const { delimiter, join } = require("node:path");
const { spawnSync } = require("node:child_process");

const root = join(__dirname, "..");
const localPnpm = process.platform === "win32"
  ? join(root, ".pnpm-home", "pnpm.CMD")
  : join(root, ".pnpm-home", "pnpm");
const tmpDir = join(root, ".tmp");

mkdirSync(tmpDir, { recursive: true });

const env = {
  ...process.env,
  TEMP: tmpDir,
  TMP: tmpDir,
  PNPM_HOME: join(root, ".pnpm-home"),
  PATH: [join(root, ".pnpm-home"), process.env.PATH || ""].join(delimiter)
};

const pnpmBin = existsSync(localPnpm) ? localPnpm : "pnpm";
const result = spawnSync(pnpmBin, process.argv.slice(2), {
  cwd: root,
  env,
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.error) {
  console.error(`Failed to run pnpm. Install pnpm globally or keep the local shim at ${localPnpm}.`);
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
