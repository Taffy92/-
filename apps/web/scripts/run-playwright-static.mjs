import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outToolsPage = join(appRoot, "out", "tools", "index.html");
const host = "127.0.0.1";
const port = "3010";
const baseUrl = `http://${host}:${port}/tools/`;
const playwrightBin = process.platform === "win32"
  ? join(appRoot, "node_modules", ".bin", "playwright.CMD")
  : join(appRoot, "node_modules", ".bin", "playwright");
const playwrightCommand = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : playwrightBin;
const playwrightArgs = process.platform === "win32" ? ["/d", "/c", `call ${playwrightBin} test`] : ["test"];

if (!existsSync(outToolsPage)) {
  console.error("Missing static export. Run `pnpm build` in apps/web before browser checks.");
  process.exit(1);
}

function startServer() {
  const child = spawn(process.execPath, ["scripts/static-server.mjs", "--hostname", host, "--port", port], {
    cwd: appRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", (chunk) => process.stdout.write(`[static] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[static] ${chunk}`));
  return child;
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 500));
    }
  }
  throw new Error(`Static server did not become ready at ${baseUrl}`);
}

function runPlaywright() {
  return new Promise((resolveRun) => {
    const child = spawn(playwrightCommand, playwrightArgs, {
      cwd: appRoot,
      env: { ...process.env, PLAYWRIGHT_SKIP_WEBSERVER: "1" },
      stdio: "inherit"
    });
    child.on("exit", (code) => resolveRun(code ?? 1));
    child.on("error", () => resolveRun(1));
  });
}

const server = startServer();

try {
  await waitForServer();
  const code = await runPlaywright();
  process.exitCode = Number(code);
} finally {
  server.kill();
}
