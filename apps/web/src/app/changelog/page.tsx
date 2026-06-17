import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "更新日志 - 万能格式转换器",
  path: "/changelog",
  description: "万能格式转换器版本更新记录。"
});

const releases = [
  {
    version: "v1.0.0",
    date: "2026-06-17",
    title: "重新打包并上传部署最新产物",
    changes: [
      "离线专业版 sidecar FFmpeg 白名单优先范围扩展为 WAV 转 FLAC、MP4 / MOV / AVI / MKV / WebM 常用视频格式转换和 ffprobe 信息读取",
      "修复离线版视频 sidecar 参数传递、批量错误提示和手动关闭 sidecar 后的回退逻辑",
      "移除视频转换对 libx264 的依赖路径，WASM fallback 使用 mpeg4 / VP9 等本地可用编码组合",
      "修正 MKV fallback 不再附加仅适用于 MP4 / MOV 的 faststart 参数",
      "更新下载页、发布说明、许可证说明、第三方组件声明和安装包 SHA256 记录",
      "重新执行在线版与离线版隐私、网络、转换和打包验证后上传部署"
    ]
  },
  {
    version: "v1.0.0",
    date: "2026-06-12",
    title: "离线安装包与下载页发布",
    changes: [
      "上传 Windows EXE / MSI 安装包到公开只读对象存储",
      "下载页展示 EXE / MSI 文件大小、SHA256 和安装提示",
      "补充发布说明、安装指南、开源许可证和第三方组件声明",
      "在线站点保持轻量单文件处理，批量处理入口引导下载离线专业版"
    ]
  },
  {
    version: "v1.0.0",
    date: "2026-05-17",
    title: "首次功能发布",
    changes: [
      "上线图片裁切、图片尺寸调整、图片加水印和图片压缩",
      "上线 PDF 转图片、Word 转图片和 Excel 转图片",
      "上线视频格式转换、音频格式转换和视频提取音频",
      "新增下载离线安装版、关于我们、隐私政策、使用条款和联系我们页面",
      "预留百度广告和 Google 广告位，支持 Vercel 和 CloudBase 部署",
      "完成移动端适配并保留开发者信息：MR.谢"
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
              <h3 className="mt-5 font-bold text-slate-50">{release.title}</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-6 text-slate-300">
                {release.changes.map((item) => <li key={item}>{item}</li>)}
              </ol>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
