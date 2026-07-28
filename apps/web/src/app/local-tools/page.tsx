import type { Metadata } from "next";
import { isDesktopApp } from "@/config/appMode";
import { LocalToolsClient } from "@/components/tools/LocalToolsClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "新增本地处理工具 - 万能格式转换器",
  path: "/local-tools",
  description: "图片格式与 EXIF、PDF 页面整理、音视频快速处理和图片/PDF 本地 OCR。在线版与离线版均在当前设备处理，不上传用户文件。"
});

export default function LocalToolsPage() {
  return <LocalToolsClient surface={isDesktopApp ? "desktop" : "web"} />;
}
