import { expect, test } from "@playwright/test";

const localPrivacyText =
  "\u6587\u4ef6\u53ea\u5728\u5f53\u524d\u8bbe\u5907\u5904\u7406\uff0c\u4e0d\u4e0a\u4f20\u670d\u52a1\u5668\u3002";

test("local processing page does not upload user files while ads and download authorization stay isolated", async ({ page }) => {
  const fileUploadRequests: string[] = [];
  const allowedNetworkRequests: string[] = [];

  page.on("request", async (request) => {
    const method = request.method();
    const url = request.url();
    const postDataBuffer = request.postDataBuffer();
    const contentType = request.headers()["content-type"] || "";
    const looksLikeUserFileUpload =
      method !== "GET" &&
      Boolean(postDataBuffer?.byteLength) &&
      (/multipart\/form-data|application\/pdf|image\/|video\/|audio\/|officedocument|octet-stream/i.test(contentType) ||
        /upload|ocr|convert|process/i.test(url));

    if (looksLikeUserFileUpload) fileUploadRequests.push(url);
    if (/baidu|cloudbase|createDownloadUrl/i.test(url)) allowedNetworkRequests.push(url);
  });

  await page.goto("/tools/", { waitUntil: "domcontentloaded" });
  await page.locator(".online-tool-directory-grid > a").first().click();
  await expect(page.getByText(localPrivacyText, { exact: false })).toBeVisible();

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "privacy-network-test.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z7mAAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByText("privacy-network-test.png", { exact: false })).toBeVisible();

  await page.waitForTimeout(500);
  expect(fileUploadRequests).toEqual([]);
  expect(allowedNetworkRequests.every((url) => !/private|sample|blob:/i.test(url))).toBe(true);
});
