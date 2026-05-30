export const downloadsConfig = {
  appName: "万能格式转换器 离线专业版",
  version: "1.0.0",
  fileName: "万能格式转换器_1.0.0_x64-setup.exe",
  fileSize: "EXE 约 245.69 MB / MSI 约 256.51 MB",
  releaseDate: "2026-05-25",
  sha256:
    "EXE 797B01FD201BD6D5501220F12B4BF932903549782937C933008F455F39646565 / MSI AA04807713CEDFD48FE2AAB8F974BFD15871A2AE44169896F79BE7F800466D3E",
  primaryDownloadUrl: "",
  backupDownloadUrl: "",
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: "万能格式转换器_1.0.0_x64-setup.exe",
      fileSize: "245.69 MB",
      sha256: "797B01FD201BD6D5501220F12B4BF932903549782937C933008F455F39646565",
      note: "推荐普通用户使用，包含安装向导。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: "万能格式转换器_1.0.0_x64_zh-CN.msi",
      fileSize: "256.51 MB",
      sha256: "AA04807713CEDFD48FE2AAB8F974BFD15871A2AE44169896F79BE7F800466D3E",
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
    "离线版新增图片批量压缩、图片批量加水印、Word 批量转图片、Excel 批量转图片、视频批量转换、音频批量转换",
    "在线版保持轻量单文件处理，批量处理能力仅在离线安装版中提供"
  ]
} as const;
