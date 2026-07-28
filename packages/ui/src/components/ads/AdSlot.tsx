"use client";

import { useEffect, useId, useRef } from "react";
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
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !slot || process.env.NODE_ENV !== "production" || !ref.current) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://cpro.baidustatic.com/cpro/ui/cm.js";
    script.dataset.slot = slot;
    ref.current.appendChild(script);
    return () => {
      script.remove();
    };
  }, [enabled, slot]);

  if (process.env.NODE_ENV !== "production") {
    return <PlaceholderAdSlot className={className} label="百度广告位" />;
  }
  if (!enabled || !slot) return null;

  return <div id={`baidu-ad-${id}`} ref={ref} className={`min-h-[100px] w-full rounded-sm bg-white ${className}`} />;
}
