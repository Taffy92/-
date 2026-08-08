export type LocalCleanup = () => void | Promise<void>;

type ResourceScopeOptions = Readonly<{
  revokeObjectURL?: (url: string) => void;
}>;

export type ConversionResourceScope = {
  trackObjectUrl(url: string): string;
  releaseObjectUrl(url: string): void;
  createAbortController(): AbortController;
  trackLocalCleanup(cleanup: LocalCleanup): void;
  cleanup(): Promise<void>;
};

export function createConversionResourceScope(
  options: ResourceScopeOptions = {}
): ConversionResourceScope {
  const objectUrls = new Set<string>();
  const abortControllers = new Set<AbortController>();
  const localCleanups = new Set<LocalCleanup>();
  const revokeObjectURL = options.revokeObjectURL ?? URL.revokeObjectURL.bind(URL);
  let cleaned = false;

  function releaseObjectUrl(url: string) {
    if (!objectUrls.delete(url)) return;
    revokeObjectURL(url);
  }

  return {
    trackObjectUrl(url) {
      if (cleaned) {
        revokeObjectURL(url);
        return url;
      }
      objectUrls.add(url);
      return url;
    },
    releaseObjectUrl,
    createAbortController() {
      const controller = new AbortController();
      if (cleaned) controller.abort();
      else abortControllers.add(controller);
      return controller;
    },
    trackLocalCleanup(cleanup) {
      if (!cleaned) localCleanups.add(cleanup);
    },
    async cleanup() {
      if (cleaned) return;
      cleaned = true;

      for (const controller of abortControllers) controller.abort();
      abortControllers.clear();

      for (const url of objectUrls) revokeObjectURL(url);
      objectUrls.clear();

      const pending = Array.from(localCleanups, (cleanup) => Promise.resolve().then(cleanup));
      localCleanups.clear();
      await Promise.allSettled(pending);
    }
  };
}
