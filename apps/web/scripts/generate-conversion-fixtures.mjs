import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");
const projectRoot = resolve(webRoot, "../..");
const fixtureRoot = resolve(webRoot, "src/test-fixtures/conversion");
const ffmpegPath = resolve(
  projectRoot,
  "apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe"
);
const chineseFontPath = "C\\:/Windows/Fonts/msyh.ttc";
const fixedDate = new Date("2026-01-01T00:00:00.000Z");

const fixtureDirectories = ["image", "pdf", "word", "excel", "media", "ocr"];
for (const directory of fixtureDirectories) {
  await mkdir(resolve(fixtureRoot, directory), { recursive: true });
}

function runFfmpeg(args) {
  const result = spawnSync(
    ffmpegPath,
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { cwd: projectRoot, encoding: "utf8" }
  );
  if (result.status !== 0) {
    throw new Error(`FFmpeg fixture generation failed:\n${result.stderr}`);
  }
}

function fixturePath(...parts) {
  return resolve(fixtureRoot, ...parts);
}

async function writePdf(path, build) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Project-generated conversion fixture");
  pdf.setAuthor("Format Converter Project");
  pdf.setCreator("Fixture generator");
  pdf.setProducer("pdf-lib");
  pdf.setCreationDate(fixedDate);
  pdf.setModificationDate(fixedDate);
  await build(pdf);
  await writeFile(path, await pdf.save({ useObjectStreams: false }));
}

async function normalizeOfficeArchive(content) {
  const archive = await JSZip.loadAsync(content);
  const coreProperties = archive.file("docProps/core.xml");
  if (coreProperties) {
    const fixedIsoDate = fixedDate.toISOString();
    const normalizedProperties = (await coreProperties.async("string"))
      .replace(
        /(<dcterms:created\b[^>]*>)[^<]*(<\/dcterms:created>)/,
        `$1${fixedIsoDate}$2`
      )
      .replace(
        /(<dcterms:modified\b[^>]*>)[^<]*(<\/dcterms:modified>)/,
        `$1${fixedIsoDate}$2`
      );
    archive.file("docProps/core.xml", normalizedProperties, { date: fixedDate });
  }
  for (const entry of Object.values(archive.files)) entry.date = fixedDate;
  return archive.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
    platform: "DOS"
  });
}

runFfmpeg([
  "-f", "lavfi",
  "-i", "color=c=0xDCEBFA:s=640x480:d=1",
  "-vf", "drawbox=x=80:y=70:w=480:h=340:color=0x2563EB:t=18,drawbox=x=145:y=135:w=350:h=210:color=0x93C5FD:t=fill",
  "-frames:v", "1",
  "-q:v", "2",
  "-metadata", "comment=project-generated",
  "-update", "1",
  fixturePath("image", "basic-photo.jpg")
]);

runFfmpeg([
  "-f", "lavfi",
  "-i", "color=c=black@0.0:s=512x512:d=1",
  "-vf", "format=rgba,drawbox=x=48:y=48:w=300:h=300:color=0x2563EB@0.55:t=fill,drawbox=x=170:y=170:w=294:h=294:color=0x16A34A@0.55:t=fill",
  "-frames:v", "1",
  "-update", "1",
  fixturePath("image", "transparent-layers.png")
]);

runFfmpeg([
  "-f", "lavfi",
  "-i", "testsrc2=s=64x64:d=1",
  "-frames:v", "1",
  "-update", "1",
  fixturePath("image", "oversized-seed.png")
]);

await writeFile(
  fixturePath("image", "damaged.jpg"),
  Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49])
);

await writePdf(fixturePath("pdf", "basic-three-pages.pdf"), async (pdf) => {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let index = 1; index <= 3; index += 1) {
    const page = pdf.addPage([595, 842]);
    page.drawText(`Local conversion fixture - page ${index}`, {
      x: 72,
      y: 760,
      size: 24,
      font,
      color: rgb(0.08, 0.2, 0.45)
    });
    page.drawRectangle({ x: 72, y: 600, width: 451, height: 100, color: rgb(0.84, 0.91, 0.98) });
  }
});

await writePdf(fixturePath("pdf", "rotated-mixed-pages.pdf"), async (pdf) => {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const sizes = [[595, 842], [842, 595], [612, 792], [792, 612]];
  sizes.forEach((size, index) => {
    const page = pdf.addPage(size);
    if (index === 2) page.setRotation(degrees(90));
    page.drawText(`Mixed page ${index + 1}`, { x: 50, y: size[1] - 80, size: 22, font });
    page.drawRectangle({ x: 50, y: 80, width: size[0] - 100, height: 100, color: rgb(0.85, 0.95, 0.88) });
  });
});

await writePdf(fixturePath("pdf", "oversized-seed.pdf"), async (pdf) => {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([595, 842]);
  page.drawText("Seed page repeated by oversized tests", { x: 72, y: 760, size: 20, font });
});

await writeFile(
  fixturePath("pdf", "damaged-xref.pdf"),
  Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\nstartxref\n999999\n%%EOF", "ascii")
);

const docxModuleUrl = pathToFileURL(
  resolve(projectRoot, "packages/ocr-core/node_modules/docx/dist/index.mjs")
).href;
const {
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun
} = await import(docxModuleUrl);

const basicDocument = new Document({
  title: "Project-generated DOCX fixture",
  creator: "Format Converter Project",
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun({ text: "第一页：本地处理，保护隐私", bold: true, size: 32 })] }),
      new Paragraph("This document is generated for local conversion tests."),
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ children: [new TextRun({ text: "第二页：转换结果", bold: true, size: 32 })] })
    ]
  }]
});
await writeFile(
  fixturePath("word", "basic-two-pages.docx"),
  await normalizeOfficeArchive(await Packer.toBuffer(basicDocument))
);

