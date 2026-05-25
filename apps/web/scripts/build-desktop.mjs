import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const pnpmCommand = process.platform === "win32" ? "pnpm.CMD" : "pnpm";

await rm(path.join(appRoot, ".next"), { recursive: true, force: true });
await rm(path.join(appRoot, "out"), { recursive: true, force: true });

const child = spawn(pnpmCommand, ["--filter", "web", "build"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_MODE: "desktop"
  },
  stdio: "inherit",
  shell: process.platform === "win32"
});

const code = await new Promise((resolve) => {
  child.on("close", resolve);
  child.on("error", () => resolve(1));
});

if (code !== 0) process.exit(Number(code) || 1);
