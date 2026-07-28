import Link from "next/link";
import { AdSlot } from "@doctool/ui";
import {
  ArrowRight,
  Download,
  FileImage,
  FileText,
  Files,
  ScanText,
  ShieldCheck,
  Video
} from "lucide-react";
import { GsapScene } from "@/components/motion/GsapScene";
import { LocalEngineStage } from "@/components/home/LocalEngineStage";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const featureGroups = [
  {
    title: "图像增强与格式处理",
    label: "IMAGE",
    detail: "裁切、尺寸调整、压缩、格式转换、旋转翻转、水印和元数据清理。",
    href: siteConfig.links.tools,
    icon: FileImage,
    wide: true
  },
  {
    title: "PDF 与办公文档",
    label: "DOCUMENT",
    detail: "PDF 页面整理、PDF/Word/Excel 转图片、图片合成 PDF。",
    href: siteConfig.links.localTools,
    icon: FileText
  },
  {
    title: "本地 OCR 文字识别",
    label: "OCR",
    detail: "识别图片和 PDF 中的中文、英文，导出 TXT 或 Word。",
    href: siteConfig.links.localTools,
    icon: ScanText
  },
  {
    title: "音视频处理",
    label: "MEDIA",
    detail: "格式转换、音频提取、裁剪、视频截图、GIF、静音和音频增强。",
    href: siteConfig.links.localTools,
    icon: Video,
    wide: true
  }
] as const;

const proofItems = [
  { title: "文件不上传", detail: "处理所需数据保留在当前设备", icon: ShieldCheck },
  { title: "无需登录", detail: "打开工具即可选择本地文件", icon: Files },
  { title: "常用格式覆盖", detail: "图片、PDF、Office、音视频与 OCR", icon: FileImage },
  { title: "大文件另有方案", detail: "离线版支持断网与批量队列", icon: Download }
] as const;

const localSteps = [
  ["01", "选择", "从当前设备读取文件，不扫描其他目录。"],
  ["02", "处理", "浏览器本地内核执行转换或识别。"],
  ["03", "预览", "结果保存在页面内存，不提供给广告脚本。"],
  ["04", "保存", "由你下载结果，或使用离线版写入指定目录。"]
] as const;

export default function HomePage() {
  if (isDesktopApp) {
    return <ToolsClient surface="desktop" />;
  }

  return (
    <main className="v2-online-home">
      <GsapScene variant="home">
        <section className="v2-hero">
          <div className="v2-hero-copy" data-animate="home-intro">
            <p className="v2-eyebrow"><ShieldCheck size={15} />文件在当前设备处理</p>
            <h1>处理文件，<span>不交出隐私。</span></h1>
            <p className="v2-hero-lead">
              图片、文档、音视频和 OCR 在浏览器本地完成。无需登录，不调用云端转换接口。
            </p>
            <div className="v2-hero-actions">
              <Link href={siteConfig.links.tools} className="v2-primary-button">
                选择在线工具 <ArrowRight size={17} />
              </Link>
              <Link href={siteConfig.links.download} className="v2-secondary-button">
                <Download size={17} />下载 Windows 离线版
              </Link>
            </div>
            <p className="v2-hero-note">页面可能加载公共资源和百度广告，但用户文件不会进入广告脚本。</p>
          </div>
          <LocalEngineStage />
        </section>

        <section className="v2-proof-strip" aria-label="产品特点">
          {proofItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
                <Icon size={18} />
                <span><strong>{item.title}</strong><small>{item.detail}</small></span>
              </article>
            );
          })}
        </section>

        <section className="v2-content-section">
          <header className="v2-section-heading">
            <div>
              <p>FUNCTION MAP</p>
              <h2>按任务找到工具，不必先理解格式。</h2>
            </div>
            <Link href={siteConfig.links.localTools}>查看全部增强工具 <ArrowRight size={16} /></Link>
          </header>
          <div className="v2-feature-map">
            {featureGroups.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className={"wide" in item && item.wide ? "wide" : ""}>
                  <span className="v2-feature-label">{item.label}</span>
                  <Icon size={24} />
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <span className="v2-feature-open">打开工具 <ArrowRight size={15} /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="v2-local-section">
          <div className="v2-local-copy">
            <p>LOCAL FIRST</p>
            <h2>处理链路短，隐私边界清楚。</h2>
            <p>在线版适合快速处理；敏感文件、大文件和批量任务建议使用可断网运行的离线专业版。</p>
            <Link href={siteConfig.links.download}>了解离线版 <ArrowRight size={16} /></Link>
          </div>
          <div className="v2-local-steps">
            {localSteps.map(([number, title, detail]) => (
              <article key={number}>
                <span>{number}</span>
                <div><strong>{title}</strong><p>{detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        {adsConfig.enabled ? (
          <section id="baidu-home-ad-container" className="v2-ad-section" aria-label="百度联盟广告区域" data-ad-provider="baidu">
            <span>广告</span>
            <AdSlot config={adsConfig} name="homeMiddle" className="v2-home-ad-slot" />
          </section>
        ) : null}

        <section className="v2-guides-section">
          <div>
            <p>使用教程</p>
            <h2>遇到限制时，先看真实处理方法。</h2>
            <span>教程围绕尺寸、质量、页码、兼容性和常见失败原因编写。</span>
          </div>
          <div className="v2-guide-links">
            <Link href={siteConfig.links.tutorials}>图片如何压缩到指定大小 <ArrowRight size={15} /></Link>
            <Link href={siteConfig.links.tutorials}>PDF 如何逐页导出图片 <ArrowRight size={15} /></Link>
            <Link href={siteConfig.links.tutorials}>视频为什么优先转 MP4 <ArrowRight size={15} /></Link>
          </div>
        </section>
      </GsapScene>
    </main>
  );
}
