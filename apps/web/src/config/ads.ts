import { isDesktopApp } from "@/config/appMode";

const activeProvider = (process.env.NEXT_PUBLIC_ADS_PROVIDER || "baidu") as
  | "baidu"
  | "placeholder"
  | "none";

export const adsConfig = {
  enabled: !isDesktopApp && process.env.NEXT_PUBLIC_ADS_ENABLED !== "false",
  provider: activeProvider,
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
