import Link from "next/link";
import type { Metadata } from "next";
import InstallerDownloadButton from "@/components/download/InstallerDownloadButton";
import { downloadsConfig } from "@/config/downloads";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "下载离线专业版 - 万能格式转换器",
  path: "/download",
  description:
    "万能格式转换器 Windows 离线专业版支持断网安装、断网使用和批量处理。安装后可免费试用 3 天，继续使用需要激活码。"
});

export default function DownloadPage() {
  const primaryPackage = downloadsConfig.packages[0];

  return (
    <main className="document-page apple-document-page mx-auto max-w-5xl px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <section className="document-hero rounded-sm tech-panel p-6 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">离线专业版</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">下载离线安装版</h1>
        <p className="mt-3 text-slate-300">{downloadsConfig.appName} · 文件只在当前设备处理，不上传服务器</p>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="text-sm leading-7 text-slate-300">
            <p className="text-base font-semibold text-slate-50">离线专业版面向批量处理、敏感文件和断网办公。</p>
            <ul className="mt-3 space-y-2">
              <li>· 安装后可断网处理图片、PDF、Office、音频和视频</li>
              <li>· 批量结果写入独立文件夹，不上传用户文件</li>
              <li>· 无需登录，首次运行自动开启 3 天完整试用</li>
            </ul>
          </div>

          <div className="border border-cyan-300/20 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Windows 10 / 11 x64</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-50">{downloadsConfig.appName}</h2>
            <p className="mt-1 break-all text-xs text-slate-400">{primaryPackage.fileName}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{primaryPackage.note}</p>
            <InstallerDownloadButton
              packageType={primaryPackage.type}
              fileName={primaryPackage.fileName}
              manifestUrl={downloadsConfig.manifestUrl}
              label="下载 ZIP 3 天试用版"
              detail="无需口令；下载完成后会自动校验文件完整性"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="当前版本" value={downloadsConfig.version} />
          <Info label="文件大小" value={downloadsConfig.fileSize} />
          <Info label="支持系统" value="Windows 10 / 11 x64" />
          <Info label="试用期" value="3 天完整试用" />
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {!downloadsConfig.windowsCodeSigned ? (
          <div className="rounded-sm border border-amber-300/25 bg-amber-950/20 p-6">
            <p className="text-sm font-semibold text-amber-200">安装前请注意</p>
            <h2 className="mt-2 text-xl font-bold text-slate-50">当前安装包尚未代码签名</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Windows 可能显示 Microsoft Defender SmartScreen 提示。请先核对本页 SHA256；确认一致后，在提示中选择“更多信息”，再选择“仍要运行”。
            </p>
          </div>
        ) : null}

        <details className="rounded-sm tech-panel p-6 text-slate-100">
          <summary className="cursor-pointer text-sm font-semibold text-cyan-200">查看 SHA256 与分片完整性说明</summary>
          <div className="mt-4 text-sm leading-7 text-slate-300">
            <p>下载器会从两个同源域名并行读取分片，逐片校验后按顺序写入 ZIP，并在完成后再次校验整个文件。</p>
            <p className="mt-3 text-xs text-slate-400">ZIP SHA256</p>
            <code className="mt-1 block break-all font-mono text-xs text-slate-100">{downloadsConfig.sha256}</code>
            <p className="mt-3">发布日期：{downloadsConfig.releaseDate}</p>
          </div>
        </details>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Card title="支持系统" items={["Windows 10 x64", "Windows 11 x64"]} />
        <Card
          title="离线版特点"
          items={[
            "安装后断网可用",
            "文件本地处理",
            "不上传图片、PDF、Word、Excel、音频或视频",
            "适合敏感文件",
            "适合大文件",
            "额外提供离线批量处理能力"
          ]}
        />
        <Card
          title="批量处理能力"
          items={[
            "批量导入跟随当前转换工具",
            "图片尺寸调整、加水印和压缩",
            "PDF、Word、Excel 转图片",
            "视频转换、音频转换和视频提取音频",
            "输出目录、清空任务、文件预览和下载结果"
          ]}
        />
        <Card
          title="获取方式"
          items={[
            "在线页面直接下载 3 天试用版",
            "首次运行自动开启本机试用期",
            "试用结束后输入激活码或导入 license.mrx",
            "下载后可复制到 U 盘，在断网电脑上安装测试"
          ]}
        />
      </section>

      <section className="mt-8 rounded-sm tech-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-50">更新内容</h2>
        <ul className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          {downloadsConfig.changelog.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-sm tech-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-50">发布说明与合规入口</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          下载前建议先查看安装说明、隐私说明和开源许可证。请先核对 ZIP 的 SHA256，再解压 ZIP 内的 MSI 安装包。
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DocLink href="/release/v2.0.0/docs/release-notes" label="发布说明" />
          <DocLink href="/release/v2.0.0/docs/install-guide" label="安装指南" />
          <DocLink href="/privacy" label="隐私说明" />
          <DocLink href="/licenses" label="开源许可证" />
          <DocLink href="/release/v2.0.0/docs/third-party-notices" label="第三方组件声明" />
          <DocLink href="/release/v2.0.0/docs/ffmpeg-license" label="FFmpeg 许可证说明" />
        </div>
      </section>

      <section id="install-tips" className="mt-8 rounded-sm tech-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-50">安装和校验提示</h2>
        <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          <li>1. 下载 ZIP 后，展开完整性说明并核对页面展示的 SHA256 与本地文件是否一致。</li>
          <li>2. Windows 10 / 11 均可安装；离线专业版安装包内置 WebView2 离线安装支持。</li>
          <li>3. 解压 ZIP 后运行其中的 MSI 安装包，按向导完成离线专业版安装。</li>
          <li>4. 离线专业版支持断网使用；授权只控制桌面端继续使用，不接触用户处理文件。</li>
          <li>5. 在线版适合单文件或少量文件快速处理，批量处理请使用 Windows 离线专业版。</li>
        </ol>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-cyan-300/12 bg-slate-900/70 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-sm tech-panel p-6">
      <h2 className="text-xl font-bold text-slate-50">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-sm border border-cyan-300/15 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-100 hover:border-cyan-300/40 hover:bg-cyan-400/10">
      {label}
    </Link>
  );
}
