import { expect, type Page, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import ExcelJS from "exceljs";
import JSZip from "jszip";

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
  dropzoneCurrent: "\u5c06\u76ee\u6807\u6587\u4ef6\u62d6\u62fd\u5230\u6b64\u533a\u57df\uff0c\u6216\u70b9\u51fb\u8f7d\u5165\u672c\u5730\u8d44\u6e90",
  dropzoneLegacy: "\u5c06\u6587\u4ef6\u62d6\u62fd\u5230\u6b64\u5904\uff0c\u6216\u70b9\u51fb\u4e0a\u4f20",
  start: "\u5f00\u59cb",
  stop: "\u7ec8\u6b62|\u505c\u6b62",
  downloadHeading: "\u4e0b\u8f7d\u79bb\u7ebf\u5b89\u88c5\u7248",
  trialDownloadCopy: "\u79bb\u7ebf\u4e13\u4e1a\u7248\u73b0\u5728\u53ef\u4ee5\u76f4\u63a5\u4e0b\u8f7d\u8bd5\u7528",
  trialRunCopy: "\u8f6f\u4ef6\u9996\u6b21\u8fd0\u884c\u540e\u81ea\u52a8\u5f00\u542f\u672c\u673a 3 \u5929\u8bd5\u7528",
  exeTrialDownload: "\u4e0b\u8f7d EXE 3 \u5929\u8bd5\u7528\u7248",
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

    await expandSectionIfPresent(page, labels.imageTools);
    await expect(page.locator("h1").first()).toContainText(labels.imageCrop);
    await expect(page.locator("#lbl-panel-main-desc")).toContainText(
      new RegExp(`${labels.localPrivacyCurrent}|${labels.localPrivacyLegacy}`)
    );
    await expect(page.locator('button[aria-pressed="true"]').first()).toContainText(
      new RegExp(`${labels.imageCrop}|${labels.imageCropLegacy}`)
    );
    await expect(page.getByText(new RegExp(`${labels.dropzoneCurrent}|${labels.dropzoneLegacy}`)).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(labels.start) }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(labels.stop) }).first()).toBeVisible();
    await expect(page.locator("#ad-container")).toHaveCount(1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);

    await page.screenshot({
      path: `../../verification/ui-round-2-tools-${viewport.name}.png`,
      fullPage: true
    });
  });
}

test("download page keeps trial download copy clear and local-processing promise visible", async ({ page }) => {
  await page.goto("/download/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("h1").first()).toContainText(labels.downloadHeading);
  await expect(page.getByText(labels.trialDownloadCopy).first()).toBeVisible();
  await expect(page.getByText(labels.trialRunCopy).first()).toBeVisible();
  await expect(page.getByRole("link", { name: labels.exeTrialDownload, exact: true })).toHaveAttribute("href", /x64-setup\.exe$/);
  await expect(page.getByRole("link", { name: labels.releaseNotes })).toHaveAttribute("href", "/release/v1.0.0/docs/release-notes/");
  await expect(page.getByRole("link", { name: labels.installGuide })).toHaveAttribute("href", "/release/v1.0.0/docs/install-guide/");
  await expect(page.locator("#ad-container")).toHaveCount(0);
});

test("release compliance documents render as site pages instead of raw markdown", async ({ page }) => {
  await page.goto("/release/v1.0.0/docs/release-notes", { waitUntil: "domcontentloaded" });

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

async function expandSectionIfPresent(page: Page, label: string) {
  const section = page.getByRole("button", { name: new RegExp(label) }).first();
  try {
    await section.waitFor({ state: "visible", timeout: 5_000 });
  } catch {
    return;
  }
  if ((await section.getAttribute("aria-expanded")) !== "true") {
    await section.click();
  }
}

async function openDocumentTool(page: Page, label: string) {
  await expandSectionIfPresent(page, labels.documentTools);
  const toolButton = page.getByRole("button", { name: new RegExp(label) }).first();
  await expect(toolButton).toBeVisible();
  await toolButton.click();
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
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>Word Preview</w:t></w:r></w:p>
        <w:p><w:r><w:t>Local preview test</w:t></w:r></w:p>
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
