import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const child = spawn("pnpm", ["--dir", "../web", "dev"], {
  cwd,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_MODE: "desktop",
    NEXT_PUBLIC_ADS_ENABLED: "false"
  },
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => process.exit(code ?? 1));
