const zipFileName = "万能格式转换器_2.0.0_x64_zh-CN.zip";
const edgeOneManifestUrl = "/release/v2.0.0/edgeone-v24/manifest.json";

export const downloadsConfig = {
  appName: "万能格式转换器离线专业版",
  version: "2.0.0",
  fileName: zipFileName,
  fileSize: "272.80 MB",
  releaseDate: "2026-08-05",
  sha256: "5E4CA7F1592E228D9AAD7F303521FC9B20C172123A771271D3CC8BC962770B5A",
  manifestUrl: edgeOneManifestUrl,
  packages: [
    {
      type: "zip",
      label: "ZIP 安装包",
      fileName: zipFileName,
      fileSize: "272.80 MB",
      sha256: "5E4CA7F1592E228D9AAD7F303521FC9B20C172123A771271D3CC8BC962770B5A",
      note: "ZIP 内仅包含 MSI 安装包，解压后运行 MSI 即可安装离线专业版。"
    }
  ],
  changelog: [
    "保留图片、PDF、办公文档和音视频本地转换能力",
    "保留离线批量队列、独立文件夹输出和本地授权",
    "统一工具目录：图片、PDF、文档、音视频与本地 OCR",
    "发布下载收敛为单一 ZIP，ZIP 内仅保留 MSI"
  ]
} as const;
