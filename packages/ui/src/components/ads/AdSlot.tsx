"use client";

import { useId } from "react";
import { PlaceholderAdSlot } from "./PlaceholderAdSlot";

export type AdProvider = "baidu" | "placeholder" | "none";
export type AdSlotName = "toolBottom" | "homeMiddle" | "downloadBottom" | "tutorialBottom";

export interface AdsRuntimeConfig {
  enabled: boolean;
  provider: AdProvider;
  baidu: {
    enabled: boolean;
    slots: Record<AdSlotName, string>;
  };
}

export interface AdSlotProps {
  config: AdsRuntimeConfig;
  name: AdSlotName;
  className?: string;
}

export function AdSlot({ config, name, className = "" }: AdSlotProps) {
  if (process.env.NEXT_PUBLIC_APP_MODE === "desktop") return null;
  if (!config.enabled || config.provider === "none") return null;
  if (config.provider === "baidu") {
    return <BaiduAdSlot enabled={config.baidu.enabled} slot={config.baidu.slots[name]} className={className} />;
  }
  return <PlaceholderAdSlot className={className} />;
}

function BaiduAdSlot({ enabled = false, slot, className = "" }: { enabled?: boolean; slot: string; className?: string }) {
  const id = useId().replace(/:/g, "");

  if (process.env.NODE_ENV !== "production") {
    return <PlaceholderAdSlot className={className} label="百度广告位" />;
  }
  if (!enabled || !/^[A-Za-z0-9_-]+$/.test(slot)) return null;

  const source = `<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src https://cpro.baidustatic.com https://*.baidu.com https://*.bdstatic.com 'unsafe-inline'; style-src 'unsafe-inline' https://*.bdstatic.com; img-src data: https://*.baidu.com https://*.bdstatic.com; connect-src https://*.baidu.com https://*.bdstatic.com; frame-src https://*.baidu.com https://*.bdstatic.com"></head><body style="margin:0"><script async src="https://cpro.baidustatic.com/cpro/ui/cm.js" data-slot="${slot}"></script></body></html>`;

  return (
    <iframe
      id={`baidu-ad-${id}`}
      title="百度联盟广告"
      srcDoc={source}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      className={`min-h-[100px] w-full rounded-sm border-0 bg-white ${className}`}
    />
  );
}
