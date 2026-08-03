import type { Metadata } from "next";
import { Suspense } from "react";
import { isDesktopApp } from "@/config/appMode";
import { OnlineToolsEntry } from "@/components/tools/OnlineToolsEntry";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: isDesktopApp ? "专业工作台 - 万能格式转换器" : "在线工具 - 万能格式转换器",
  path: "/tools",
  description: isDesktopApp
    ? "Windows 离线专业版工作台，提供图片、文档、音频和视频本地转换工具，并在支持的工具中直接启用批量队列。"
    : "在浏览器本地完成图片裁切、尺寸调整、添加水印、图片压缩、PDF 转图片、Word 转图片、Excel 转图片、视频格式转换、音频格式转换和视频提取音频。文件不上传服务器。"
});

export default function ToolsPage() {
  if (isDesktopApp) return <ToolsClient surface="desktop" />;
  return (
    <Suspense fallback={<main className="online-tool-directory-loading" aria-busy="true">正在载入工具目录...</main>}>
      <OnlineToolsEntry />
    </Suspense>
  );
}