const complexDocument = new Document({
  title: "Project-generated table fixture",
  creator: "Format Converter Project",
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun({ text: "表格与分页测试", bold: true, size: 30 })] }),
      new Table({
        rows: [
          new TableRow({ children: [new TableCell({ children: [new Paragraph("项目")] }), new TableCell({ children: [new Paragraph("结果")] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph("隐私")] }), new TableCell({ children: [new Paragraph("仅本地处理")] })] })
        ]
      }),
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph("分页后的内容必须出现在第二页。")
    ]
  }]
});
await writeFile(
  fixturePath("word", "table-pagebreak.docx"),
  await normalizeOfficeArchive(await Packer.toBuffer(complexDocument))
);
await writeFile(
  fixturePath("word", "legacy.doc"),
  Buffer.from("Legacy DOC is intentionally unsupported. Save as DOCX before conversion.\r\n", "ascii")
);

const basicWorkbook = new ExcelJS.Workbook();
basicWorkbook.creator = "Format Converter Project";
basicWorkbook.created = fixedDate;
basicWorkbook.modified = fixedDate;
const summarySheet = basicWorkbook.addWorksheet("Summary");
summarySheet.addRow(["项目", "日期", "数值"]);
summarySheet.addRow(["本地处理", new Date("2026-01-02T00:00:00.000Z"), 42]);
summarySheet.getColumn(2).numFmt = "yyyy-mm-dd";
const detailSheet = basicWorkbook.addWorksheet("Details");
detailSheet.addRow(["File", "Status"]);
detailSheet.addRow(["sample.pdf", "Ready"]);
await writeFile(
  fixturePath("excel", "basic-two-sheets.xlsx"),
  await normalizeOfficeArchive(await basicWorkbook.xlsx.writeBuffer())
);

const complexWorkbook = new ExcelJS.Workbook();
complexWorkbook.creator = "Format Converter Project";
complexWorkbook.created = fixedDate;
complexWorkbook.modified = fixedDate;
const formulaSheet = complexWorkbook.addWorksheet("Formula");
formulaSheet.mergeCells("A1:C1");
formulaSheet.getCell("A1").value = "合并单元格";
formulaSheet.addRow([2, 3, { formula: "A2+B2", result: 5 }]);
const secondSheet = complexWorkbook.addWorksheet("Second");
secondSheet.addRow(["Local", "Privacy"]);
await writeFile(
  fixturePath("excel", "formula-merged.xlsx"),
  await normalizeOfficeArchive(await complexWorkbook.xlsx.writeBuffer())
);
await writeFile(
  fixturePath("excel", "legacy.xls"),
  Buffer.from("Legacy XLS is intentionally unsupported. Save as XLSX before conversion.\r\n", "ascii")
);

runFfmpeg([
  "-f", "lavfi",
  "-i", "testsrc2=size=320x240:rate=24:duration=3",
  "-f", "lavfi",
  "-i", "sine=frequency=440:sample_rate=44100:duration=3",
  "-shortest",
  "-c:v", "mpeg4",
  "-q:v", "5",
  "-c:a", "aac",
  "-metadata", "comment=project-generated",
  fixturePath("media", "video-with-audio.mp4")
]);

runFfmpeg([
  "-f", "lavfi",
  "-i", "testsrc2=size=320x240:rate=24:duration=3",
  "-an",
  "-c:v", "libvpx-vp9",
  "-threads", "1",
  "-crf", "36",
  "-b:v", "0",
  "-map_metadata", "-1",
  "-bitexact",
  fixturePath("media", "video-no-audio.webm")
]);

runFfmpeg([
  "-f", "lavfi",
  "-i", "sine=frequency=440:sample_rate=44100:duration=3",
  "-af", "aformat=channel_layouts=stereo",
  "-c:a", "flac",
  fixturePath("media", "stereo.flac")
]);

await writeFile(
  fixturePath("media", "damaged.mp4"),
  Buffer.from("000000186674797069736F6D00000200", "hex")
);

runFfmpeg([
  "-f", "lavfi",
  "-i", "color=c=white:s=1000x360:d=1",
  "-vf", `drawtext=fontfile='${chineseFontPath}':text='本地处理 保护隐私':fontcolor=black:fontsize=58:x=70:y=120`,
  "-frames:v", "1",
  "-update", "1",
  fixturePath("ocr", "chinese-text.png")
]);

runFfmpeg([
  "-f", "lavfi",
  "-i", "color=c=white:s=1000x500:d=1",
  "-vf", `drawtext=fontfile='${chineseFontPath}':text='Local conversion 本地隐私':fontcolor=black:fontsize=52:x=70:y=190`,
  "-frames:v", "1",
  "-update", "1",
  fixturePath("ocr", "bilingual-page.png")
]);

await writePdf(fixturePath("ocr", "bilingual-two-pages.pdf"), async (pdf) => {
  const imageBytes = await readFile(fixturePath("ocr", "bilingual-page.png"));
  const image = await pdf.embedPng(imageBytes);
  for (let index = 0; index < 2; index += 1) {
    const page = pdf.addPage([595, 842]);
    page.drawImage(image, { x: 48, y: 460, width: 499, height: 249.5 });
  }
});
await rm(fixturePath("ocr", "bilingual-page.png"));

console.log(`Generated conversion fixtures in ${fixtureRoot}`);
