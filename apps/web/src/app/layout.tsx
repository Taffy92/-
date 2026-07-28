import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientBoot } from "@/components/layout/ClientBoot";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isDesktopApp } from "@/config/appMode";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "万能格式转换器 - 文件本地处理，不上传服务器",
    description:
      "免费在线处理图片、PDF、Word、Excel、音频和视频，支持图片格式与元数据处理、PDF 页面整理、音视频裁剪、图片与 PDF 本地 OCR，以及原有格式转换功能。所有处理尽量在浏览器本地完成，文件不上传服务器。"
  }),
  other: {
    baidu_union_verify: "dbbb44f8f53c19e48d686707e66f5409"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050b14"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ClientBoot />
        {isDesktopApp ? children : (
          <>
            <Header desktop={false} />
            {children}
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
