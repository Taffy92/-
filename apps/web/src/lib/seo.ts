import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageSeoInput {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
}

const defaultKeywords = [
  "万能格式转换器",
  "免费图片工具",
  "PDF 转图片",
  "Word 转图片",
  "Excel 转图片",
  "视频格式转换",
  "音频格式转换",
  "视频提取音频",
  "图片压缩",
  "图片裁切",
  "本地处理"
];

export function createPageMetadata({ title, description = siteConfig.description, path = "/", keywords = defaultKeywords }: PageSeoInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  return {
    title,
    description,
    keywords,
    authors: [{ name: siteConfig.developer }],
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "zh_CN"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/icons/favicon.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    }
  };
}
