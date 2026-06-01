import Link from "next/link";
import { ArrowRight, Download, FileAudio, FileImage, FileText, ShieldCheck, Video } from "lucide-react";
import { AdSlot } from "@doctool/ui";
import { GsapScene } from "@/components/motion/GsapScene";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const matrixItems = [
  { title: "图片处理", detail: "裁切、尺寸调整、水印、压缩", href: siteConfig.links.tools, icon: FileImage },
  { title: "文档转图片", detail: "PDF、Word、Excel 逐页导出或合成长图", href: siteConfig.links.tools, icon: FileText },
  { title: "视频转换", detail: "MP4、MOV、AVI、MKV、WebM", href: siteConfig.links.tools, icon: Video },
  { title: "音频转换", detail: "MP3、WAV、AAC、M4A、FLAC", href: siteConfig.links.tools, icon: FileAudio },
  { title: "视频提取音频", detail: "从视频文件导出音轨", href: siteConfig.links.tools, icon: Video },
  { title: "离线专业版", detail: "大文件、敏感文件、批量任务", href: siteConfig.links.download, icon: Download }
];

const trustItems = ["文件仅在本地处理", "不调用云端转换 API", "广告与文件处理隔离"];

export default function HomePage() {
  if (isDesktopApp) {
    return <ToolsClient surface="desktop" />;
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-main)]">
      <GsapScene variant="home">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div data-animate="home-shell" className="border border-[var(--border-soft)] bg-white">
          <div className="grid gap-8 border-b border-[var(--border-soft)] p-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-8">
            <div>
              <div data-animate="home-intro" className="inline-flex items-center gap-2 border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                <ShieldCheck size={15} className="text-[var(--success-text)]" />
                免费在线工具 · 本地处理
              </div>
              <h1 data-animate="home-intro" className="mt-5 text-4xl font-bold leading-tight tracking-normal text-[var(--text-main)] sm:text-5xl">
                万能格式转换器
              </h1>
              <p data-animate="home-intro" className="mt-4 max-w-3xl text-base leading-8 text-[var(--text-muted)]">
                面向日常办公、学习和内容创作的在线格式转换工具。图片、PDF、Word、Excel、音频和视频处理尽量在浏览器本地完成，不上传服务器，不调用云端转换 API。
              </p>
            </div>

            <div data-animate="home-intro" className="border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Privacy boundary</p>
              <div className="mt-3 grid gap-2">
                {trustItems.map((item) => (
                  <div key={item} data-animate="home-trust-item" className="border border-[var(--border-soft)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div data-animate="home-intro" className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Function matrix</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text-main)]">选择功能，进入工具台</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={siteConfig.links.tools} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--action-main)] bg-[var(--action-main)] px-5 text-sm font-semibold text-white hover:bg-[var(--action-hover)]">
                  打开在线工具 <ArrowRight size={17} />
                </Link>
                <Link href={siteConfig.links.download} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--border-soft)] bg-white px-5 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]">
                  <Download size={17} /> 下载离线专业版
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 border-l border-t border-[var(--border-soft)] md:grid-cols-2 lg:grid-cols-3">
              {matrixItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    data-animate="home-card"
                    className="group min-h-36 border-b border-r border-[var(--border-soft)] bg-white p-5 transition hover:bg-[var(--surface-muted)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-10 w-10 place-items-center border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-main)]">
                        <Icon size={19} />
                      </span>
                      <ArrowRight size={17} className="text-[var(--text-soft)] transition group-hover:translate-x-1 group-hover:text-[var(--accent-blue)]" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[var(--text-main)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.detail}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div id="ad-container" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="border-t border-dashed border-[var(--border-soft)] pt-8">
          <AdSlot config={adsConfig} name="homeMiddle" />
        </div>
      </div>
      </GsapScene>
    </main>
  );
}
