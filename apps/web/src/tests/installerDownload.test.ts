import { createHash, webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DOWNLOAD_CONCURRENCY,
  PART_RETRY_DELAYS_MS,
  PART_STALL_TIMEOUT_MS,
  downloadInstallerParts,
  type InstallerManifestPart
} from "../lib/installerDownload";

function createPart(index: number): { part: InstallerManifestPart; bytes: ArrayBuffer } {
  const bytes = Uint8Array.from([index + 1, index + 2, index + 3]).buffer;
  return {
    bytes,
    part: {
      url: `/release/test/zip/part-${index + 1}.bin`,
      size: bytes.byteLength,
      sha256: createHash("sha256").update(new Uint8Array(bytes)).digest("hex").toUpperCase()
    }
  };
}

function responseFor(bytes: ArrayBuffer) {
  return {
    ok: true,
    status: 200,
    body: null,
    arrayBuffer: async () => bytes.slice(0)
  } as unknown as Response;
}

describe("installer download recovery", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", webcrypto);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("retries a part when the connection stops returning data", async () => {
    vi.useFakeTimers();
    const { part, bytes } = createPart(0);
    const fetchMock = vi.fn((_url: string | URL, options?: RequestInit) => {
      if (fetchMock.mock.calls.length === 1) {
        return new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          }, { once: true });
        });
      }
      return Promise.resolve(responseFor(bytes));
    });
    vi.stubGlobal("fetch", fetchMock);

    const writes: ArrayBuffer[] = [];
    const retries: number[] = [];
    const progress: number[] = [];
    const task = downloadInstallerParts({
      parts: [part],
      writable: { write: async (data) => { writes.push(data); } },
      totalSize: part.size,
      baseUrl: "https://gszhmrx.cn",
      signal: new AbortController().signal,
      onProgress: (bytesReceived) => { progress.push(bytesReceived); },
      onRetry: (_partIndex, nextAttempt) => { retries.push(nextAttempt); }
    });

    await vi.advanceTimersByTimeAsync(PART_STALL_TIMEOUT_MS);
    await vi.advanceTimersByTimeAsync(PART_RETRY_DELAYS_MS[0]);
    await task;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(retries).toEqual([2]);
    expect(writes).toHaveLength(1);
    expect(new Uint8Array(writes[0])).toEqual(new Uint8Array(bytes));
    expect(Math.max(...progress)).toBe(part.size);
  });

  it("keeps parallel requests and buffered parts bounded while preserving write order", async () => {
    const fixtures = Array.from({ length: DOWNLOAD_CONCURRENCY * 2 + 1 }, (_, index) => createPart(index));
    let activeRequests = 0;
    let maximumActiveRequests = 0;
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL) => {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeRequests -= 1;
      const index = Number(new URL(url).pathname.match(/part-(\d+)\.bin$/)?.[1]) - 1;
      return responseFor(fixtures[index].bytes);
    }));

    const writes: ArrayBuffer[] = [];
    const totalSize = fixtures.reduce((total, fixture) => total + fixture.part.size, 0);
    await downloadInstallerParts({
      parts: fixtures.map((fixture) => fixture.part),
      writable: { write: async (data) => { writes.push(data); } },
      totalSize,
      baseUrl: "https://gszhmrx.cn",
      signal: new AbortController().signal,
      onProgress: () => undefined,
      onRetry: () => undefined
    });

    expect(maximumActiveRequests).toBeLessThanOrEqual(DOWNLOAD_CONCURRENCY);
    expect(writes.map((bytes) => new Uint8Array(bytes)[0])).toEqual(
      fixtures.map((fixture) => new Uint8Array(fixture.bytes)[0])
    );
  });

  it("stops before opening a network request when the user has cancelled", async () => {
    const { part } = createPart(0);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    controller.abort();

    await expect(downloadInstallerParts({
      parts: [part],
      writable: { write: async () => undefined },
      totalSize: part.size,
      baseUrl: "https://gszhmrx.cn",
      signal: controller.signal,
      onProgress: () => undefined,
      onRetry: () => undefined
    })).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
