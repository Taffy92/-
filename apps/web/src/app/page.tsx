import Link from "next/link";
import { AdSlot } from "@doctool/ui";
import {
  ArrowRight,
  Check,
  Download,
  FileImage,
  FileText,
  ScanText,
  ShieldCheck,
  Video
} from "lucide-react";
import { GsapScene } from "@/components/motion/GsapScene";
import { ToolsClient } from "@/components/tools/ToolsClient";
import { adsConfig } from "@/config/ads";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const featureGroups = [
  {
    number: "01",
    title: "图片工具",
    detail: "格式、画面、尺寸与元数据",
    href: "/local-tools?tool=image-convert",
    icon: FileImage
  },
  {
    number: "02",
    title: "PDF 工具",
    detail: "页面、文件与图片互转",
    href: "/tools?tool=pdf-images",
    icon: FileText
  },
  {
    number: "03",
    title: "文档工具",
    detail: "Word 与 Excel 输出图片",
    href: "/tools?tool=word-images",
    icon: FileText
  },
  {
    number: "04",
    title: "音视频工具",
    detail: "转换、裁剪、提取与编辑",
    href: "/tools?tool=video-convert",
    icon: Video
  },
  {
    number: "05",
    title: "OCR 工具",
    detail: "图片与 PDF 文字识别",
    href: "/local-tools?tool=ocr",
    icon: ScanText
  }
] as const;

const localSteps = [
  ["01", "选择文件", "只读取你主动选择的本地文件。"],
  ["02", "设备内处理", "转换、预览和识别在当前浏览器完成。"],
  ["03", "保存结果", "结果由你下载，关闭页面后会从页面内存清除。"]
] as const;

export default function HomePage() {
  if (isDesktopApp) {
    return <ToolsClient surface="desktop" />;
  }

  return (
    <main className="a2-home">
      <GsapScene variant="home">
        <section className="a2-home-hero">
          <div className="a2-home-copy" data-animate="home-intro">
            <p className="a2-home-kicker">本地格式转换工具</p>
            <h1>文件转换，留在本机。</h1>
            <p className="a2-home-lead">
              处理图片、PDF、文档、音频、视频和 OCR。无需登录，不上传用户文件，选择具体任务即可开始。
            </p>
            <div className="a2-home-actions">
              <Link href="/tools?catalog=1" className="a2-button-primary">
                选择在线工具 <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link href={siteConfig.links.download} className="a2-button-secondary">
                <Download aria-hidden="true" size={17} />下载 Windows 离线版
              </Link>
            </div>
            <div className="a2-home-assurance" aria-label="本地处理说明">
              <span><ShieldCheck aria-hidden="true" size={14} />浏览器本地处理</span>
              <span>单文件在线使用</span>
              <span>批量任务在离线版完成</span>
            </div>
          </div>

          <article className="a2-home-task-card" aria-label="本地转换任务示例">
            <header>
              <div>
                <p>在线工具 / PDF 工具</p>
                <h2>PDF 转图片</h2>
              </div>
              <span><ShieldCheck aria-hidden="true" size={14} />本地处理</span>
            </header>
            <div className="a2-home-file-row">
              <FileText aria-hidden="true" size={28} />
              <div>
                <strong>产品使用手册_中文版.pdf</strong>
                <span>PDF · 45.6 MB · 13 页</span>
              </div>
              <span><Check aria-hidden="true" size={14} />已读取</span>
            </div>
            <dl>
              <div><dt>输出范围</dt><dd>全部 13 页</dd></div>
              <div><dt>图片格式</dt><dd>JPG · 高质量</dd></div>
            </dl>
            <footer>
              <div><strong>文件已就绪</strong><span>关闭页面后，文件和结果将从页面内存清除。</span></div>
              <Link href="/tools?tool=pdf-images">开始转换</Link>
            </footer>
          </article>
        </section>

        <section className="a2-home-directory" aria-labelledby="home-directory-title">
          <header>
            <div>
              <p>24 个真实功能</p>
              <h2 id="home-directory-title">按任务选择，不按版本拆分</h2>
            </div>
            <Link href="/tools?catalog=1">查看完整工具目录 <ArrowRight aria-hidden="true" size={15} /></Link>
          </header>
          <div>
            {featureGroups.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.number}>
                  <span>{item.number}</span>
                  <Icon aria-hidden="true" size={18} />
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                  <ArrowRight aria-hidden="true" size={15} />
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

        <section className="a2-home-local">
          <div>
            <p>本地处理说明</p>
            <h2>处理路径清楚，文件边界明确。</h2>
            <span>广告脚本与转换数据隔离；用户文件、预览和结果不会交给广告服务。</span>
          </div>
          <ol>
            {localSteps.map(([number, title, detail]) => (
              <li key={number}>
                <span>{number}</span>
                <div><strong>{title}</strong><p>{detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="a2-home-guides">
          <div>
            <p>使用教程</p>
            <h2>遇到限制时，查看具体处理方法。</h2>
            <span>教程围绕尺寸、质量、页码、兼容性和常见失败原因编写。</span>
          </div>
          <nav aria-label="常用教程">
            <Link href={siteConfig.links.tutorials}>图片如何压缩到指定大小 <ArrowRight aria-hidden="true" size={15} /></Link>
            <Link href={siteConfig.links.tutorials}>PDF 如何逐页导出图片 <ArrowRight aria-hidden="true" size={15} /></Link>
            <Link href={siteConfig.links.tutorials}>视频为什么优先转 MP4 <ArrowRight aria-hidden="true" size={15} /></Link>
          </nav>
        </section>
      </GsapScene>
    </main>
  );
}
