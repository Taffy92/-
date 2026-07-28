import { expect, test } from "@playwright/test";

test.skip(process.env.DESKTOP_UI_CHECK !== "1", "Only runs against a Desktop-mode static export.");

test("offline main workbench is usable and contains no online ads", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("离线专业版", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "开始转换" })).toBeVisible();
  await expect(page.getByRole("button", { name: "支持作者" })).toBeVisible();
  await expect(page.locator('[data-ad-provider], [id*="ad-container"]')).toHaveCount(0);
  await expect(page.locator('script[src*="baidu"], script[src*="googlesyndication"]')).toHaveCount(0);

  await page.getByRole("button", { name: "支持作者" }).click();
  await expect(page.getByRole("dialog", { name: "支持作者" })).toBeVisible();
  await expect(page.getByText("___Skyblue", { exact: true })).toBeVisible();
  await expect(page.getByText("370298218@qq.com", { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);

  await page.screenshot({
    path: "../../verification/ui-v2-offline-workbench.png",
    fullPage: true
  });
});

test("offline enhanced workbench remains simple and local", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/local-tools/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "新增本地处理工具" })).toBeVisible();
  await expect(page.getByRole("button", { name: /选择一个或多个本地文件/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "处理参数" })).toBeVisible();
  await expect(page.locator('[data-ad-provider], [id*="ad-container"]')).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);

  await page.screenshot({
    path: "../../verification/ui-v2-offline-local-tools.png",
    fullPage: true
  });
});
