import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createPageMetadata } from "@/lib/seo";

const releaseDocs = {
  "release-notes": {
    title: "发布说明",
    fileName: "RELEASE_NOTES.md",
    description: "万能格式转换器离线专业版发布说明。"
  },
  "install-guide": {
    title: "安装指南",
    fileName: "INSTALL_GUIDE.md",
    description: "万能格式转换器离线专业版安装与校验指南。"
  },
  "third-party-notices": {
    title: "第三方组件声明",
    fileName: "THIRD_PARTY_NOTICES.md",
    description: "万能格式转换器第三方组件与开源许可证 Notices。"
  },
  "ffmpeg-license": {
    title: "FFmpeg 许可证说明",
    fileName: "FFMPEG_LICENSE_NOTICE.md",
    description: "万能格式转换器 FFmpeg 相关许可证说明。"
  }
} as const;

type ReleaseDocSlug = keyof typeof releaseDocs;

type PageProps = {
  params: Promise<{
    doc: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(releaseDocs).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { doc } = await params;
  const entry = getReleaseDoc(doc);
  if (!entry) {
    return {};
  }

  return createPageMetadata({
    title: `${entry.title} - 万能格式转换器`,
    path: `/release/v1.0.0/docs/${doc}`,
    description: entry.description
  });
}

export default async function ReleaseDocPage({ params }: PageProps) {
  const { doc } = await params;
  const entry = getReleaseDoc(doc);
  if (!entry) {
    notFound();
  }

  const content = readFileSync(join(process.cwd(), "public", "release", "v1.0.0", "docs", entry.fileName), "utf8");

  return (
    <main className="document-page apple-document-page mx-auto max-w-5xl px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <article className="document-article rounded-sm tech-panel p-6 sm:p-10">
        <p className="document-kicker text-sm font-semibold text-cyan-300">发布文档</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">{entry.title}</h1>
        <p className="document-meta mt-3 text-sm text-slate-300">
          万能格式转换器离线专业版 v1.0.0 · 站内阅读版
        </p>
        <div className="document-body mt-8 space-y-4 text-sm leading-7 text-slate-200">{renderMarkdown(content)}</div>
      </article>
    </main>
  );
}

function getReleaseDoc(doc: string) {
  if (doc in releaseDocs) {
    return releaseDocs[doc as ReleaseDocSlug];
  }
  return null;
}

function renderMarkdown(content: string) {
  const blocks = content.replace(/^\uFEFF/, "").split(/\n{2,}/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) {
      return null;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      if (level === 1) {
        return <h2 key={index} className="pt-2 text-2xl font-bold text-slate-50">{text}</h2>;
      }
      if (level === 2) {
        return <h3 key={index} className="pt-4 text-xl font-bold text-slate-50">{text}</h3>;
      }
      return <h4 key={index} className="pt-3 text-base font-semibold text-slate-100">{text}</h4>;
    }

    const lines = trimmed.split("\n");
    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      return (
        <ul key={index} className="list-disc space-y-2 pl-5 text-slate-200">
          {lines.map((line) => <li key={line}>{line.trim().replace(/^[-*]\s+/, "")}</li>)}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
      return (
        <ol key={index} className="list-decimal space-y-2 pl-5 text-slate-200">
          {lines.map((line) => <li key={line}>{line.trim().replace(/^\d+\.\s+/, "")}</li>)}
        </ol>
      );
    }

    if (trimmed.includes("|") || trimmed.startsWith("```")) {
      return (
        <pre key={index} className="overflow-x-auto whitespace-pre-wrap rounded-sm border border-cyan-300/15 bg-slate-950/60 p-4 text-xs leading-6 text-slate-200">
          {trimmed.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "")}
        </pre>
      );
    }

    return (
      <p key={index} className="whitespace-pre-wrap text-slate-200">
        {trimmed}
      </p>
    );
  });
}
