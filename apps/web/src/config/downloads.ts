const exeFileName = "万能格式转换器_2.0.0_x64-setup.exe";
const msiFileName = "万能格式转换器_2.0.0_x64_zh-CN.msi";
const edgeOneManifestUrl = "/release/v2.0.0/edgeone-v24/manifest.json";

export const downloadsConfig = {
  appName: "万能格式转换离线专业版",
  version: "2.0.0",
  fileName: exeFileName,
  fileSize: "EXE 262.46 MB / MSI 272.80 MB",
  releaseDate: "2026-08-02",
  sha256:
    "EXE 04CB107A9B47CEC4FFD485E9E1450C1888C5283D31849050EAF7E308F9D1EB86 / MSI F69E2F9631E4401EDFE64CC0B5CDB20EBABB428CF795C4EC69BDD88F62B3F70B",
  manifestUrl: edgeOneManifestUrl,
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: exeFileName,
      fileSize: "262.46 MB",
      sha256: "04CB107A9B47CEC4FFD485E9E1450C1888C5283D31849050EAF7E308F9D1EB86",
      note: "推荐普通用户使用，安装后自动开启本机 3 天试用。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: msiFileName,
      fileSize: "272.80 MB",
      sha256: "F69E2F9631E4401EDFE64CC0B5CDB20EBABB428CF795C4EC69BDD88F62B3F70B",
      note: "适合企业、管理员或批量部署场景，同样内置 3 天试用。"
    }
  ],
  changelog: [
    "原有功能：图片、PDF、办公文档和音视频本地转换",
    "原有功能：离线批量队列、独立文件夹输出和本地授权",
    "统一工具目录：图片、PDF、文档、音视频与本地 OCR",
    "新增功能：在线版与离线版全新界面",
    "新增功能：百度联盟广告边界、赞赏入口和作者联系方式"
  ]
} as const;
