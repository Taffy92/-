"use client";

import { useState } from "react";

type PackageType = "exe" | "msi";

type ManifestPart = {
  url: string;
  size: number;
  sha256: string;
};

type ManifestPackage = {
  fileName: string;
  size: number;
  sha256: string;
  contentType: string;
  parts: ManifestPart[];
};

type DownloadManifest = {
  version: 1;
  packages: Record<PackageType, ManifestPackage>;
};

type WritableFile = {
  write(data: ArrayBuffer): Promise<void>;
  close(): Promise<void>;
  abort(reason?: unknown): Promise<void>;
};

type SaveFileHandle = {
  createWritable(): Promise<WritableFile>;
};

type SaveFilePicker = (options: {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<SaveFileHandle>;

type Props = {
  packageType: PackageType;
  fileName: string;
  manifestUrl: string;
  label: string;
  detail?: string;
  compact?: boolean;
};

export default function InstallerDownloadButton({
  packageType,
  fileName,
  manifestUrl,
  label,
  detail,
  compact = false
}: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const downloading = progress !== null && progress < 100;

  async function startDownload() {
    if (downloading) return;

    setProgress(0);
    setMessage("正在准备国内下载节点…");

    let writable: WritableFile | null = null;
    try {
      const manifest = await loadManifest(manifestUrl);
      const packageInfo = manifest.packages[packageType];
      validatePackage(packageInfo, fileName);

      const picker = (window as typeof window & { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
      const bufferedParts: ArrayBuffer[] = [];

      if (picker) {
        const handle = await picker({
          suggestedName: fileName,
          types: [
            {
              description: packageType === "exe" ? "Windows EXE 安装包" : "Windows MSI 安装包",
              accept: {
                [packageInfo.contentType]: [`.${packageType}`]
              }
            }
          ]
        });
        writable = await handle.createWritable();
      }

      let downloadedBytes = 0;
      for (const [index, part] of packageInfo.parts.entries()) {
        setMessage(`正在下载并校验第 ${index + 1}/${packageInfo.parts.length} 个分片…`);
        const bytes = await fetchVerifiedPart(part);
        if (writable) await writable.write(bytes);
        else bufferedParts.push(bytes);
        downloadedBytes += bytes.byteLength;
        setProgress(Math.round((downloadedBytes / packageInfo.size) * 100));
      }

      if (downloadedBytes !== packageInfo.size) {
        throw new Error("下载后的文件大小与发布记录不一致。");
      }

      if (writable) {
        await writable.close();
        writable = null;
      } else {
        saveBufferedFile(bufferedParts, packageInfo.contentType, fileName);
      }

      setProgress(100);
      setMessage(`下载完成；文件 SHA256 应为 ${packageInfo.sha256}`);
    } catch (error) {
      if (writable) await writable.abort(error).catch(() => undefined);
      if (error instanceof DOMException && error.name === "AbortError") {
        setProgress(null);
        setMessage("已取消下载，可以重新点击。");
        return;
      }
      setProgress(null);
      setMessage(error instanceof Error ? `下载失败：${error.message}` : "下载失败，请稍后重试。");
    }
  }

  if (compact) {
    return (
      <div className="rounded-sm border border-cyan-300/20 bg-slate-900/70 p-4 transition hover:border-cyan-300/50 hover:bg-cyan-400/10">
        <button
          type="button"
          onClick={startDownload}
          disabled={downloading}
          className="w-full text-left disabled:cursor-wait disabled:opacity-70"
        >
          <span className="block text-sm font-semibold text-slate-50">{downloading ? `正在下载 ${progress}%` : label}</span>
          <span className="mt-1 block break-words text-xs text-slate-400">{fileName}</span>
          <span className="mt-2 block text-xs text-cyan-200">{detail}</span>
        </button>
        <DownloadProgress progress={progress} message={message} />
      </div>
    );
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={startDownload}
        disabled={downloading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-cyan-300/50 bg-cyan-400 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-70"
      >
        {downloading ? `正在下载 ${progress}%` : label}
      </button>
      <DownloadProgress progress={progress} message={message} />
    </div>
  );
}

function DownloadProgress({ progress, message }: { progress: number | null; message: string }) {
  if (!message) return null;

  return (
    <div className="mt-3" aria-live="polite">
      {progress !== null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      <p className="mt-2 break-words text-xs leading-5 text-slate-300">{message}</p>
    </div>
  );
}

async function loadManifest(url: string): Promise<DownloadManifest> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`下载清单不可用（HTTP ${response.status}）。`);
  const manifest = await response.json() as DownloadManifest;
  if (manifest.version !== 1 || !manifest.packages?.exe || !manifest.packages?.msi) {
    throw new Error("下载清单格式无效。");
  }
  return manifest;
}

function validatePackage(packageInfo: ManifestPackage | undefined, expectedFileName: string) {
  if (!packageInfo || packageInfo.fileName !== expectedFileName) {
    throw new Error("安装包信息与页面不一致。");
  }
  if (!Number.isSafeInteger(packageInfo.size) || packageInfo.size <= 0 || packageInfo.parts.length === 0) {
    throw new Error("安装包大小或分片信息无效。");
  }
  const totalPartSize = packageInfo.parts.reduce((total, part) => total + part.size, 0);
  if (totalPartSize !== packageInfo.size) {
    throw new Error("安装包分片大小不完整。");
  }
  for (const part of packageInfo.parts) {
    if (!part.url.startsWith("/release/v1.0.0/edgeone/") || !/^[A-F0-9]{64}$/.test(part.sha256)) {
      throw new Error("安装包分片地址或校验值无效。");
    }
  }
}

async function fetchVerifiedPart(part: ManifestPart): Promise<ArrayBuffer> {
  const response = await fetch(part.url);
  if (!response.ok) throw new Error(`分片请求失败（HTTP ${response.status}）。`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== part.size) throw new Error("分片大小校验失败。");
  const hash = await sha256(bytes);
  if (hash !== part.sha256) throw new Error("分片完整性校验失败。");
  return bytes;
}

async function sha256(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function saveBufferedFile(parts: ArrayBuffer[], contentType: string, fileName: string) {
  const url = URL.createObjectURL(new Blob(parts, { type: contentType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
