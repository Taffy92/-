import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "隐私政策 - 万能格式转换器",
  path: "/privacy",
  description: "万能格式转换器的隐私政策，说明文件本地处理、广告服务、试用下载、离线授权和离线版隐私保护。"
});

export default function PrivacyPage() {
  return (
    <PolicyArticle title="隐私政策" updated="2026 年 7 月 26 日">
      <p>本网站由开发者 MR.谢 创建和维护。如有隐私相关问题，请通过 {siteConfig.email} 联系我们。</p>
      <h2>一、文件处理方式</h2>
      <p>
        用户选择的图片、PDF、Word、Excel、音频和视频不会上传服务器。图片处理、PDF 转图片、Word 转图片、Excel 转图片、
        音频转换、视频转换和视频提取音频等处理尽量在浏览器本地完成，不调用云端转换 API。
      </p>
      <p>
        我们不主动保存原始文件、转换结果或处理内容。处理结果由用户浏览器本地生成，并由用户主动下载。
        浏览器内存中可能临时生成预览图、Blob URL、缓存对象；页面关闭或刷新后，临时数据通常会释放。
      </p>
      <p>
        敏感文件建议使用离线专业版。离线专业版核心功能不依赖服务器，不需要上传文件，不需要登录账号，可在断网环境下使用。
      </p>
      <h2>二、广告和第三方服务</h2>
      <p>
        网站在线版可能接入百度联盟广告服务。广告服务可能使用 Cookie、设备信息、浏览器信息、
        IP 地址、页面访问情况、广告展示记录、广告点击记录等信息。
      </p>
      <p>
        广告脚本不会接收用户正在处理的图片、PDF、Word、Excel、音频、视频、OCR 内容或转换结果。广告组件与文件处理功能隔离。
        用户可以通过浏览器设置管理 Cookie，也可以使用广告拦截工具或离线专业版。
      </p>
      <p>
        第三方服务可能包括 EdgeOne、CloudBase、静态资源 CDN 和百度联盟。EdgeOne 用于分发网站静态资源和离线安装包分片；
        CloudBase 仅保留管理员私有授权后台和备用下载授权能力。上述服务均不接收用户正在处理的文件或转换结果。
      </p>
      <h2>三、功能边界</h2>
      <p>本项目不提供 PDF 编辑、PDF 内容篡改、签章、涂销、批注、局部替换等功能。</p>
      <p>
        音视频转换依赖浏览器或离线版内置 WebView 的本地解码与编码能力。重要素材处理完成后请人工播放核对。
        FFmpeg 相关许可证仍需正式商业发布前复核，本页面不构成法律意见。
      </p>
      <h2>四、未成年人使用</h2>
      <p>未成年人应在监护人指导下使用本网站和离线专业版。</p>
      <h2>五、政策更新</h2>
      <p>隐私政策可能根据产品功能、广告服务和法律要求更新。更新后会在本页面展示新的更新时间。</p>
      <p>本隐私政策不构成法律意见，正式上线前建议根据目标地区进一步合规审查。</p>
    </PolicyArticle>
  );
}

function PolicyArticle({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="document-page apple-document-page mx-auto max-w-4xl px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <article className="document-article prose prose-invert max-w-none rounded-sm tech-panel p-6 leading-8 sm:p-10">
        <h1>{title}</h1>
        <p className="text-sm text-slate-400">更新时间：{updated}</p>
        {children}
      </article>
    </main>
  );
}
