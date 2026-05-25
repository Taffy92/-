import type { Metadata } from "next";
import { isDesktopApp } from "@/config/appMode";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "在线工具 - 万能格式转换器",
  path: "/tools",
  description:
    "在浏览器本地完成图片裁切、尺寸调整、添加水印、图片压缩、PDF 转图片、Word 转图片、Excel 转图片、视频格式转换、音频格式转换和视频提取音频。文件不上传服务器。"
});

export default function ToolsPage() {
  return <ToolsClient surface={isDesktopApp ? "desktop" : "web"} />;
}
