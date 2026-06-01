"use client";

import { useEffect, useId, useRef } from "react";
import { PlaceholderAdSlot } from "./PlaceholderAdSlot";

export type AdProvider = "google" | "baidu" | "placeholder" | "none";
export type AdSlotName = "toolBottom" | "homeMiddle" | "downloadBottom" | "tutorialBottom";

export interface AdsRuntimeConfig {
  enabled: boolean;
  provider: AdProvider;
  google: {
    client: string;
    slots: Record<AdSlotName, string>;
  };
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

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ config, name, className = "" }: AdSlotProps) {
  if (process.env.NEXT_PUBLIC_APP_MODE === "desktop") return null;
  if (!config.enabled || config.provider === "none") return null;
  if (config.provider === "google") {
    return <GoogleAdSlot client={config.google.client} slot={config.google.slots[name]} className={className} />;
  }
  if (config.provider === "baidu") {
    return <BaiduAdSlot enabled={config.baidu.enabled} slot={config.baidu.slots[name]} className={className} />;
  }
  return <PlaceholderAdSlot className={className} />;
}

function GoogleAdSlot({ client, slot, className = "" }: { client: string; slot: string; className?: string }) {
  useEffect(() => {
    if (!client || !slot || process.env.NODE_ENV !== "production") return;
    const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = scriptSrc;
      document.head.appendChild(script);
    }
    window.adsbygoogle = window.adsbygoogle || [];
    window.setTimeout(() => {
      try {
        window.adsbygoogle?.push({});
      } catch {
        // Ad blockers can block the script. The slot layout remains stable.
      }
    }, 300);
  }, [client, slot]);

  if (!client || !slot || process.env.NODE_ENV !== "production") {
    return <PlaceholderAdSlot className={className} label="Google AdSense 广告位" />;
  }

  return (
    <ins
      className={`adsbygoogle block min-h-[100px] w-full overflow-hidden rounded-sm bg-white ${className}`}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
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

  if (!enabled || !slot || process.env.NODE_ENV !== "production") {
    return <PlaceholderAdSlot className={className} label="百度广告位" />;
  }

  return <div id={`baidu-ad-${id}`} ref={ref} className={`min-h-[100px] w-full rounded-sm bg-white ${className}`} />;
}
