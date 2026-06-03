import Link from "next/link";
import type { Metadata } from "next";
import { downloadsConfig } from "@/config/downloads";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "下载离线专业版 - 万能格式转换器",
  path: "/download",
  description:
    "万能格式转换器 Windows 离线专业版支持断网安装、断网使用和批量处理。安装后可免费试用 3 天，继续使用需要激活码。"
});

export default function DownloadPage() {
  return (
    <main className="document-page apple-document-page mx-auto max-w-5xl px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <section className="document-hero rounded-sm tech-panel p-6 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">离线专业版</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">下载离线安装版</h1>
        <p className="mt-3 text-slate-300">{downloadsConfig.appName}</p>
        <div className="mt-6 rounded-sm border border-cyan-300/20 bg-cyan-950/25 p-5 text-sm leading-7 text-cyan-50">
          <p className="font-semibold text-slate-50">
            离线专业版面向需要批量处理、敏感文件处理和断网办公的用户。
          </p>
          <p className="mt-2">
            在线版保持轻量单文件处理，不提供批量处理能力。离线专业版的批量导入跟随当前转换工具，覆盖图片尺寸调整、
            图片加水印、图片压缩、PDF/Word/Excel 转图片、视频格式转换、音频格式转换和视频提取音频，并可在无互联网连接的电脑上安装和使用核心功能。
          </p>
          <p className="mt-2">
            离线专业版改为直接下载 3 天试用版。安装后首次运行会在本机开启试用期，试用结束后需要输入激活码或导入授权文件继续使用。
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="当前版本" value={downloadsConfig.version} />
          <Info label="文件大小" value={downloadsConfig.fileSize} />
          <Info label="更新日期" value={downloadsConfig.releaseDate} />
          <Info label="SHA256" value={downloadsConfig.sha256} />
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {downloadsConfig.packages.map((item) => (
          <div key={item.type} className="rounded-sm tech-panel p-6">
            <p className="text-sm font-semibold text-cyan-300">{item.label}</p>
            <h2 className="mt-2 break-words text-xl font-bold text-slate-50">{item.fileName}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.note}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-slate-400">文件大小</dt>
                <dd className="mt-1 font-semibold text-slate-100">{item.fileSize}</dd>
              </div>
              <div>
                <dt className="text-slate-400">SHA256</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-200">{item.sha256}</dd>
              </div>
            </dl>
            <a
              href={item.downloadUrl}
              download={item.fileName}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-cyan-300/50 bg-cyan-400 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              下载 {item.type.toUpperCase()} 3 天试用版
            </a>
          </div>
        ))}
      </section>

      <TrialDownloadPanel />

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
            "输出目录、失败重试、预览和下载结果"
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
          下载前建议先查看安装说明、隐私说明和开源许可证。安装包未做代码签名时，Windows Defender 或 SmartScreen
          可能出现提示，请核对 SHA256 后再安装。
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DocLink href="/release/v1.0.0/docs/release-notes" label="发布说明" />
          <DocLink href="/release/v1.0.0/docs/install-guide" label="安装指南" />
          <DocLink href="/privacy" label="隐私说明" />
          <DocLink href="/licenses" label="开源许可证" />
          <DocLink href="/release/v1.0.0/docs/third-party-notices" label="第三方组件声明" />
          <DocLink href="/release/v1.0.0/docs/ffmpeg-license" label="FFmpeg 许可证说明" />
        </div>
      </section>

      <section id="install-tips" className="mt-8 rounded-sm tech-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-50">安装和校验提示</h2>
        <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          <li>1. 下载 EXE 或 MSI 后，先核对页面展示的 SHA256 与本地文件是否一致。</li>
          <li>2. Windows 10 / 11 均可安装；离线专业版安装包内置 WebView2 离线安装支持。</li>
          <li>3. 如果 SmartScreen 提示未知发布者，请确认文件来源和 SHA256，再根据自己的风险判断继续安装。</li>
          <li>4. 离线专业版支持断网使用；授权只控制桌面端继续使用，不接触用户处理文件。</li>
          <li>5. 在线版适合单文件或少量文件快速处理，批量处理请使用 Windows 离线专业版。</li>
        </ol>
      </section>
    </main>
  );
}

function TrialDownloadPanel() {
  return (
    <section id="trial-download" className="mt-8 rounded-sm border border-cyan-300/15 bg-slate-950/70 p-5 text-slate-100 sm:p-7">
      <p className="inline-flex items-center rounded-sm border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
        3 天试用 · 离线激活
      </p>
      <h2 className="mt-3 text-xl font-bold text-slate-50">离线专业版现在可以直接下载试用</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
        下载和安装不再需要口令。软件首次运行后自动开启本机 3 天试用；试用结束后，用户把机器码发给管理员，再输入激活码或导入
        license.mrx 授权文件即可继续使用。授权流程不要求登录，也不会上传用户处理的图片、PDF、Word、Excel、音频或视频。
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {downloadsConfig.packages.map((item) => (
          <a
            key={item.type}
            href={item.downloadUrl}
            download={item.fileName}
            className="rounded-sm border border-cyan-300/20 bg-slate-900/70 p-4 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
          >
            <span className="block text-sm font-semibold text-slate-50">下载 {item.label}</span>
            <span className="mt-1 block text-xs text-slate-400">{item.fileName}</span>
            <span className="mt-2 block text-xs text-cyan-200">无需口令，安装后自动试用 3 天</span>
          </a>
        ))}
      </div>
      <div className="mt-5 rounded-sm border border-cyan-300/12 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
        试用结束或需要正式授权时，联系管理员：微信 ___Skyblue，电话 15588261515，邮箱 370298218@qq.com。
      </div>
    </section>
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
