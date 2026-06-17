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
  fileSize: "EXE 约 245.42 MB / MSI 约 255.93 MB",
  releaseDate: "2026-06-17",
  sha256:
    "EXE E2A03FDDE5907DD0462FF76C4A440869201B82A71533E82FD0EB25E2826D5564 / MSI 17B59355E550C5295CF3B9383E4391F57D1789AF1F2783302B483663555C850C",
  primaryDownloadUrl: exeDownloadUrl,
  backupDownloadUrl: msiDownloadUrl,
  packages: [
    {
      type: "exe",
      label: "EXE 安装包",
      fileName: exeFileName,
      downloadUrl: exeDownloadUrl,
      fileSize: "245.42 MB",
      sha256: "E2A03FDDE5907DD0462FF76C4A440869201B82A71533E82FD0EB25E2826D5564",
      note: "推荐普通用户使用，安装后自动开启本机 3 天试用。"
    },
    {
      type: "msi",
      label: "MSI 安装包",
      fileName: msiFileName,
      downloadUrl: msiDownloadUrl,
      fileSize: "255.93 MB",
      sha256: "17B59355E550C5295CF3B9383E4391F57D1789AF1F2783302B483663555C850C",
      note: "适合企业、管理员或批量部署场景，同样内置 3 天试用。"
    }
  ],
  changelog: [
    "2026-06-17：重新打包并上传部署最新产物，更新离线 sidecar 白名单优先范围、EXE/MSI 校验信息、发布说明和在线站点",
    "2026-06-12：上传 Windows EXE/MSI 安装包到公开只读对象存储，下载页展示文件大小、SHA256 和安装提示",
    "离线版升级为白色苹果风格工作台，选择文件区域同时承担预览功能，大号橙色选择文件按钮支持单选和多选",
    "多文件任务改为缩略图平铺预览，PDF、Word、Excel 显示第一页内容",
    "切换工具或重新处理前可一键清空任务，避免旧任务残留",
    "离线批量和多页转换结果统一保存为本地文件夹，不再生成 ZIP 或 7Z 压缩包",
    "图片压缩默认导出 JPG",
    "图片压缩目标大小支持 500KB、200KB、100KB、50KB、25KB",
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
