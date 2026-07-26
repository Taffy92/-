import Link from "next/link";
import { AdSlot } from "@doctool/ui";
import { ArrowRight, Download, FileAudio, FileImage, FileText, ShieldCheck, Video } from "lucide-react";
import { GsapScene } from "@/components/motion/GsapScene";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const matrixItems = [
  { title: "图片处理矩阵", detail: "裁切、像素/百分比调整、水印和压缩均在浏览器本地完成。", href: siteConfig.links.tools, icon: FileImage },
  { title: "文档无损解析", detail: "PDF、Word、Excel 可逐页导出图片，或合成为长图。", href: siteConfig.links.tools, icon: FileText },
  { title: "视频重构封装", detail: "支持 MP4、MOV、AVI、MKV、WebM 等常用格式转换。", href: siteConfig.links.tools, icon: Video },
  { title: "音频流转换舱", detail: "支持 MP3、WAV、AAC、M4A、FLAC 等格式转换。", href: siteConfig.links.tools, icon: FileAudio },
  { title: "音轨分离提取", detail: "从视频文件中提取独立音频轨道，转换过程不上传服务器。", href: siteConfig.links.tools, icon: Video },
  { title: "离线专业版", detail: "适合大文件、敏感文件、断网环境和批量任务队列。", href: siteConfig.links.download, icon: Download }
];

const trustItems = ["文件仅在本地处理", "不调用云端转换 API", "广告与文件处理隔离"];

export default function HomePage() {
  if (isDesktopApp) {
    return <ToolsClient surface="desktop" />;
  }

  return (
    <main className="apple-page">
      <GsapScene variant="home">
        <section className="apple-home-stage" data-animate="home-shell">
          <div className="apple-home-copy">
            <div className="apple-badge anim-apple-hero" data-animate="home-intro">
              <span />
              纯前端本地安全隔离沙箱
            </div>
            <h1 className="anim-apple-hero" data-animate="home-intro">
              日常办公与创作的 Pro 级本地转换矩阵
            </h1>
            <p className="anim-apple-hero" data-animate="home-intro">
              图片、PDF、Word、Excel 及跨媒体音视频格式处理尽量在当前浏览器本地完成。
              拒绝云端转换 API 中转，守住用户文件、Canvas、Blob、ArrayBuffer 与转换结果的隐私边界。
            </p>
            <div className="apple-trust-row apple-home-trust-row" data-animate="home-intro">
              {trustItems.map((item) => (
                <span key={item} data-animate="home-trust-item">
                  <ShieldCheck size={14} />
                  {item}
                </span>
              ))}
            </div>
            <div className="apple-hero-actions" data-animate="home-intro">
              <Link className="apple-btn apple-btn-solid" href={siteConfig.links.tools}>
                启动在线工具台 <ArrowRight size={16} />
              </Link>
              <Link className="apple-btn apple-btn-ghost" href={siteConfig.links.download}>
                <Download size={16} /> 下载离线专业版
              </Link>
            </div>
          </div>

          <div className="apple-home-matrix" data-animate="home-intro">
            <div className="grid-title-bar apple-home-matrix-title">
              <div>
                <p>Function matrix</p>
                <h2>选择核心模块，快速挂载任务</h2>
              </div>
            </div>

            <div className="apple-pro-grid apple-pro-grid-compact">
              {matrixItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} href={item.href} className="apple-pro-card anim-apple-card" data-animate="home-card">
                    <div className="card-top-flex">
                      <div className="card-app-icon">
                        <Icon size={18} />
                      </div>
                      <div className="card-arrow-sign">→</div>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {adsConfig.enabled ? (
          <section className="apple-home-ad-shell">
            <div id="ad-container" className="apple-adsense-container" data-animate="home-ad">
              <div className="adsense-telemetry-header">
                <span>[ Sandboxed Ad Component ]</span>
                <span>Secure //</span>
              </div>
              <div className="adsense-core-viewport apple-home-ad-viewport">
                <AdSlot config={adsConfig} name="homeMiddle" className="apple-home-ad-slot" />
              </div>
            </div>
          </section>
        ) : null}
      </GsapScene>
    </main>
  );
}
