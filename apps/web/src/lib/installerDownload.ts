export type InstallerManifestPart = {
  url: string;
  size: number;
  sha256: string;
};

type WritableTarget = {
  write(data: ArrayBuffer): Promise<void>;
};

type DownloadInstallerPartsOptions = {
  parts: InstallerManifestPart[];
  writable: WritableTarget;
  totalSize: number;
  baseUrl: string;
  signal: AbortSignal;
  onProgress(downloadedBytes: number): void;
  onRetry(partIndex: number, nextAttempt: number, maxAttempts: number, reason: string): void;
};

export const DOWNLOAD_CONCURRENCY = 3;
export const PART_STALL_TIMEOUT_MS = 20_000;
export const PART_RETRY_DELAYS_MS = [1_000, 3_000] as const;

const PROGRESS_UPDATE_BYTES = 1024 * 1024;

export async function downloadInstallerParts({
  parts,
  writable,
  totalSize,
  baseUrl,
  signal,
  onProgress,
  onRetry
}: DownloadInstallerPartsOptions) {
  const partProgress = new Array<number>(parts.length).fill(0);
  let lastReportedBytes = 0;

  function updateProgress(partIndex: number, receivedBytes: number) {
    partProgress[partIndex] = receivedBytes;
    const totalReceived = partProgress.reduce((total, value) => total + value, 0);
    if (
      Math.abs(totalReceived - lastReportedBytes) >= PROGRESS_UPDATE_BYTES ||
      totalReceived === totalSize ||
      receivedBytes === 0
    ) {
      lastReportedBytes = totalReceived;
      onProgress(totalReceived);
    }
  }

  for (let batchStart = 0; batchStart < parts.length; batchStart += DOWNLOAD_CONCURRENCY) {
    throwIfAborted(signal);
    const batch = parts.slice(batchStart, batchStart + DOWNLOAD_CONCURRENCY);
    const batchController = new AbortController();
    const abortBatch = () => batchController.abort(signal.reason);
    if (signal.aborted) abortBatch();
    else signal.addEventListener("abort", abortBatch, { once: true });

    try {
      const buffers = await Promise.all(batch.map(async (part, batchIndex) => {
        const partIndex = batchStart + batchIndex;
        try {
          return await fetchVerifiedPart(
            part,
            partIndex,
            baseUrl,
            batchController.signal,
            (receivedBytes) => updateProgress(partIndex, receivedBytes),
            onRetry
          );
        } catch (error) {
          if (!batchController.signal.aborted) batchController.abort(error);
          throw error;
        }
      }));

      for (const bytes of buffers) {
        await writable.write(bytes);
      }
    } finally {
      signal.removeEventListener("abort", abortBatch);
    }
  }

  const receivedBytes = partProgress.reduce((total, value) => total + value, 0);
  if (receivedBytes !== totalSize) {
    throw new Error("下载后的文件大小与发布记录不一致。");
  }
}

async function fetchVerifiedPart(
  part: InstallerManifestPart,
  partIndex: number,
  baseUrl: string,
  signal: AbortSignal,
  onBytesReceived: (receivedBytes: number) => void,
  onRetry: DownloadInstallerPartsOptions["onRetry"]
) {
  const maxAttempts = PART_RETRY_DELAYS_MS.length + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    throwIfAborted(signal);
    const watchdog = createStallWatchdog(signal);
    try {
      const response = await fetch(new URL(part.url, baseUrl), {
        cache: "no-store",
        signal: watchdog.signal
      });
      watchdog.refresh();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const bytes = await readResponseBytes(response, part.size, (byteCount) => {
        watchdog.refresh();
        onBytesReceived(byteCount);
      });
      const hash = await sha256(bytes);
      if (hash !== part.sha256) throw new Error("数据完整性校验失败");
      return bytes;
    } catch (error) {
      if (signal.aborted) throw abortReason(signal);
      lastError = watchdog.didStall()
        ? new Error(`${PART_STALL_TIMEOUT_MS / 1000} 秒未收到数据`)
        : error;
    } finally {
      watchdog.dispose();
    }

    onBytesReceived(0);
    if (attempt === maxAttempts) break;
    const retryReason = lastError instanceof Error ? lastError.message : "网络连接异常";
    onRetry(partIndex, attempt + 1, maxAttempts, retryReason);
    await abortableDelay(PART_RETRY_DELAYS_MS[attempt - 1], signal);
  }

  const reason = lastError instanceof Error ? lastError.message : "未知网络错误";
  throw new Error(`分片 ${partIndex + 1} 下载失败，已自动重试 ${maxAttempts - 1} 次：${reason}`);
}

function createStallWatchdog(parentSignal: AbortSignal) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let stalled = false;
  const abortFromParent = () => controller.abort(parentSignal.reason);
  if (parentSignal.aborted) abortFromParent();
  else parentSignal.addEventListener("abort", abortFromParent, { once: true });

  function refresh() {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      stalled = true;
      controller.abort();
    }, PART_STALL_TIMEOUT_MS);
  }

  refresh();
  return {
    signal: controller.signal,
    refresh,
    didStall: () => stalled,
    dispose() {
      if (timeoutId !== null) clearTimeout(timeoutId);
      parentSignal.removeEventListener("abort", abortFromParent);
    }
  };
}

async function readResponseBytes(
  response: Response,
  expectedSize: number,
  onBytesReceived: (receivedBytes: number) => void
) {
  if (!response.body) {
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== expectedSize) throw new Error("数据大小校验失败");
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
      throw new Error("数据大小校验失败");
    }
    bytes.set(value, offset);
    offset += value.byteLength;
    onBytesReceived(offset);
  }

  if (offset !== expectedSize) throw new Error("数据大小校验失败");
  return buffer;
}

function abortableDelay(durationMs: number, signal: AbortSignal) {
  if (signal.aborted) return Promise.reject(abortReason(signal));
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal.removeEventListener("abort", abortDelay);
      resolve();
    }, durationMs);
    const abortDelay = () => {
      clearTimeout(timeoutId);
      reject(abortReason(signal));
    };
    signal.addEventListener("abort", abortDelay, { once: true });
  });
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw abortReason(signal);
}

function abortReason(signal: AbortSignal) {
  return signal.reason instanceof Error
    ? signal.reason
    : new DOMException("已取消下载", "AbortError");
}

async function sha256(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}
