const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const requireFromWeb = createRequire(path.join(__dirname, "..", "..", "apps", "web", "package.json"));
const JSZip = requireFromWeb("jszip");
const ExcelJS = requireFromWeb("exceljs");

const input = path.join(__dirname, "\u8f93\u5165 \u6587\u4ef6\u5939");

(async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.folder("word").file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>万能格式转换器标准 DOCX 冒烟测试</w:t></w:r></w:p>
    <w:p><w:r><w:t>用于离线专业版批量 Word 转图片验证。</w:t></w:r></w:p>
    <w:sectPr/>
  </w:body>
</w:document>`);
  fs.writeFileSync(path.join(input, "\u6807\u51c6 \u6587\u6863.docx"), await zip.generateAsync({ type: "nodebuffer" }));

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("\u6d4b\u8bd5\u8868");
  ws.addRow(["\u9879\u76ee", "\u6570\u91cf", "\u5907\u6ce8"]);
  ws.addRow(["\u56fe\u7247", 2, "\u4e2d\u6587\u8def\u5f84"]);
  ws.addRow(["\u97f3\u9891", 1, "\u79bb\u7ebf\u5904\u7406"]);
  await wb.xlsx.writeFile(path.join(input, "\u6807\u51c6 \u8868\u683c.xlsx"));
})();
