const exeFileName = "万能格式转换器_2.0.0_x64-setup.exe";
const msiFileName = "万能格式转换器_2.0.0_x64_zh-CN.msi";
const edgeOneManifestUrl = "/release/v2.0.0/edgeone/manifest.json";

export const downloadsConfig = {
  appName: "万能格式转换离线专业版",
  version: "2.0.0",
  fileName: exeFileName,
  fileSize: "EXE 262.45 MB / MSI 272.81 MB",
  releaseDate: "2026-08-02",
  sha256:
    "EXE AF9EB0B6B2953421C917D91805D905055D68FF258BFFA4DFBAF866A132711F9F / MSI 9882F3EBDB02F72493D4236A1257422253C6ED5636FE4B0FEF1F88B504016AFF",
  manifestUrl: edgeOneManifestUrl,
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: exeFileName,
      fileSize: "262.45 MB",
      sha256: "AF9EB0B6B2953421C917D91805D905055D68FF258BFFA4DFBAF866A132711F9F",
      note: "推荐普通用户使用，安装后自动开启本机 3 天试用。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: msiFileName,
      fileSize: "272.81 MB",
      sha256: "9882F3EBDB02F72493D4236A1257422253C6ED5636FE4B0FEF1F88B504016AFF",
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
