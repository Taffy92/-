import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Images,
  ScanText,
  ShieldCheck
} from "lucide-react";

const quickStarts = [
  {
    title: "图片格式转换",
    detail: "JPG、PNG、WebP 等常用格式互转",
    href: "/local-tools?tool=image-convert",
    icon: Images,
    tone: "blue"
  },
  {
    title: "PDF 转图片",
    detail: "逐页导出 PNG、JPG 或 WebP",
    href: "/tools?tool=pdf-images",
    icon: FileText,
    tone: "red"
  },
  {
    title: "图片 OCR",
    detail: "识别图片或 PDF 中的中英文",
    href: "/local-tools?tool=ocr",
    icon: ScanText,
    tone: "cyan"
  }
] as const;

export function HomeFlowDemo() {
  return (
    <div className="a2-home-demo-shell" data-animate="home-shell">
      <section className="a2-home-flow-demo" aria-labelledby="home-quick-start-title">
        <header className="a2-home-flow-header">
          <div>
            <p>快速开始</p>
            <h2 id="home-quick-start-title">选择一个具体任务</h2>
          </div>
          <span><ShieldCheck aria-hidden="true" size={14} />本地处理</span>
        </header>

        <nav className="a2-home-start-list" aria-label="常用在线工具">
          {quickStarts.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.title} data-tone={item.tone}>
                <span><Icon aria-hidden="true" size={20} /></span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            );
          })}
        </nav>

        <footer className="a2-home-flow-footer">
          <div>
            <strong>还有更多文件工具</strong>
            <span>按图片、PDF、文档、音视频和 OCR 分类查找。</span>
          </div>
          <Link href="/tools">
            查看全部工具 <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </footer>
      </section>
    </div>
  );
}
