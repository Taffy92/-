import { defineConfig, devices } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));
const playwrightPort = process.env.PLAYWRIGHT_PORT || "43871";
const localNoProxy = ["127.0.0.1", "localhost", "::1"];
process.env.NO_PROXY = [process.env.NO_PROXY, ...localNoProxy].filter(Boolean).join(",");
process.env.no_proxy = [process.env.no_proxy, ...localNoProxy].filter(Boolean).join(",");

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: `http://127.0.0.1:${playwrightPort}`,
    trace: "retain-on-failure"
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1" ? undefined : {
    command: `node scripts/static-server.mjs --hostname 127.0.0.1 --port ${playwrightPort}`,
    cwd: configDir,
    url: `http://127.0.0.1:${playwrightPort}/tools/`,
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
