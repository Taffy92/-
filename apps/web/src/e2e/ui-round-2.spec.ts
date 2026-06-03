import { expect, type Page, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import ExcelJS from "exceljs";
import JSZip from "jszip";

test.beforeAll(() => {
  mkdirSync("../../verification", { recursive: true });
});

const viewports = [
  { name: "mobile-375", width: 375, height: 900 },
  { name: "tablet-768", width: 768, height: 980 },
  { name: "desktop-1440", width: 1440, height: 1100 }
];

for (const viewport of viewports) {
  test(`tools layout is usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/tools/", { waitUntil: "domcontentloaded" });

    const groupedNavigation = (await page.getByRole("button", { name: /图片工具/ }).count()) > 0;
    const onlineMode = (await page.getByText("在线版说明").count()) > 0;

    await expect(page.getByRole("heading", { name: /万能格式转换器/ }).first()).toBeVisible();
    await expect(page.getByText(/文件仅(在本地|在本机)处理.*不上传服务器/).first()).toBeVisible();

    if (groupedNavigation) {
      const imageSection = page.getByRole("button", { name: /图片工具/ });
      if ((await imageSection.getAttribute("aria-expanded")) !== "true") {
        await imageSection.click();
      }
      await expect(page.locator('button[aria-pressed="true"]').first()).toContainText(/裁剪|图片裁切/);
      await expect(page.getByText(/将(单个)?文件拖/).first()).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: /图片裁切/ })).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByText("将文件拖拽到此处，或点击上传")).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /开始(转换|处理)/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /停止(任务|处理)/ }).first()).toBeVisible();

    if (onlineMode) {
      await expect(page.locator("#ad-container")).toHaveCount(1);
    } else {
      await expect(page.locator("#ad-container")).toHaveCount(0);
    }

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
  await expect(page.getByRole("heading", { name: "下载离线安装版" })).toBeVisible();
  await expect(page.getByText("离线专业版现在可以直接下载试用")).toBeVisible();
  await expect(page.getByText("软件首次运行后自动开启本机 3 天试用")).toBeVisible();
  await expect(page.getByRole("link", { name: /下载 EXE 3 天试用版/ })).toHaveAttribute("href", /x64-setup\.exe$/);
  await expect(page.getByRole("link", { name: "发布说明" })).toHaveAttribute("href", "/release/v1.0.0/docs/release-notes/");
  await expect(page.getByRole("link", { name: "安装指南" })).toHaveAttribute("href", "/release/v1.0.0/docs/install-guide/");
  await expect(page.locator("#ad-container")).toHaveCount(1);
});

test("release compliance documents render as site pages instead of raw markdown", async ({ page }) => {
  await page.goto("/release/v1.0.0/docs/release-notes", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "发布说明", exact: true })).toBeVisible();
  await expect(page.getByText("站内 HTML 渲染版本")).toBeVisible();
  await expect(page.getByText("万能格式转换器").first()).toBeVisible();
});

test("pdf word and excel uploads render a local document preview", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.goto("/tools/", { waitUntil: "domcontentloaded" });

  const desktopMode = (await page.getByRole("button", { name: /文档工具/ }).count()) > 0;
  if (desktopMode) {
    await page.getByRole("button", { name: /文档工具/ }).click();
  }

  await page.getByRole("button", { name: /PDF 转图片/ }).click();
  await uploadToolFile(page, {
    name: "preview.pdf",
    mimeType: "application/pdf",
    buffer: createTinyPdfBuffer("PDF Preview")
  });
  await expect(page.getByRole("img", { name: /PDF 转图片预览/ })).toBeVisible();

  await page.getByRole("button", { name: /Word 转图片/ }).click();
  await uploadToolFile(page, {
    name: "preview.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: await createDocxBuffer()
  });
  await expect(page.getByRole("img", { name: /Word 转图片预览/ })).toBeVisible();

  await page.getByRole("button", { name: /Excel 转图片/ }).click();
  await uploadToolFile(page, {
    name: "preview.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: await createXlsxBuffer()
  });
  await expect(page.getByRole("img", { name: /Excel 转图片预览/ })).toBeVisible();
});

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
        <w:p><w:r><w:t>本地预览测试。</w:t></w:r></w:p>
      </w:body>
    </w:document>`
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" }));
}

async function createXlsxBuffer() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("预览");
  sheet.addRows([
    ["名称", "数量"],
    ["测试", "1"]
  ]);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
