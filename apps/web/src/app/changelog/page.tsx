import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "更新日志 - 万能格式转换器",
  path: "/changelog",
  description: "万能格式转换器版本更新记录。"
});

const releases = [
  {
    version: "v2.0.0",
    date: "2026-07-29",
    previousFeatures: [
      "图片、PDF、办公文档和音视频本地转换",
      "离线批量队列、独立文件夹输出和本地授权",
      "图片与 PDF 本地 OCR，支持可编辑 Word 导出",
      "图片、PDF、文档、音视频与 OCR 工具"
    ],
    newFeatures: [
      "在线版首页与统一工具工作台全新界面",
      "离线版工作台、文件平铺预览和授权界面全新设计",
      "在线版仅保留百度联盟广告位，离线版不加载广告",
      "新增微信与支付宝赞赏入口",
      "新增作者微信号和邮箱联系方式"
    ]
  },
  {
    version: "v1.1.0",
    date: "2026-07-28",
    previousFeatures: [
      "图片裁切、尺寸调整、添加水印和图片压缩",
      "PDF、Word、Excel 转图片",
      "视频格式转换、音频格式转换和视频提取音频",
      "离线批量处理与本地文件夹输出"
    ],
    newFeatures: [
      "图片格式转换、旋转翻转、EXIF 查看与元数据清理",
      "图片合成 PDF、PDF 合并拆分、页面重排旋转",
      "PDF 文字或图片水印、页码、页眉和页脚",
      "音视频裁剪、视频静音、视频截图、视频转 GIF",
      "音频拼接、音量调整、淡入和淡出",
      "图片与 PDF 本地 OCR，支持导出可编辑 Word"
    ]
  },
  {
    version: "v1.0.0",
    date: "2026-05-17",
    previousFeatures: [
      "首次发布，无更早版本功能"
    ],
    newFeatures: [
      "图片裁切、尺寸调整、添加水印和图片压缩",
      "PDF、Word、Excel 转图片",
      "视频格式转换、音频格式转换和视频提取音频",
      "在线版与 Windows 离线专业版"
    ]
  }
];

export default function ChangelogPage() {
  return (
    <main className="document-page apple-document-page mx-auto max-w-4xl px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <article className="document-article rounded-sm tech-panel p-6 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">版本记录</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">更新日志</h1>
        <div className="mt-8 space-y-5">
          {releases.map((release) => (
            <section key={`${release.version}-${release.date}`} className="rounded-sm border border-cyan-300/12 bg-slate-950/60 p-5">
              <h2 className="text-xl font-bold text-slate-50">{release.version}</h2>
              <p className="mt-2 text-sm text-slate-400">更新日期：{release.date}</p>
              <h3 className="mt-5 font-bold text-slate-50">原有功能</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-6 text-slate-300">
                {release.previousFeatures.map((item) => <li key={item}>{item}</li>)}
              </ol>
              <h3 className="mt-5 font-bold text-slate-50">新增功能</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-6 text-slate-300">
                {release.newFeatures.map((item) => <li key={item}>{item}</li>)}
              </ol>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
