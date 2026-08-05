"use client";

import { useState } from "react";

type PackageType = "zip";

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
  getFile(): Promise<{ arrayBuffer(): Promise<ArrayBuffer> }>;
};

type SaveFilePicker = (options: {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<SaveFileHandle>;

const DOWNLOAD_CONCURRENCY = 12;
const DOWNLOAD_MIRROR_HOSTS = ["gszhmrx.cn", "www.gszhmrx.cn"] as const;
const PROGRESS_UPDATE_BYTES = 1024 * 1024;

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
    let saveHandle: SaveFileHandle | null = null;
    try {
      const manifest = await loadManifest(manifestUrl);
      const packageInfo = manifest.packages[packageType];
      validatePackage(packageInfo, fileName, manifestUrl, packageType);

      const picker = (window as typeof window & { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
      if (!picker) {
        throw new Error("当前浏览器不支持安全保存安装包，请使用新版 Edge 或 Chrome。");
      }

      const handle = await picker({
        suggestedName: fileName,
        types: [
          {
            description: "Windows ZIP 安装包",
            accept: {
              [packageInfo.contentType]: [".zip"]
            }
          }
        ]
      });
      saveHandle = handle;
      writable = await handle.createWritable();

      await downloadPartsInOrder(packageInfo.parts, writable, packageInfo.size, (downloadedBytes) => {
        const totalProgress = Math.min(99, Math.round((downloadedBytes / packageInfo.size) * 100));
        setProgress(totalProgress);
        setMessage(`正在并行下载并校验安装包，已处理 ${totalProgress}%…`);
      });

      await writable.close();
      writable = null;

      setMessage("正在验证安装包完整性…");
      const savedFile = await saveHandle.getFile();
      const savedBytes = await savedFile.arrayBuffer();
      const savedHash = await sha256(savedBytes);
      if (savedBytes.byteLength !== packageInfo.size || savedHash !== packageInfo.sha256) {
        throw new Error("下载后的安装包完整性校验失败，请删除当前文件后重新下载。");
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
  if (manifest.version !== 1 || !manifest.packages?.zip || Object.keys(manifest.packages).some((key) => key !== "zip")) {
    throw new Error("下载清单格式无效。");
  }
  return manifest;
}

function validatePackage(
  packageInfo: ManifestPackage | undefined,
  expectedFileName: string,
  manifestUrl: string,
  packageType: PackageType
) {
  if (!packageInfo || packageInfo.fileName !== expectedFileName) {
    throw new Error("安装包信息与页面不一致。");
  }
  if (!Number.isSafeInteger(packageInfo.size) || packageInfo.size <= 0 || packageInfo.parts.length === 0) {
    throw new Error("安装包大小或下载信息无效。");
  }
  const totalPartSize = packageInfo.parts.reduce((total, part) => total + part.size, 0);
  if (totalPartSize !== packageInfo.size) {
    throw new Error("安装包数据大小不完整。");
  }
  const manifestPath = new URL(manifestUrl, window.location.origin).pathname;
  const expectedPartPrefix = `${manifestPath.replace(/manifest\.json$/, "")}${packageType}/`;
  for (const part of packageInfo.parts) {
    if (!part.url.startsWith(expectedPartPrefix) || !/^[A-F0-9]{64}$/.test(part.sha256)) {
      throw new Error("安装包下载地址或校验值无效。");
    }
  }
}

async function fetchVerifiedPart(
  part: ManifestPart,
  partIndex: number,
  onBytesReceived: (byteCount: number) => void
): Promise<ArrayBuffer> {
  const response = await fetch(resolvePartUrl(part.url, partIndex));
  if (!response.ok) throw new Error(`安装包下载请求失败（HTTP ${response.status}）。`);
  const bytes = await readResponseBytes(response, part.size, onBytesReceived);
  const hash = await sha256(bytes);
  if (hash !== part.sha256) throw new Error("安装包数据完整性校验失败。");
  return bytes;
}

function resolvePartUrl(partUrl: string, partIndex: number) {
  const currentHostIndex = DOWNLOAD_MIRROR_HOSTS.indexOf(
    window.location.hostname.toLowerCase() as typeof DOWNLOAD_MIRROR_HOSTS[number]
  );
  if (currentHostIndex === -1) return partUrl;

  const targetHost = DOWNLOAD_MIRROR_HOSTS[(currentHostIndex + partIndex) % DOWNLOAD_MIRROR_HOSTS.length];
  return new URL(partUrl, `https://${targetHost}`).toString();
}

async function readResponseBytes(
  response: Response,
  expectedSize: number,
  onBytesReceived: (byteCount: number) => void
) {
  if (!response.body) {
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== expectedSize) throw new Error("安装包数据大小校验失败。");
    onBytesReceived(bytes.byteLength);
    return bytes;
  }

  const buffer = new ArrayBuffer(expectedSize);
  const bytes = new Uint8Array(buffer);
  const reader = response.body.getReader();
  let offset = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (offset + value.byteLength > expectedSize) {
      await reader.cancel();
      throw new Error("安装包数据大小校验失败。");
    }
    bytes.set(value, offset);
    offset += value.byteLength;
    onBytesReceived(value.byteLength);
  }

  if (offset !== expectedSize) throw new Error("安装包数据大小校验失败。");
  return buffer;
}

async function downloadPartsInOrder(
  parts: ManifestPart[],
  writable: WritableFile,
  totalSize: number,
  onPartDownloaded: (downloadedBytes: number) => void
) {
  let nextPartIndex = 0;
  let receivedBytes = 0;
  let lastReportedBytes = 0;
  let workerError: unknown = null;
  let wakeWriter: (() => void) | null = null;
  const completedParts = new Map<number, ArrayBuffer>();

  async function worker() {
    while (!workerError) {
      const partIndex = nextPartIndex++;
      if (partIndex >= parts.length) return;

      try {
        const bytes = await fetchVerifiedPart(parts[partIndex], partIndex, (byteCount) => {
          receivedBytes += byteCount;
          if (receivedBytes - lastReportedBytes >= PROGRESS_UPDATE_BYTES || receivedBytes === totalSize) {
            lastReportedBytes = receivedBytes;
            onPartDownloaded(receivedBytes);
          }
        });
        completedParts.set(partIndex, bytes);
        wakeWriter?.();
        wakeWriter = null;
      } catch (error) {
        workerError = error;
        wakeWriter?.();
        wakeWriter = null;
        return;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(DOWNLOAD_CONCURRENCY, parts.length) },
    () => worker()
  );

  for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
    while (!completedParts.has(partIndex) && !workerError) {
      await new Promise<void>((resolve) => {
        wakeWriter = resolve;
      });
    }
    if (workerError) throw workerError;

    const bytes = completedParts.get(partIndex);
    if (!bytes) throw new Error("安装包分片下载结果不完整。");
    completedParts.delete(partIndex);
    await writable.write(bytes);
  }

  await Promise.all(workers);
  if (receivedBytes !== totalSize) {
    throw new Error("下载后的文件大小与发布记录不一致。");
  }
}

async function sha256(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}
