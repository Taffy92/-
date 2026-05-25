"use client";

import { BaiduAdSlot } from "./BaiduAdSlot";
import { GoogleAdSlot } from "./GoogleAdSlot";
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

export function AdSlot({ config, name, className = "" }: AdSlotProps) {
  if (!config.enabled || config.provider === "none") return null;
  if (config.provider === "google") {
    return <GoogleAdSlot client={config.google.client} slot={config.google.slots[name]} className={className} />;
  }
  if (config.provider === "baidu") {
    return <BaiduAdSlot enabled={config.baidu.enabled} slot={config.baidu.slots[name]} className={className} />;
  }
  return <PlaceholderAdSlot className={className} />;
}
