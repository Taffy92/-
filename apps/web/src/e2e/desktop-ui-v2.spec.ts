import { expect, test } from "@playwright/test";

test.skip(process.env.DESKTOP_UI_CHECK !== "1", "Only runs against a Desktop-mode static export.");

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
