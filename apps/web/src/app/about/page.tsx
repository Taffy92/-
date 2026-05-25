import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "关于我们 - 万能格式转换器",
  path: "/about",
  description: "了解万能格式转换器的隐私友好、本地处理和离线专业版原则。"
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <article className="rounded-3xl tech-panel p-6 leading-8 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">关于我们</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">万能格式转换器</h1>
        <p className="mt-6 text-slate-300">
          万能格式转换器，是由开发者 MR.谢 创建的一款注重隐私保护、简单易用和本地处理能力的格式转换工具。
        </p>
        <p className="mt-4 text-slate-300">
          我们希望让用户无需安装复杂软件，也能直接在浏览器中完成常用的图片、PDF、Word、Excel、音频和视频处理操作。
          对敏感文件、大文件和批量任务，则提供 Windows 离线专业版。
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-50">我们的核心原则</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-300">
          <li>文件尽量在浏览器或离线软件本地处理。</li>
          <li>用户图片、PDF、Word、Excel、音频和视频不上传服务器。</li>
          <li>不使用云端转换 API 处理用户文件。</li>
          <li>页面简洁清楚，降低普通用户的使用门槛。</li>
          <li>移动端和桌面端都可以使用。</li>
          <li>对敏感文件、大文件和断网场景，提供离线专业版。</li>
        </ol>
        <div className="mt-8 rounded-2xl border border-cyan-300/12 bg-slate-900/70 p-5 text-slate-300">
          <p>开发者：{siteConfig.developer}</p>
          <p>联系邮箱：{siteConfig.email}</p>
          <p>版权信息：{siteConfig.copyright}</p>
        </div>
        <Link href={siteConfig.links.download} className="mt-8 inline-flex min-h-11 items-center justify-center rounded-2xl border border-cyan-300/50 bg-cyan-400 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-300">下载离线专业版</Link>
      </article>
    </main>
  );
}
