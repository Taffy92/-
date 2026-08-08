import { expect, type Page, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { downloadsConfig } from "../config/downloads";
import { getUnifiedToolHref, unifiedTools } from "../config/toolCatalog";

test.beforeAll(() => {
  mkdirSync("../../verification", { recursive: true });
});

const labels = {
  imageTools: "\u56fe\u7247\u5de5\u5177",
  documentTools: "\u6587\u6863\u5de5\u5177",
  imageCrop: "\u56fe\u7247\u88c1\u5207",
  imageCropLegacy: "\u56fe\u7247\u88c1\u526a",
  localPrivacyCurrent: "\u6587\u4ef6\u53ea\u5728\u5f53\u524d\u8bbe\u5907\u5904\u7406\uff0c\u4e0d\u4e0a\u4f20\u670d\u52a1\u5668\u3002",
  localPrivacyLegacy: "\u6587\u4ef6\u4ec5\u5728\u672c\u5730\u5904\u7406\uff0c\u4e0d\u4e0a\u4f20\u670d\u52a1\u5668",
  dropzoneCurrent: "\u62d6\u653e\u6587\u4ef6\u5230\u8fd9\u91cc\uff0c\u6216\u70b9\u51fb\u9009\u62e9\u6587\u4ef6",
  dropzoneLegacy: "\u5c06\u6587\u4ef6\u62d6\u62fd\u5230\u6b64\u5904\uff0c\u6216\u70b9\u51fb\u4e0a\u4f20",
  start: "\u5f00\u59cb\u8f6c\u6362",
  stop: "\u505c\u6b62",
  downloadHeading: "\u4e0b\u8f7d\u79bb\u7ebf\u5b89\u88c5\u7248",
  trialDownloadCopy: "\u79bb\u7ebf\u4e13\u4e1a\u7248\u9762\u5411\u6279\u91cf\u5904\u7406\u3001\u654f\u611f\u6587\u4ef6\u548c\u65ad\u7f51\u529e\u516c\u3002",
  trialRunCopy: "\u65e0\u9700\u767b\u5f55\uff0c\u9996\u6b21\u8fd0\u884c\u81ea\u52a8\u5f00\u542f 3 \u5929\u5b8c\u6574\u8bd5\u7528",
  zipTrialDownload: "\u4e0b\u8f7d ZIP 3 \u5929\u8bd5\u7528\u7248",
  smartScreen: "\u5f53\u524d\u5b89\u88c5\u5305\u5c1a\u672a\u4ee3\u7801\u7b7e\u540d",
  integrity: "\u67e5\u770b SHA256 \u4e0e\u5206\u7247\u5b8c\u6574\u6027\u8bf4\u660e",
  releaseNotes: "\u53d1\u5e03\u8bf4\u660e",
  installGuide: "\u5b89\u88c5\u6307\u5357",
  siteReading: "\u7ad9\u5185\u9605\u8bfb\u7248",
  productName: "\u4e07\u80fd\u683c\u5f0f\u8f6c\u6362\u5668",
  pdfToImage: "PDF \u8f6c\u56fe\u7247",
  wordToImage: "Word \u8f6c\u56fe\u7247",
  excelToImage: "Excel \u8f6c\u56fe\u7247",
  preview: "\u9884\u89c8"
};

const viewports = [
  { name: "mobile-375", width: 375, height: 900 },
  { name: "tablet-768", width: 768, height: 980 },
  { name: "desktop-1440", width: 1440, height: 1100 }
];

for (const viewport of viewports) {
  test(`tools layout is usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/tools/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1, name: "所有转换任务，一页找到。" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "搜索工具或格式" })).toBeVisible();
    await expect(page.locator(".online-tool-directory-grid > a")).toHaveCount(24);
    await expect(page.locator("#baidu-tool-directory-ad-container")).toHaveAttribute("data-ad-provider", "baidu");

    await page.getByRole("button", { name: "图片", exact: true }).click();
    await expect(page.locator(".online-tool-directory-grid > a")).toHaveCount(7);
    await expect(page.getByRole("link", { name: /图片格式转换/ })).toHaveAttribute("href", /\/local-tools\/?\?tool=image-convert/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);

    await page.screenshot({
      path: `../../verification/ui-round-2-tools-${viewport.name}.png`,
      fullPage: true
    });
  });
}

test("home page renders the homepage ad slot", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#baidu-home-ad-container")).toHaveAttribute("data-ad-provider", "baidu");
  await expect(page.locator('script[src*="googlesyndication"], script[src*="doubleclick"]')).toHaveCount(0);
});

test("all 24 unified tools open their implemented workbench without browser errors", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  for (const tool of unifiedTools) {
    await page.goto(getUnifiedToolHref(tool), { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: tool.label })).toBeVisible();
  }

  expect(unifiedTools).toHaveLength(24);
  expect(browserErrors).toEqual([]);
});

test("primary pages expose named controls and keyboard-contained dialogs", async ({ page }) => {
  for (const path of ["/", "/tools/", "/local-tools/"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const accessibilityProblems = await page.locator("body").evaluate(() => {
      const visible = (element: Element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };
      const unnamedControls = Array.from(
        document.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea")
      ).filter((element) => {
        if (!visible(element)) return false;
        if (element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || element.getAttribute("title")) return false;
        if (element.textContent?.trim()) return false;
        return !("labels" in element) || !(element as HTMLInputElement).labels?.length;
      });
      const imagesWithoutAlt = Array.from(document.querySelectorAll("img")).filter(
        (image) => visible(image) && !image.hasAttribute("alt")
      );
      const ids = Array.from(document.querySelectorAll<HTMLElement>("[id]")).map((element) => element.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      return {
        duplicateIds,
        imagesWithoutAlt: imagesWithoutAlt.map((image) => image.outerHTML),
        unnamedControls: unnamedControls.map((element) => element.outerHTML)
      };
    });
    expect(accessibilityProblems).toEqual({
      duplicateIds: [],
      imagesWithoutAlt: [],
      unnamedControls: []
    });
  }

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const supportTrigger = page.getByRole("button", { name: "支持作者" });
  await supportTrigger.click();
  const supportDialog = page.getByRole("dialog", { name: "支持作者" });
  await expect(page.getByRole("button", { name: "关闭支持作者弹窗" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await supportDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(supportDialog).toBeHidden();
  await expect(supportTrigger).toBeFocused();

  await page.goto("/tools/", { waitUntil: "domcontentloaded" });
  const search = page.getByRole("searchbox", { name: "搜索工具或格式" });
  await search.fill("PDF");
  await expect(page.locator(".online-tool-directory-grid > a")).toHaveCount(7);
  await search.fill("");
  await page.getByRole("button", { name: "OCR", exact: true }).click();
  await expect(page.locator(".online-tool-directory-grid > a")).toHaveCount(1);
  await page.getByRole("link", { name: /图片 \/ PDF 文字识别/ }).focus();
  await expect(page.getByRole("link", { name: /图片 \/ PDF 文字识别/ })).toBeFocused();
});

for (const viewport of [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "desktop-1440", width: 1440, height: 960 }
]) {
  test(`home and support dialog are usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /文件转换.*浏览器本地完成/ })).toBeVisible();
    if (viewport.width < 800) {
      await page.getByRole("button", { name: "打开导航菜单" }).click();
    }
    await page.getByRole("button", { name: "支持作者" }).click();
    await expect(page.getByRole("dialog", { name: "支持作者" })).toBeVisible();
    await expect(page.getByText("___Skyblue", { exact: true })).toBeVisible();
    await expect(page.getByText("370298218@qq.com", { exact: true })).toBeVisible();
    await expect(page.getByAltText("微信赞赏二维码")).toBeVisible();
    await expect(page.getByAltText("支付宝赞赏二维码")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);

    await page.screenshot({
      path: `../../verification/ui-v2-home-${viewport.name}.png`,
      fullPage: true
    });
  });
}

