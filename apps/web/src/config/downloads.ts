const exeFileName = "万能格式转换器_2.0.0_x64-setup.exe";
const msiFileName = "万能格式转换器_2.0.0_x64_zh-CN.msi";
const edgeOneManifestUrl = "/release/v2.0.0/edgeone/manifest.json";

export const downloadsConfig = {
  appName: "万能格式转换离线专业版",
  version: "2.0.0",
  fileName: exeFileName,
  fileSize: "EXE 256.83 MB / MSI 267.27 MB",
  releaseDate: "2026-07-29",
  sha256:
    "EXE 774E1689AD352933B1F6BBA73DA41A9CE476EE7C590B8960EACD246DDD98D789 / MSI 896B0979634D39E267904D2EE69D82A8D99125ABBCF0BDF2617808CA0781F2E2",
  manifestUrl: edgeOneManifestUrl,
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: exeFileName,
      fileSize: "256.83 MB",
      sha256: "774E1689AD352933B1F6BBA73DA41A9CE476EE7C590B8960EACD246DDD98D789",
      note: "推荐普通用户使用，安装后自动开启本机 3 天试用。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: msiFileName,
      fileSize: "267.27 MB",
      sha256: "896B0979634D39E267904D2EE69D82A8D99125ABBCF0BDF2617808CA0781F2E2",
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
