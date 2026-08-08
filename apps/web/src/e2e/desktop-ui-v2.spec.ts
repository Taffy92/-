import { expect, type Page, test } from "@playwright/test";

test.skip(process.env.DESKTOP_UI_CHECK !== "1", "Only runs against a Desktop-mode static export.");

const licenseContact = {
  wechat: "___Skyblue",
  phone: "15588261515",
  email: "370298218@qq.com"
};

async function mockDesktopLicense(page: Page, initialStatus: Record<string, unknown>, activatedStatus?: Record<string, unknown>) {
  await page.addInitScript(({ initial, activated }) => {
    (window as unknown as { __TAURI__: unknown }).__TAURI__ = {
      tauri: {
        invoke: async (command: string) => {
          if (command === "get_license_status") return initial;
          if (command === "activate_license_code" || command === "activate_license_file_content") return activated || initial;
          if (command === "create_activation_request") return {};
          throw new Error(`Unexpected command: ${command}`);
        }
      }
    };
  }, { initial: initialStatus, activated: activatedStatus });
}

test("offline main workbench is usable and contains no online ads", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("离线专业版", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "开始转换" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "支持作者" })).toBeVisible();
  await expect(page.locator('[data-ad-provider], [id*="ad-container"]')).toHaveCount(0);
  await expect(page.locator('script[src*="baidu"], script[src*="googlesyndication"]')).toHaveCount(0);

  const supportTrigger = page.getByRole("button", { name: "支持作者" });
  await supportTrigger.click();
  const supportDialog = page.getByRole("dialog", { name: "支持作者" });
  await expect(supportDialog).toBeVisible();
  await expect(page.getByText("___Skyblue", { exact: true })).toBeVisible();
  await expect(page.getByText("370298218@qq.com", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭支持作者弹窗" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await supportDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(supportDialog).toBeHidden();
  await expect(supportTrigger).toBeFocused();
  await supportTrigger.click();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);

  await page.screenshot({
    path: "../../verification/ui-v2-offline-workbench.png",
    fullPage: true
  });
});

test("offline local tools remain simple and local", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/local-tools/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1, name: "任务画布" })).toBeVisible();
  await expect(page.getByRole("button", { name: /添加要处理的文件/ })).toBeVisible();
  await expect(page.getByText("当前工具", { exact: true })).toBeVisible();
  await expect(page.getByText("增强工具", { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-ad-provider], [id*="ad-container"]')).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);

  await page.screenshot({
    path: "../../verification/ui-v2-offline-local-tools.png",
    fullPage: true
  });
});

test("offline tool switches stay responsive without reloading the workbench", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/tools/?tool=video-convert", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 2, name: "视频格式转换" })).toBeVisible();
  await expect(page.getByText("全部工具", { exact: true })).toHaveCount(0);
  await page.evaluate(() => { document.body.dataset.offlineSwitchMarker = "keep"; });

  await page.locator('.desktop-a-current-tools a[href*="audio-convert"]').click();
  await expect(page.getByRole("heading", { level: 2, name: "音频格式转换" })).toBeVisible();
  expect(await page.locator("body").getAttribute("data-offline-switch-marker")).toBe("keep");

  await page.locator('.desktop-a-current-tools a[href*="video-audio"]').click();
  await expect(page.getByRole("heading", { level: 2, name: "视频提取音频" })).toBeVisible();
  expect(await page.locator("body").getAttribute("data-offline-switch-marker")).toBe("keep");
});

test("offline trial shows remaining days without covering the workbench", async ({ page }) => {
  await mockDesktopLicense(page, {
    allowed: true,
    mode: "trial",
    reasonCode: "trial_active",
    reason: "3 天试用中。",
    product: "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO",
    softwareName: "万能格式转换器离线专业版",
    machineId: "TEST-TEST-TEST-TEST",
    nowUtc: 1_700_000_000,
    trialExpiresAt: 1_700_172_800,
    trialRemainingSeconds: 172_800,
    license: null,
    contact: licenseContact
  });
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("本地授权：试用剩余 2 天", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "任务画布" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "试用已结束" })).toHaveCount(0);
});

test("offline activation returns to the same task without restarting", async ({ page }) => {
  const lockedStatus = {
    allowed: false,
    mode: "locked",
    reasonCode: "trial_expired",
    reason: "3 天试用已结束，请联系管理员获取正式授权。",
    product: "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO",
    softwareName: "万能格式转换器离线专业版",
    machineId: "TEST-TEST-TEST-TEST",
    nowUtc: 1_700_259_200,
    trialExpiresAt: 1_700_172_800,
    trialRemainingSeconds: 0,
    license: null,
    contact: licenseContact
  };
  await mockDesktopLicense(page, lockedStatus, {
    ...lockedStatus,
    allowed: true,
    mode: "license",
    reasonCode: "license_active",
    reason: "授权有效。"
  });
  await page.setViewportSize({ width: 1120, height: 720 });
  await page.goto("/tools/?tool=video-convert", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "试用已结束" })).toBeVisible();
  await expect(page.getByRole("button", { name: "导入 license.mrx" })).toBeVisible();
  await page.getByPlaceholder("UFC1-...").fill("UFC1-TEST");
  await page.getByRole("button", { name: "激活", exact: true }).click();

  await expect(page.getByRole("heading", { level: 2, name: "视频格式转换" })).toBeVisible();
  await expect(page.getByText("本地授权：已授权", { exact: true })).toBeVisible();
  expect(page.url()).toContain("tool=video-convert");
});
