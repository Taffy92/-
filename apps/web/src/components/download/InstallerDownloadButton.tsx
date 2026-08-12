"use client";

import { useRef, useState } from "react";
import {
  downloadInstallerParts,
  type InstallerManifestPart
} from "@/lib/installerDownload";

type PackageType = "zip";

type ManifestPackage = {
  fileName: string;
  size: number;
  sha256: string;
  contentType: string;
  parts: InstallerManifestPart[];
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
  getFile(): Promise<{ size: number }>;
};

type SaveFilePicker = (options: {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<SaveFileHandle>;

const MANIFEST_TIMEOUT_MS = 15_000;

type Props = {
  packageType: PackageType;
  fileName: string;
  manifestUrl: string;
  label: string;
  detail?: string;
};

export default function InstallerDownloadButton({
  packageType,
  fileName,
  manifestUrl,
  label,
  detail
}: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const activeDownload = useRef<AbortController | null>(null);
  const downloading = progress !== null && progress < 100;

  async function startDownload() {
    if (downloading) return;

    const downloadController = new AbortController();
    activeDownload.current = downloadController;
    setProgress(0);
    setMessage("正在准备下载…");

    let writable: WritableFile | null = null;
    let saveHandle: SaveFileHandle | null = null;
    try {
      const manifest = await loadManifest(manifestUrl, downloadController.signal);
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

      await downloadInstallerParts({
        parts: packageInfo.parts,
        writable,
        totalSize: packageInfo.size,
        baseUrl: window.location.origin,
        signal: downloadController.signal,
        onProgress(downloadedBytes) {
          const totalProgress = Math.min(99, Math.round((downloadedBytes / packageInfo.size) * 100));
          setProgress(totalProgress);
          setMessage(`正在下载并逐片校验安装包，已处理 ${totalProgress}%…`);
        },
        onRetry(partIndex, nextAttempt, maxAttempts, reason) {
          setMessage(`分片 ${partIndex + 1}/${packageInfo.parts.length} 下载未完成（${reason}），正在自动重试（${nextAttempt}/${maxAttempts}）…`);
        }
      });

      await writable.close();
      writable = null;

      setMessage("正在确认已保存文件…");
      const savedFile = await saveHandle.getFile();
      if (savedFile.size !== packageInfo.size) {
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
    } finally {
      if (activeDownload.current === downloadController) activeDownload.current = null;
    }
  }

  function cancelDownload() {
    setMessage("正在取消下载…");
    activeDownload.current?.abort();
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={downloading ? cancelDownload : startDownload}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-cyan-300/50 bg-cyan-400 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
      >
        {downloading ? `取消下载（${progress}%）` : label}
      </button>
      {detail ? <p className="mt-2 text-xs leading-5 text-cyan-100">{detail}</p> : null}
      <DownloadProgress progress={progress} message={message} />
    </div>
  );
}

function DownloadProgress({ progress, message }: { progress: number | null; message: string }) {
  if (!message) return null;

  return (
    <div className="mt-3" aria-live="polite">
      {progress !== null ? (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-label="安装包下载进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
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

async function loadManifest(url: string, signal: AbortSignal): Promise<DownloadManifest> {
  const controller = new AbortController();
  let timedOut = false;
  const abortManifest = () => controller.abort(signal.reason);
  if (signal.aborted) abortManifest();
  else signal.addEventListener("abort", abortManifest, { once: true });
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, MANIFEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`下载清单不可用（HTTP ${response.status}）。`);
    const manifest = await response.json() as DownloadManifest;
    if (manifest.version !== 1 || !manifest.packages?.zip || Object.keys(manifest.packages).some((key) => key !== "zip")) {
      throw new Error("下载清单格式无效。");
    }
    return manifest;
  } catch (error) {
    if (timedOut) throw new Error("下载清单连接超时，请检查网络后重试。");
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener("abort", abortManifest);
  }
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
  if (!Number.isSafeInteger(packageInfo.size) || packageInfo.size <= 0 || !Array.isArray(packageInfo.parts) || packageInfo.parts.length === 0) {
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
