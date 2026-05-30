import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import {
  bundledArtifacts,
  directNpmPackages,
  npmPackages,
  rustCrates,
  thirdPartyNoticeMeta
} from "@/generated/thirdPartyNotices";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "开源许可证 - 万能格式转换器",
  path: "/licenses",
  description: "万能格式转换器在线版和离线专业版使用的开源项目、第三方库和构建产物 Notices。"
});

export default function LicensesPage() {
  return (
    <main className="document-page mx-auto max-w-6xl px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <article className="rounded-sm tech-panel p-6 sm:p-10">
        <p className="text-sm font-semibold text-cyan-300">开源许可证</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">开源许可证与第三方 Notices</h1>
        <p className="mt-4 leading-8 text-slate-300">
          万能格式转换器使用了若干开源项目和第三方库。本页面根据 pnpm-lock.yaml、Cargo.lock、
          本地依赖元数据和最终构建产物生成，用于在线版和 Windows 离线专业版发布时保留第三方 Notices。
        </p>
        <p className="mt-3 leading-8 text-slate-300">
          大多数依赖允许商业使用，但必须保留对应版权声明、许可证文本和必要 NOTICE。若你发现许可证信息存在遗漏或错误，
          请通过 {siteConfig.email} 联系我们。
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="npm 依赖" value={thirdPartyNoticeMeta.npmPackageCount} />
          <StatCard label="直接 npm 依赖" value={thirdPartyNoticeMeta.directNpmPackageCount} />
          <StatCard label="Rust crate" value={thirdPartyNoticeMeta.rustCrateCount} />
          <StatCard label="构建产物记录" value={thirdPartyNoticeMeta.bundledArtifactCount} />
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-50">生成来源</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            {thirdPartyNoticeMeta.sources.map((source) => (
              <li key={source} className="rounded-sm border border-cyan-300/10 bg-slate-900/70 px-3 py-2 font-mono text-xs">
                {source}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-400">生成时间：{thirdPartyNoticeMeta.generatedAt}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-50">最终构建产物记录</h2>
          <NoticeTable
            headers={["名称", "路径", "类型", "文件数", "大小", "SHA256", "说明"]}
            rows={bundledArtifacts.map((item) => [
              item.label,
              item.path,
              item.kind,
              String(item.files),
              item.sizeBytes == null ? "-" : formatBytes(item.sizeBytes),
              item.sha256 || "-",
              item.note
            ])}
          />
        </section>

        <section id="ffmpeg-notice" className="mt-8 rounded-sm border border-amber-300/20 bg-amber-950/30 p-5 text-sm leading-7 text-amber-100">
          <h2 className="text-2xl font-semibold text-slate-50">FFmpeg 许可证说明</h2>
          <p className="mt-3">
            在线版继续使用本地 FFmpeg WASM 静态资源；离线专业版保留 FFmpeg WASM 回退，并在 Windows 离线专业版中仅对
            WAV 转 FLAC、MP4 转 WebM 和媒体信息读取使用本地 sidecar FFmpeg 优先处理。
          </p>
          <p className="mt-2">
            MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 等格式不属于当前 sidecar 默认范围。BtbN FFmpeg 候选仅作为当前技术实现的一部分，
            不代表已经完成商业许可证最终复核。正式商业发布前仍建议进行人工许可证和法律复核。
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-50">直接 npm 依赖</h2>
          <NoticeTable
            headers={["包名", "版本", "许可证", "仓库/主页", "许可证文件"]}
            rows={directNpmPackages.map((item) => [
              item.name,
              item.version,
              item.license,
              item.repository || item.homepage || "-",
              item.licenseFiles.join(", ") || "-"
            ])}
          />
        </section>

        <details className="mt-8 rounded-sm border border-cyan-300/15 bg-slate-950/60 p-4">
          <summary className="cursor-pointer text-lg font-semibold text-slate-50">完整 npm 依赖 Notices</summary>
          <NoticeTable
            headers={["包名", "版本", "许可证", "直接依赖", "锁文件", "仓库/主页", "许可证文件", "NOTICE 文件"]}
            rows={npmPackages.map((item) => [
              item.name,
              item.version,
              item.license,
              item.direct ? "是" : "否",
              item.inLockfile ? "是" : "否",
              item.repository || item.homepage || "-",
              item.licenseFiles.join(", ") || "-",
              item.noticeFiles.join(", ") || "-"
            ])}
          />
        </details>

        <details className="mt-6 rounded-sm border border-cyan-300/15 bg-slate-950/60 p-4">
          <summary className="cursor-pointer text-lg font-semibold text-slate-50">Rust / Tauri 依赖 Notices</summary>
          <NoticeTable
            headers={["crate", "版本", "许可证", "仓库/主页", "来源", "checksum"]}
            rows={rustCrates.map((item) => [
              item.name,
              item.version,
              item.license,
              item.repository || item.homepage || "-",
              item.source || "-",
              item.checksum || "-"
            ])}
          />
        </details>

        <section className="mt-8 rounded-sm border border-cyan-300/12 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
          <p>发布归档文件已同步生成到 docs/licenses.md 和 docs/third-party-notices.md。</p>
          <p className="mt-2">
            如果更新依赖、重新打包离线版或替换 WASM、PDF、FFmpeg 静态资源，请重新生成第三方 Notices。
          </p>
        </section>
      </article>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-cyan-300/12 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-50">{value}</p>
    </div>
  );
}

function NoticeTable({ headers, rows }: { headers: string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-sm border border-cyan-300/15">
      <table className="w-full min-w-[920px] border-collapse text-left text-xs">
        <thead className="bg-slate-900 text-slate-100">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-cyan-300/15 px-3 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.join("-") || rowIndex} className="border-b border-cyan-300/10 text-slate-300 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="max-w-[360px] break-words px-3 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}
