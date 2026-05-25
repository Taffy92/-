"use client";

import { useEffect, useId, useRef } from "react";
import { PlaceholderAdSlot } from "./PlaceholderAdSlot";

export interface BaiduAdSlotProps {
  enabled?: boolean;
  slot: string;
  className?: string;
}

export function BaiduAdSlot({ enabled = false, slot, className = "" }: BaiduAdSlotProps) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !slot || process.env.NODE_ENV !== "production" || !ref.current) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://cpro.baidustatic.com/cpro/ui/cm.js`;
    script.dataset.slot = slot;
    ref.current.appendChild(script);
    return () => {
      script.remove();
    };
  }, [enabled, slot]);

  if (!enabled || !slot || process.env.NODE_ENV !== "production") {
    return <PlaceholderAdSlot className={className} label="百度广告位" />;
  }

  return <div id={`baidu-ad-${id}`} ref={ref} className={`min-h-[100px] w-full rounded-2xl bg-white ${className}`} />;
}
