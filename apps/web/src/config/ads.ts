import { isDesktopApp } from "@/config/appMode";

export const adsConfig = {
  enabled: !isDesktopApp && process.env.NEXT_PUBLIC_ADS_ENABLED !== "false",
  provider: (process.env.NEXT_PUBLIC_ADS_PROVIDER || "placeholder") as "google" | "baidu" | "placeholder" | "none",
  google: {
    client: process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT || "",
    slots: {
      toolBottom: process.env.NEXT_PUBLIC_GOOGLE_AD_TOOL_BOTTOM || "",
      homeMiddle: process.env.NEXT_PUBLIC_GOOGLE_AD_HOME_MIDDLE || "",
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
