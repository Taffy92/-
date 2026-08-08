const zipFileName = "万能格式转换器_2.0.0_x64_zh-CN.zip";
const edgeOneManifestUrl = "/release/v2.0.0/edgeone-v24/manifest.json";

export const downloadsConfig = {
  appName: "万能格式转换器离线专业版",
  version: "2.0.0",
  fileName: zipFileName,
  fileSize: "758.59 MB",
  releaseDate: "2026-08-05",
  windowsCodeSigned: false,
  sha256: "191767A4402244E58EAE44DA4AFBC516EF7458C83B014C7EB7A21158C1CD87EC",
  manifestUrl: edgeOneManifestUrl,
  packages: [
    {
      type: "zip",
      label: "ZIP 安装包",
      fileName: zipFileName,
      fileSize: "758.59 MB",
      sha256: "191767A4402244E58EAE44DA4AFBC516EF7458C83B014C7EB7A21158C1CD87EC",
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
