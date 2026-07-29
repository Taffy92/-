export type UnifiedToolCategoryId = "image" | "pdf" | "document" | "media" | "ocr";

export type UnifiedToolId =
  | "image-convert"
  | "crop"
  | "resize"
  | "watermark"
  | "compress"
  | "image-transform"
  | "image-metadata"
  | "pdf-images"
  | "images-pdf"
  | "pdf-merge"
  | "pdf-split"
  | "pdf-pages"
  | "pdf-decorate"
  | "word-images"
  | "excel-images"
  | "video-convert"
  | "audio-convert"
  | "video-audio"
  | "media-trim"
  | "video-mute"
  | "video-frame"
  | "video-gif"
  | "audio-enhance"
  | "ocr";

export type UnifiedToolItem = {
  id: UnifiedToolId;
  label: string;
  description: string;
  route: "tools" | "local-tools";
  offlineBatch: boolean;
};

export type UnifiedToolCategory = {
  id: UnifiedToolCategoryId;
  label: string;
  summary: string;
  tools: UnifiedToolItem[];
};

export const unifiedToolCategories: UnifiedToolCategory[] = [
  {
    id: "image",
    label: "图片工具",
    summary: "格式、画面、尺寸与元数据",
    tools: [
      { id: "image-convert", label: "图片格式转换", description: "JPG、PNG、WebP 与 BMP", route: "local-tools", offlineBatch: true },
      { id: "crop", label: "图片裁切", description: "自由裁切与常用比例", route: "tools", offlineBatch: false },
      { id: "resize", label: "像素/百分比调整", description: "按尺寸或百分比调整", route: "tools", offlineBatch: true },
      { id: "watermark", label: "添加水印", description: "文字或图片水印", route: "tools", offlineBatch: true },
      { id: "compress", label: "图片压缩", description: "质量与目标大小控制", route: "tools", offlineBatch: true },
      { id: "image-transform", label: "旋转与翻转", description: "旋转、水平与垂直翻转", route: "local-tools", offlineBatch: false },
      { id: "image-metadata", label: "EXIF 查看与清理", description: "读取并清除图片元数据", route: "local-tools", offlineBatch: true }
    ]
  },
  {
    id: "pdf",
    label: "PDF 工具",
    summary: "页面、文件与图片互转",
    tools: [
      { id: "pdf-images", label: "PDF 转图片", description: "逐页或合成长图", route: "tools", offlineBatch: true },
      { id: "images-pdf", label: "图片合成 PDF", description: "多张图片生成 PDF", route: "local-tools", offlineBatch: false },
      { id: "pdf-merge", label: "PDF 合并", description: "按顺序合并多个 PDF", route: "local-tools", offlineBatch: false },
      { id: "pdf-split", label: "PDF 拆分与提取", description: "拆分或提取指定页面", route: "local-tools", offlineBatch: false },
      { id: "pdf-pages", label: "PDF 页面管理", description: "排序、删除与旋转页面", route: "local-tools", offlineBatch: false },
      { id: "pdf-decorate", label: "PDF 水印与页码", description: "水印、页码、页眉与页脚", route: "local-tools", offlineBatch: false }
    ]
  },
  {
    id: "document",
    label: "文档工具",
    summary: "Word 与 Excel 输出图片",
    tools: [
      { id: "word-images", label: "Word 转图片", description: "DOCX 文档逐页输出", route: "tools", offlineBatch: true },
      { id: "excel-images", label: "Excel 转图片", description: "表格工作表输出图片", route: "tools", offlineBatch: true }
    ]
  },
  {
    id: "media",
    label: "音视频工具",
    summary: "转换、裁剪、提取与编辑",
    tools: [
      { id: "video-convert", label: "视频格式转换", description: "常用视频格式互转", route: "tools", offlineBatch: true },
      { id: "audio-convert", label: "音频格式转换", description: "常用音频格式互转", route: "tools", offlineBatch: true },
      { id: "video-audio", label: "视频提取音频", description: "从视频导出音轨", route: "tools", offlineBatch: true },
      { id: "media-trim", label: "音视频裁剪", description: "按起止时间截取片段", route: "local-tools", offlineBatch: false },
      { id: "video-mute", label: "视频静音", description: "移除视频音轨", route: "local-tools", offlineBatch: false },
      { id: "video-frame", label: "视频截图", description: "指定时间或固定间隔截图", route: "local-tools", offlineBatch: true },
      { id: "video-gif", label: "视频转 GIF", description: "设置时段、宽度与帧率", route: "local-tools", offlineBatch: false },
      { id: "audio-enhance", label: "音频编辑", description: "裁剪、拼接、音量与淡入淡出", route: "local-tools", offlineBatch: false }
    ]
  },
  {
    id: "ocr",
    label: "OCR 工具",
    summary: "图片与 PDF 文字识别",
    tools: [
      { id: "ocr", label: "图片 / PDF 文字识别", description: "中文、英文与 Word 导出", route: "local-tools", offlineBatch: true }
    ]
  }
];

export const unifiedTools = unifiedToolCategories.flatMap((category) => category.tools);

export function getUnifiedTool(toolId: string) {
  return unifiedTools.find((tool) => tool.id === toolId);
}

export function getUnifiedToolCategory(toolId: string) {
  return unifiedToolCategories.find((category) => category.tools.some((tool) => tool.id === toolId));
}

export function getUnifiedToolHref(tool: Pick<UnifiedToolItem, "id" | "route">) {
  return `/${tool.route}?tool=${tool.id}`;
}

export function getCategoryHref(category: UnifiedToolCategory) {
  return getUnifiedToolHref(category.tools[0]);
}
