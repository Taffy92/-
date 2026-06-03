import { isDesktopApp } from "@/config/appMode";

let activeProvider: "google" | "baidu" | "placeholder" | "none" = "google";

if (typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host === "gszhmrx.cn" || host === "www.gszhmrx.cn") {
    activeProvider = "baidu";
  } else if (host === "web-npyt.vercel.app" || host.includes("vercel.app")) {
    activeProvider = "google";
  } else {
    activeProvider = (process.env.NEXT_PUBLIC_ADS_PROVIDER || "google") as "google" | "baidu" | "placeholder" | "none";
  }
} else {
  activeProvider = (process.env.NEXT_PUBLIC_ADS_PROVIDER || "google") as "google" | "baidu" | "placeholder" | "none";
}

export const adsConfig = {
  enabled: !isDesktopApp && process.env.NEXT_PUBLIC_ADS_ENABLED !== "false",
  provider: activeProvider,
  google: {
    client: process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT || "ca-pub-3864852988527369",
    slots: {
      toolBottom: process.env.NEXT_PUBLIC_GOOGLE_AD_TOOL_BOTTOM || "",
      homeMiddle: process.env.NEXT_PUBLIC_GOOGLE_AD_HOME_MIDDLE || "2389342261",
      downloadBottom: process.env.NEXT_PUBLIC_GOOGLE_AD_DOWNLOAD_BOTTOM || "",
      tutorialBottom: process.env.NEXT_PUBLIC_GOOGLE_AD_TUTORIAL_BOTTOM || ""
    }
  },
  baidu: {
    enabled: process.env.NEXT_PUBLIC_BAIDU_AD_ENABLED === "true",
    slots: {
      toolBottom: process.env.NEXT_PUBLIC_BAIDU_AD_TOOL_BOTTOM || "",
      homeMiddle: process.env.NEXT_PUBLIC_BAIDU_AD_HOME_MIDDLE || "",
      downloadBottom: process.env.NEXT_PUBLIC_BAIDU_AD_DOWNLOAD_BOTTOM || "",
      tutorialBottom: process.env.NEXT_PUBLIC_BAIDU_AD_TUTORIAL_BOTTOM || ""
    }
  }
};
