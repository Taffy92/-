import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "联系我们 - 万能格式转换器",
  path: "/contact",
  description: "联系万能格式转换器开发者 MR.谢，反馈问题、合作或提交版权投诉。"
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <article className="rounded-3xl tech-panel p-6 leading-8 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">联系</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">联系我们</h1>
        <p className="mt-6 text-slate-300">感谢你使用“万能格式转换器”。</p>
        <p className="mt-4 text-slate-300">
          如果你有功能建议、问题反馈、离线安装包使用问题、广告合作、商务合作、版权或侵权投诉、隐私相关问题、网站错误反馈，欢迎通过邮箱联系我们。
        </p>
        <div className="mt-6 rounded-2xl border border-cyan-300/12 bg-slate-900/70 p-5 text-slate-300">
          <p>联系邮箱：{siteConfig.email}</p>
          <p>开发者：{siteConfig.developer}</p>
        </div>
        <h2 className="mt-8 text-xl font-bold text-slate-50">反馈时建议提供</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-300">
          <li>设备类型，例如 Windows、Mac、iPhone、Android。</li>
          <li>浏览器名称，例如 Chrome、Edge、Safari。</li>
          <li>具体功能名称。</li>
          <li>问题截图。</li>
          <li>错误提示内容。</li>
          <li>是否使用在线版或离线专业版。</li>
        </ol>
        <p className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
          请不要通过邮件发送包含敏感隐私、身份证件、合同原件、财务资料等重要文件。敏感文件建议使用离线专业版在本地处理。
        </p>
      </article>
    </main>
  );
}
