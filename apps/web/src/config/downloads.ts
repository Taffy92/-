const exeFileName = "万能格式转换离线专业版_1.0.0_x64-setup.exe";
const msiFileName = "万能格式转换离线专业版_1.0.0_x64_zh-CN.msi";
const objectStorageBaseUrl = "https://666f-format-converter-prod-x-d71bce41-1434109188.tcb.qcloud.la/installers/v1.0.0";
const exeStorageDownloadUrl =
  `${objectStorageBaseUrl}/%E4%B8%87%E8%83%BD%E6%A0%BC%E5%BC%8F%E8%BD%AC%E6%8D%A2%E7%A6%BB%E7%BA%BF%E4%B8%93%E4%B8%9A%E7%89%88_1.0.0_x64-setup.exe`;
const msiStorageDownloadUrl =
  `${objectStorageBaseUrl}/%E4%B8%87%E8%83%BD%E6%A0%BC%E5%BC%8F%E8%BD%AC%E6%8D%A2%E7%A6%BB%E7%BA%BF%E4%B8%93%E4%B8%9A%E7%89%88_1.0.0_x64_zh-CN.msi`;
const exeDownloadUrl = process.env.NEXT_PUBLIC_OFFLINE_EXE_DOWNLOAD_URL || exeStorageDownloadUrl;
const msiDownloadUrl = process.env.NEXT_PUBLIC_OFFLINE_MSI_DOWNLOAD_URL || msiStorageDownloadUrl;

export const downloadsConfig = {
  appName: "万能格式转换离线专业版",
  version: "1.0.0",
  fileName: exeFileName,
  fileSize: "EXE 约 243.56 MB / MSI 约 254.27 MB",
  releaseDate: "2026-06-03",
  sha256:
    "EXE DF8258E77E2250CA513CAACF4FA4BC380812A92F687030E75042E6FAF1B2F6FD / MSI 83AE0FF2E23EAE9B0B9E64CD4579DD86202C392EBD330A0D78A142309B9577E8",
  primaryDownloadUrl: exeDownloadUrl,
  backupDownloadUrl: msiDownloadUrl,
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: exeFileName,
      downloadUrl: exeDownloadUrl,
      fileSize: "243.56 MB",
      sha256: "DF8258E77E2250CA513CAACF4FA4BC380812A92F687030E75042E6FAF1B2F6FD",
      note: "推荐普通用户使用，安装后自动开启本机 3 天试用。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: msiFileName,
      downloadUrl: msiDownloadUrl,
      fileSize: "254.27 MB",
      sha256: "83AE0FF2E23EAE9B0B9E64CD4579DD86202C392EBD330A0D78A142309B9577E8",
      note: "适合企业、管理员或批量部署场景，同样内置 3 天试用。"
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
