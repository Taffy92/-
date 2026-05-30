import { expect, test } from "@playwright/test";

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
    if (/googlesyndication|baidu|cloudbase|createDownloadUrl/i.test(url)) allowedNetworkRequests.push(url);
  });

  await page.goto("/tools/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/文件仅(在本地|在本机)处理.*不上传服务器/).first()).toBeVisible();

  await page.waitForTimeout(500);
  expect(fileUploadRequests).toEqual([]);
  expect(allowedNetworkRequests.every((url) => !/private|sample|blob:/i.test(url))).toBe(true);
});
