export const imageAccept = [".jpg", ".jpeg", ".png", ".webp", ".bmp"].join(",");
export const pdfAccept = ".pdf";
export const wordAccept = ".docx";
export const excelAccept = [".xlsx", ".csv"].join(",");
export const videoAccept = [".mp4", ".mov", ".avi", ".mkv", ".webm"].join(",");
export const audioAccept = [".mp3", ".wav", ".aac", ".m4a", ".flac"].join(",");
export const maxOnlineFileSize = 80 * 1024 * 1024;

export const privacyNotice =
  "你的文件只在当前设备中处理，不会上传到服务器。处理完成后可直接下载结果。敏感文件建议使用离线安装版。";

export const pdfBoundaryNotice =
  "本工具提供 PDF 转图片功能，不提供 PDF 编辑、PDF 转 Word、PDF 转 Excel、PDF 文字修改、PDF 涂销、PDF 签名盖章等功能。";

export const forbiddenFeatureTerms = [
  "PDF 编辑",
  "PDF 精准编辑",
  "PDF 局部修改",
  "PDF 安全涂销",
  "PDF 签名盖章",
  "PDF 批注标注"
];
