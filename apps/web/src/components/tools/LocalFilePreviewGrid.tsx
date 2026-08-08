"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, FileAudio, FileImage, FileText } from "lucide-react";
import type { ImageMetadataSummary } from "@doctool/image-core";
import { formatBytes } from "@doctool/shared";
import type { LocalToolOutput } from "@/components/tools/useLocalToolController";

type LocalFilePreviewGridProps = {
  files: File[];
  desktop: boolean;
  multiple: boolean;
  onPickFile: () => void;
  onFilesChange: (files: File[]) => void;
};

export function LocalFilePreviewGrid({
  files,
  desktop,
  multiple,
  onPickFile,
  onFilesChange
}: LocalFilePreviewGridProps) {
  if (desktop) {
    return files.length ? (
      <div className="local-toolkit-file-grid" aria-label="已选文件预览">
        {files.map((file) => (
          <LocalFilePreview file={file} key={`${file.name}-${file.size}-${file.lastModified}`} />
        ))}
      </div>
    ) : (
      <button className="desktop-a-empty" type="button" onClick={onPickFile}>
        <FileImage aria-hidden="true" size={26} />
        <strong>添加要处理的文件</strong>
        <span>{multiple ? "可以一次选择多个文件" : "当前工具每次处理一个文件"}</span>
      </button>
    );
  }

  if (!files.length) return null;
  return (
    <div className="a2-local-file-list">
      {files.map((file) => (
        <div key={`${file.name}-${file.size}-${file.lastModified}`}>
          <span title={file.name}>{file.name}</span>
          <small>{formatBytes(file.size)}</small>
          {files.length > 1 ? (
            <span>
              <button type="button" aria-label={`上移 ${file.name}`} disabled={files[0] === file} onClick={() => moveFile(file, -1, files, onFilesChange)}><ChevronUp size={14} /></button>
              <button type="button" aria-label={`下移 ${file.name}`} disabled={files[files.length - 1] === file} onClick={() => moveFile(file, 1, files, onFilesChange)}><ChevronDown size={14} /></button>
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function LocalFilePreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  return (
    <article className="local-file-preview">
      <div className="local-file-preview-visual">
        {isImage && url ? <img src={url} alt="" /> : null}
        {isVideo && url ? <video src={url} muted preload="metadata" /> : null}
        {isPdf && url ? <object data={`${url}#page=1&view=FitH`} type="application/pdf" aria-label={`${file.name} 第一页预览`} /> : null}
        {!isImage && !isVideo && !isPdf ? (
          isAudio ? <FileAudio aria-hidden="true" /> : <FileText aria-hidden="true" />
        ) : null}
      </div>
      <div>
        <strong title={file.name}>{file.name}</strong>
        <span>{file.name.split(".").pop()?.toUpperCase() || "文件"} · {formatBytes(file.size)}</span>
        <small>已加入任务</small>
      </div>
    </article>
  );
}

export function LocalMetadataView({ metadata }: { metadata: ImageMetadataSummary }) {
  const rows = [
    ["拍摄时间", metadata.capturedAt],
    ["相机 / 设备", metadata.camera],
    ["软件信息", metadata.software],
    ["GPS", metadata.gps],
    ["方向", metadata.orientation],
    ["尺寸", metadata.dimensions]
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <div className="mt-4 grid gap-2 border border-slate-800 bg-slate-950 p-4 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => <p key={label}><span className="text-slate-500">{label}：</span>{value}</p>)}
      {!rows.length ? <p className="text-slate-500">没有读取到常用 EXIF 元数据。</p> : null}
    </div>
  );
}

export function LocalOutputList({ outputs }: { outputs: LocalToolOutput[] }) {
  if (!outputs.length) return null;
  return (
    <div className="a2-output-list mt-5 border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
      <h3 className="font-semibold text-emerald-200">处理结果</h3>
      <div className="mt-3 space-y-2">
        {outputs.map((item, index) => (
          <div className="a2-output-item flex items-center justify-between gap-3 border border-slate-800 bg-slate-950/70 px-3 py-2" key={`${item.name}-${index}`}>
            <div className="min-w-0">
              <p className="truncate text-sm">{item.name}</p>
              <p className="truncate text-xs text-slate-500">{item.savedPath || formatBytes(item.blob.size)}</p>
            </div>
            <button className="btn-secondary inline-flex shrink-0 items-center gap-2 px-3 py-2 text-xs" type="button" onClick={() => downloadBlob(item.blob, item.name)}>
              <Download className="h-3.5 w-3.5" />下载
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function moveFile(
  file: File,
  offset: -1 | 1,
  files: File[],
  onFilesChange: (files: File[]) => void
) {
  const index = files.indexOf(file);
  const nextIndex = index + offset;
  if (index < 0 || nextIndex < 0 || nextIndex >= files.length) return;
  const next = [...files];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  onFilesChange(next);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
