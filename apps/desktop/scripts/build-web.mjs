import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("pnpm", ["--dir", "../web", "build"], {
  cwd,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_MODE: "desktop",
    NEXT_PUBLIC_ADS_ENABLED: "false"
  },
  shell: process.platform === "win32",
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
