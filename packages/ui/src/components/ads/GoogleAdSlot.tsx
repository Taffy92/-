"use client";

import { useEffect } from "react";
import { PlaceholderAdSlot } from "./PlaceholderAdSlot";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export interface GoogleAdSlotProps {
  client: string;
  slot: string;
  className?: string;
}

export function GoogleAdSlot({ client, slot, className = "" }: GoogleAdSlotProps) {
  useEffect(() => {
    if (!client || !slot || process.env.NODE_ENV !== "production") return;
    const scriptId = "google-adsense-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
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
