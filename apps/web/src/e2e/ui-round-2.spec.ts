import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test.beforeAll(() => {
  mkdirSync("../../verification", { recursive: true });
});

const viewports = [
  { name: "mobile-375", width: 375, height: 900 },
  { name: "tablet-768", width: 768, height: 980 },
  { name: "desktop-1440", width: 1440, height: 1100 }
];

for (const viewport of viewports) {
  test(`online tools layout is usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/tools/");
    await expect(page.getByRole("heading", { name: "万能格式转换器" }).first()).toBeVisible();
    await expect(page.getByText("文件不上传服务器").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /图片裁切/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("点击选择文件，或拖拽文件到这里")).toBeVisible();
    await expect(page.locator("#ad-container")).toHaveCount(1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);

    await page.screenshot({
      path: `../../verification/ui-round-2-tools-${viewport.name}.png`,
      fullPage: true
    });
  });
}

test("download page keeps authorization copy clear and local-processing promise visible", async ({ page }) => {
  await page.goto("/download/");
  await expect(page.getByRole("heading", { name: "下载离线安装包" })).toBeVisible();
  await expect(page.getByText("离线专业版需要输入下载口令")).toBeVisible();
  await expect(page.getByText("CloudBase 只校验口令并生成下载链接，不接触用户处理文件")).toBeVisible();
  await expect(page.locator("#ad-container")).toHaveCount(1);
});