test("local processing tools use the same unified workbench", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/local-tools/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1, name: "图片格式转换" })).toBeVisible();
  await expect(page.getByRole("button", { name: /选择一个(?:或多个)?本地文件/ })).toBeVisible();
  await expect(page.getByText("处理参数", { exact: true })).toBeVisible();
  await expect(page.getByText("增强工具", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "支持作者" }).click();
  await expect(page.getByRole("dialog", { name: "支持作者" })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);

  await page.screenshot({
    path: "../../verification/ui-v2-local-tools-desktop.png",
    fullPage: true
  });
});

test("download page keeps trial download copy clear and local-processing promise visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/download/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("h1").first()).toContainText(labels.downloadHeading);
  await expect(page.getByText(labels.trialDownloadCopy).first()).toBeVisible();
  await expect(page.getByText(labels.trialRunCopy).first()).toBeVisible();
  await expect(page.getByRole("button", { name: labels.zipTrialDownload, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: labels.smartScreen })).toBeVisible();
  await page.getByText(labels.integrity, { exact: true }).click();
  await expect(page.getByText(downloadsConfig.sha256)).toBeVisible();
  await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: labels.releaseNotes })).toHaveAttribute("href", "/release/v2.0.0/docs/release-notes/");
  await expect(page.getByRole("link", { name: labels.installGuide })).toHaveAttribute("href", "/release/v2.0.0/docs/install-guide/");
  await expect(page.locator("#ad-container")).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test("download primary action remains visible on a 375px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/download/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: labels.zipTrialDownload, exact: true })).toBeVisible();
  await expect(page.getByText("Windows 10 / 11 x64", { exact: true }).first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test("release compliance documents render as site pages instead of raw markdown", async ({ page }) => {
  await page.goto("/release/v2.0.0/docs/release-notes", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: labels.releaseNotes, exact: true })).toBeVisible();
  await expect(page.getByText(labels.siteReading)).toBeVisible();
  await expect(page.getByText(labels.productName).first()).toBeVisible();
});

