import Link from "next/link";
import { Suspense } from "react";
import { AdSlot } from "@doctool/ui";
import {
  ArrowRight,
  Download,
  FileArchive,
  FileText,
  Images,
  Minimize2,
  ScanText,
  ShieldCheck
} from "lucide-react";
import { HomeFlowDemo } from "@/components/home/HomeFlowDemo";
import { GsapScene } from "@/components/motion/GsapScene";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const popularTools = [
  {
    title: "图片格式转换",
    detail: "JPG、PNG、WebP 等常用格式互转",
    href: "/local-tools?tool=image-convert",
    icon: Images,
    tone: "blue"
  },
  {
    title: "图片压缩",
    detail: "控制质量与尺寸，减小文件体积",
    href: "/tools?tool=compress",
    icon: Minimize2,
    tone: "green"
  },
  {
    title: "PDF 转图片",
    detail: "逐页导出 JPG、PNG 或 WebP",
    href: "/tools?tool=pdf-images",
    icon: FileText,
    tone: "red"
  },
  {
    title: "图片转 PDF",
    detail: "将多张图片整理为一个 PDF",
    href: "/local-tools?tool=images-pdf",
    icon: FileArchive,
    tone: "orange"
  },
  {
    title: "Word 转图片",
    detail: "将 Word 文档逐页导出为图片",
    href: "/tools?tool=word-images",
    icon: FileText,
    tone: "indigo"
  },
  {
    title: "图片 OCR",
    detail: "识别图片或 PDF 中的中英文",
    href: "/local-tools?tool=ocr",
    icon: ScanText,
    tone: "cyan"
  }
] as const;

const localSteps = [
  ["01", "选择文件", "只读取你主动选择的本地文件。"],
  ["02", "设备内处理", "转换、预览和识别在当前浏览器完成。"],
  ["03", "保存结果", "结果由你下载，关闭页面后会从页面内存清除。"]
] as const;

export default function HomePage() {
  if (isDesktopApp) {
    return (
      <Suspense fallback={<main className="online-tool-directory-loading" aria-busy="true">正在加载工具...</main>}>
        <ToolsClient surface="desktop" />
      </Suspense>
    );
  }

  return (
    <main className="a2-home">
      <GsapScene variant="home">
        <section className="a2-home-hero">
          <div className="a2-home-copy">
            <p className="a2-home-kicker" data-animate="home-intro">本地文件处理</p>
            <h1 aria-label="文件转换，在浏览器本地完成">
              <span data-animate="home-intro">文件转换，</span>
              <span data-animate="home-intro">在浏览器本地完成</span>
            </h1>
            <p className="a2-home-lead" data-animate="home-intro">
              图片、PDF、Word、Excel、音频和视频均在当前设备处理。在线版适合单文件，Windows 离线版支持批量处理。
            </p>
            <div className="a2-home-actions" data-animate="home-intro">
              <Link href="/tools" className="a2-button-primary">
                选择在线工具 <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link href={siteConfig.links.download} className="a2-button-secondary">
                <Download aria-hidden="true" size={17} />下载 Windows 离线版
              </Link>
            </div>
            <div className="a2-home-assurance" aria-label="本地处理说明" data-animate="home-intro">
              <span><ShieldCheck aria-hidden="true" size={14} />浏览器本地处理</span>
              <span>在线单文件</span>
              <span>离线批量处理</span>
            </div>
          </div>

          <HomeFlowDemo />
        </section>

        <section className="a2-home-directory" aria-labelledby="home-directory-title" data-animate="home-section">
          <header>
            <div>
              <p>常用任务</p>
              <h2 id="home-directory-title">从常用转换开始</h2>
            </div>
            <Link href="/tools">查看完整工具目录 <ArrowRight aria-hidden="true" size={15} /></Link>
          </header>
          <div className="a2-home-tool-grid">
            {popularTools.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title} data-tone={item.tone} data-animate="home-card">
                  <span><Icon aria-hidden="true" size={21} /></span>
                  <div><strong>{item.title}</strong><small>{item.detail}</small></div>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              );
            })}
          </div>
        </section>

        {adsConfig.enabled ? (
          <section
            id="baidu-home-ad-container"
            className="a2-home-ad"
            aria-label="百度联盟广告区域"
            data-ad-provider="baidu"
          >
            <span>广告</span>
            <AdSlot config={adsConfig} name="homeMiddle" className="v2-home-ad-slot" />
          </section>
        ) : null}

        <section className="a2-home-local" data-animate="home-section">
          <div>
            <p>本地处理说明</p>
            <h2>处理路径清楚，文件边界明确。</h2>
            <span>广告脚本与转换数据隔离；用户文件、预览和结果不会交给广告服务。</span>
          </div>
          <ol>
            {localSteps.map(([number, title, detail]) => (
              <li key={number} data-animate="home-card">
                <span>{number}</span>
                <div><strong>{title}</strong><p>{detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="a2-home-guides" data-animate="home-section">
          <div>
            <p>使用教程</p>
            <h2>遇到限制时，查看具体处理方法。</h2>
            <span>教程围绕尺寸、质量、页码、兼容性和常见失败原因编写。</span>
          </div>
          <nav aria-label="常用教程">
            <Link href={siteConfig.links.tutorials} data-animate="home-card">图片如何压缩到指定大小 <ArrowRight aria-hidden="true" size={15} /></Link>
            <Link href={siteConfig.links.tutorials} data-animate="home-card">PDF 如何逐页导出图片 <ArrowRight aria-hidden="true" size={15} /></Link>
            <Link href={siteConfig.links.tutorials} data-animate="home-card">视频为什么优先转 MP4 <ArrowRight aria-hidden="true" size={15} /></Link>
          </nav>
        </section>
      </GsapScene>
    </main>
  );
}
