import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "更新日志 - 万能格式转换器",
  path: "/changelog",
  description: "万能格式转换器版本更新记录。"
});

const changes = [
  "图片裁切",
  "图片尺寸调整",
  "图片加水印",
  "图片压缩",
  "PDF 转图片",
  "Word 转图片",
  "Excel 转图片",
  "视频格式转换",
  "音频格式转换",
  "视频提取音频",
  "下载离线安装版页面",
  "关于我们页面",
  "隐私政策页面",
  "使用条款页面",
  "联系我们页面",
  "百度广告和 Google 广告位预留",
  "Vercel 和 CloudBase 部署支持",
  "移动端适配",
  "开发者信息：MR.谢"
];

export default function ChangelogPage() {
  return (
    <main className="document-page mx-auto max-w-4xl px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <article className="rounded-sm tech-panel p-6 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">版本记录</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">更新日志</h1>
        <div className="mt-8 rounded-sm border border-cyan-300/12 bg-slate-950/60 p-5">
          <h2 className="text-xl font-bold text-slate-50">v1.0.0</h2>
          <p className="mt-2 text-sm text-slate-400">发布日期：2026-05-17</p>
          <h3 className="mt-5 font-bold text-slate-50">新增</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-6 text-slate-300">
            {changes.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </div>
      </article>
    </main>
  );
}
