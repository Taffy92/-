import Link from "next/link";
import { ArrowRight, Download, FileAudio, FileText, ImageIcon, ShieldCheck, Video, Zap } from "lucide-react";
import { AdSlot } from "@doctool/ui";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const featureCards = [
  { title: "图片处理", text: "裁切、尺寸调整、添加水印和图片压缩。", icon: ImageIcon },
  { title: "文档转图片", text: "PDF、Word、Excel 支持逐页导出和合成长图。", icon: FileText },
  { title: "视频转换", text: "支持 MP4、MOV、AVI、MKV、WebM 等主流格式。", icon: Video },
  { title: "音频转换", text: "支持 MP3、WAV、AAC、M4A、FLAC。", icon: FileAudio },
  { title: "隐私友好", text: "不调用云端转换 API，广告组件与文件处理隔离。", icon: ShieldCheck }
];

const trustItems = ["文件仅在本地处理", "不调用云端转换 API", "支持 Vercel 和 CloudBase 静态部署"];

export default function HomePage() {
  if (isDesktopApp) {
    return <ToolsClient surface="desktop" />;
  }

  return (
    <main className="bg-transparent text-slate-100">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8 lg:py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
            <Zap size={16} /> 免费使用 · 文件本地处理
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-50 sm:text-5xl">万能格式转换器</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              一个轻量的在线格式转换工具。图片、PDF、Word、Excel、音频和视频处理尽量在浏览器本地完成，
              不上传服务器，不调用云端转换 API。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={siteConfig.links.tools} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-300/50 bg-cyan-400 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.22)] hover:bg-cyan-300">
              打开在线工具 <ArrowRight size={18} />
            </Link>
            <Link href={siteConfig.links.download} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-950/70 px-6 text-sm font-semibold text-slate-100 hover:bg-cyan-400/10">
              <Download size={18} /> 下载离线专业版
            </Link>
          </div>
          <div className="notice">
            你的文件只在当前设备中处理，不会上传到服务器。敏感文件、大文件和批量任务建议使用离线专业版。
            CloudBase 只用于下载授权，不接触用户处理文件。
          </div>
        </div>

        <div className="rounded-3xl tech-panel p-4">
          <div className="grid gap-3">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-cyan-300/12 bg-slate-900/70 p-4">
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/12 text-cyan-200">
                    <Icon size={20} />
                  </div>
                  <h2 className="font-bold text-slate-50">{card.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item} className="rounded-2xl border border-cyan-300/12 bg-slate-950/70 p-5 text-sm font-semibold text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">{item}</div>
          ))}
        </div>
      </section>

      <div id="ad-container" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <AdSlot config={adsConfig} name="homeMiddle" />
      </div>
    </main>
  );
}
