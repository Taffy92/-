import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "使用条款 - 万能格式转换器",
  path: "/terms",
  description: "万能格式转换器的使用条款，说明服务范围、用户责任、转换结果边界和合规要求。"
});

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <article className="prose prose-invert max-w-none rounded-3xl tech-panel p-6 leading-8 sm:p-10">
        <h1>使用条款</h1>
        <p className="text-sm text-slate-400">更新时间：2026 年 5 月 17 日</p>
        <p>本网站由开发者 MR.谢 创建和维护。联系邮箱：{siteConfig.email}。</p>
        <h2>一、服务范围</h2>
        <p>
          服务包括：图片裁切、图片尺寸调整、图片添加水印、图片压缩、PDF 转图片、Word 转图片、Excel 转图片、
          视频格式转换、音频格式转换、视频提取音频、离线安装包下载和使用教程。
        </p>
        <p>
          服务不包括：PDF 编辑、PDF 精准编辑、PDF 文字修改、PDF 局部替换、PDF 安全涂销、PDF 签名盖章、
          PDF 批注标注、PDF 合同、发票、证件、财务票据修改。
        </p>
        <h2>二、用户责任</h2>
        <p>
          用户应确保自己拥有处理相关图片、PDF、Word、Excel、音频和视频的合法权利。不得用于伪造、篡改违法文件，
          不得非法修改合同、发票、证件、证明文件、票据或财务资料。
        </p>
        <p>
          用户不得侵犯他人著作权、肖像权、隐私权、商标权、商业秘密，不得绕过平台授权、版权保护或访问限制。
        </p>
        <h2>三、结果准确性</h2>
        <p>
          转换结果可能存在偏差。PDF、Word、Excel 转图片可能受页面尺寸、字体、表格宽度和浏览器渲染能力影响。
          音视频转换结果可能受浏览器解码、编码能力影响。重要文件和重要素材必须人工核对。
        </p>
        <p>PDF 不是天然适合重新编辑的格式，本项目不提供 PDF 编辑能力。在线版适合轻量快速处理，离线专业版适合敏感文件、大文件和断网环境。</p>
        <h2>四、广告服务</h2>
        <p>网站可能接入 Google AdSense、百度广告或其他广告服务。广告脚本与文件处理逻辑隔离，不接收用户正在处理的文件或转换结果。</p>
        <h2>五、责任限制</h2>
        <p>
          用户应自行承担因使用工具处理文件而产生的法律、商业、财务或个人后果。开发者 MR.谢 不保证所有文件都能成功处理，
          不保证所有转换结果完全准确。
        </p>
        <p>开发者 MR.谢 在法律允许范围内不对间接损失、数据损失、商业损失、法律纠纷承担责任。</p>
        <h2>六、知识产权和开源组件</h2>
        <p>网站内容和原创设计受保护。开源组件遵循其各自许可证。FFmpeg 相关许可证仍需正式商业发布前复核，本条款不构成法律意见。</p>
        <h2>七、投诉与更新</h2>
        <p>侵权投诉和问题反馈邮箱：{siteConfig.email}。条款可能更新，更新后会在本页面展示新的更新时间。</p>
        <p>使用条款不构成法律意见，正式上线前建议进一步合规审查。</p>
      </article>
    </main>
  );
}