test("pdf word and excel uploads render a local document preview", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.goto("/tools/", { waitUntil: "domcontentloaded" });

  await openDocumentTool(page, labels.pdfToImage);
  await uploadToolFile(page, {
    name: "preview.pdf",
    mimeType: "application/pdf",
    buffer: createTinyPdfBuffer("PDF Preview")
  });
  await expect(page.getByRole("img", { name: new RegExp(`PDF.*${labels.preview}`) })).toBeVisible();

  await openDocumentTool(page, labels.wordToImage);
  await uploadToolFile(page, {
    name: "preview.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: await createDocxBuffer()
  });
  await expect(page.getByRole("img", { name: new RegExp(`Word.*${labels.preview}`) })).toBeVisible();

  await openDocumentTool(page, labels.excelToImage);
  await uploadToolFile(page, {
    name: "preview.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: await createXlsxBuffer()
  });
  await expect(page.getByRole("img", { name: new RegExp(`Excel.*${labels.preview}`) })).toBeVisible();
});

async function openDocumentTool(page: Page, label: string) {
  const toolIds: Record<string, string> = {
    [labels.pdfToImage]: "pdf-images",
    [labels.wordToImage]: "word-images",
    [labels.excelToImage]: "excel-images"
  };
  await page.goto(`/tools/?tool=${toolIds[label]}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toContainText(label);
}

async function uploadToolFile(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  await page.locator('input[type="file"]').first().setInputFiles(file);
}

function createTinyPdfBuffer(text: string) {
  const stream = `BT /F1 24 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  ];
  let body = "%PDF-1.4\n";
  const offsets = objects.map((object) => {
    const offset = Buffer.byteLength(body, "ascii");
    body += object;
    return offset;
  });
  const xrefOffset = Buffer.byteLength(body, "ascii");
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  body += `trailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, "ascii");
}

async function createDocxBuffer() {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>`
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    </Relationships>`
  );
  zip.file(
    "word/styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr></w:rPrDefault></w:docDefaults>
      <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
    </w:styles>`
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>Word Preview</w:t></w:r></w:p>
        <w:p><w:r><w:t>Local preview test</w:t></w:r></w:p>
        <w:sectPr>
          <w:pgSz w:w="12240" w:h="15840"/>
          <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
        </w:sectPr>
      </w:body>
    </w:document>`
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" }));
}

async function createXlsxBuffer() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Preview");
  sheet.addRows([
    ["Name", "Count"],
    ["Test", "1"]
  ]);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
