import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: "http://127.0.0.1:3010",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3010",
    url: "http://127.0.0.1:3010/tools/",
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
