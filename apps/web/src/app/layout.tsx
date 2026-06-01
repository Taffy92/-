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
      "免费在线处理图片、PDF、Word、Excel、音频和视频，支持图片裁切、尺寸调整、添加水印、图片压缩、PDF 转图片、Word 转图片、Excel 转图片、视频格式转换、音频格式转换和视频提取音频。所有处理尽量在浏览器本地完成，文件不上传服务器。"
  }),
  other: {
    baidu_union_verify: "b4af5e6f5140e5289d4da9a8574e00a4"
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
      <head>
        {!isDesktopApp ? (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3864852988527369"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
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
