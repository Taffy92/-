export const downloadsConfig = {
  appName: "万能格式转换器 离线专业版",
  version: "1.0.0",
  fileName: "万能格式转换器_1.0.0_x64-setup.exe",
  fileSize: "EXE 约 245.62 MB / MSI 约 256.43 MB",
  releaseDate: "2026-06-01",
  sha256:
    "EXE 5DFE1ACD54506DD97B554A02EF09F031D4D1BCF5205AD4A784C82E5B1D410E67 / MSI 5FB61C722D282E9464AE8014B978D04DE5D1AEFFFC80E4EB1C2A6EE5934C5766",
  primaryDownloadUrl: "",
  backupDownloadUrl: "",
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: "万能格式转换器_1.0.0_x64-setup.exe",
      fileSize: "245.62 MB",
      sha256: "5DFE1ACD54506DD97B554A02EF09F031D4D1BCF5205AD4A784C82E5B1D410E67",
      note: "推荐普通用户使用，包含安装向导。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: "万能格式转换器_1.0.0_x64_zh-CN.msi",
      fileSize: "256.43 MB",
      sha256: "5FB61C722D282E9464AE8014B978D04DE5D1AEFFFC80E4EB1C2A6EE5934C5766",
      note: "适合企业、管理员或批量部署场景。"
    }
  ],
  changelog: [
    "图片压缩默认导出 JPG",
    "图片压缩目标大小支持 200KB、100KB、50KB、25KB",
    "PDF 转图片支持逐页导出和合成一页导出",
    "新增 Word 转图片，支持逐页导出和合成一页导出",
    "新增 Excel 转图片，支持逐页导出和合成一页导出",
    "保留视频格式转换、音频格式转换、视频提取音频",
    "强化音视频转换参数，包括视频尺寸、音频码率、元数据清理和容器适配",
    "恢复图片裁切可拖拽裁切框，新增头像、证件照、横屏和竖屏等常用比例",
    "新增水印字号、文字颜色和水印预览",
    "新增尺寸调整百分比、像素模式和尺寸预览",
    "优化 PDF.js 本地加载，减少动态代码块加载失败",
    "优化工具页功能入口，常用功能更醒目",
    "根据 pnpm-lock.yaml、Cargo.lock 和最终构建产物生成第三方 Notices",
    "离线安装包内置 JS、CSS、PDF.js、FFmpeg WASM 等静态资源",
    "离线版批量队列跟随当前工具，支持图片尺寸调整/加水印/压缩、PDF/Word/Excel 转图片、视频转换、音频转换和视频提取音频",
    "在线版保持轻量单文件处理，批量处理能力仅在离线安装版中提供"
  ]
} as const;
