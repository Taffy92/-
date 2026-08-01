import { expect, test } from "@playwright/test";

test("private license admin stays simple on desktop and mobile", async ({ page }) => {
  let loggedIn = false;
  const licenseCode = `UFC1-${"A".repeat(520)}`;
  const history = [{
    recordId: "REC-TEST",
    licenseId: "LIC-TEST",
    parentLicenseId: null,
    customerName: "测试客户",
    maskedMachineCode: "TEST-****-****-TEST",
    issuedAt: 1_700_000_000,
    previousExpiresAt: null,
    expiresAt: 1_702_592_000,
    durationDays: 30,
    permanent: false,
    licenseCode,
    remark: "首次授权",
    createdAt: 1_700_000_000,
    status: "active"
  }];

  await page.route("**/api/admin/license/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/health")) {
      await route.fulfill({ json: { ok: true, authenticated: loggedIn } });
      return;
    }
    if (url.pathname.endsWith("/session") && request.method() === "POST") {
      const body = request.postDataJSON() as { password?: string };
      if (body.password !== "123456") {
        await route.fulfill({ status: 401, json: { ok: false, error: "密码不正确" } });
        return;
      }
      loggedIn = true;
      await route.fulfill({ json: { ok: true } });
      return;
    }
    if (!loggedIn) {
      await route.fulfill({ status: 401, json: { ok: false, error: "请重新登录。" } });
      return;
    }
    if (url.pathname.endsWith("/records")) {
      await route.fulfill({
        json: { ok: true, page: 1, pageSize: 20, total: history.length, items: history }
      });
      return;
    }
    if (url.pathname.endsWith("/generate")) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      await route.fulfill({
        json: {
          ok: true,
          recordId: "REC-NEW",
          licenseId: "LIC-NEW",
          parentLicenseId: null,
          customerName: "测试客户",
          machineCode: "TEST-TEST-TEST-TEST",
          issuedAt: 1_700_000_000,
          previousExpiresAt: null,
          expiresAt: 1_702_592_000,
          durationDays: 30,
          permanent: false,
          licenseCode,
          licenseFileName: "license.mrx",
          licenseFileContent: '{"version":"ufc-license-v1"}\n'
        }
      });
      return;
    }
    await route.fulfill({ status: 404, json: { ok: false, error: "Not Found" } });
  });

  await page.goto("/admin/license/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "离线授权后台" })).toBeVisible();

  await page.getByLabel("管理员密码").fill("000000");
  await page.getByRole("button", { name: "进入后台" }).click();
  await expect(page.getByText("密码不正确")).toBeVisible();

  await page.getByLabel("管理员密码").fill("123456");
  await page.getByRole("button", { name: "进入后台" }).click();
  await expect(page.getByRole("heading", { name: "生成授权" })).toBeVisible();

  await page.getByLabel("客户名称").fill("测试客户");
  await page.getByLabel("机器码", { exact: true }).fill("test test test test");
  await expect(page.getByLabel("机器码", { exact: true })).toHaveValue("TEST-TEST-TEST-TEST");
  await page.getByRole("button", { name: "30 天" }).click();
  const generate = page.getByRole("button", { name: "生成授权码" });
  await generate.click();
  await expect(generate).toBeDisabled();

  await expect(page.getByRole("heading", { name: "授权已生成" })).toBeVisible();
  await expect(page.getByRole("button", { name: "复制授权码" })).toBeVisible();
  await expect(page.getByRole("button", { name: "下载 license.mrx" })).toBeVisible();
  await expect(page.getByAltText("授权码二维码")).toBeVisible();
  await expect(page.getByText("查看完整授权码")).toBeVisible();
  await expect(page.getByText("TEST-****-****-TEST")).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});
