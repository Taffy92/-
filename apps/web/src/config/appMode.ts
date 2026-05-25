export const appMode = process.env.NEXT_PUBLIC_APP_MODE === "desktop" ? "desktop" : "web";

export const isDesktopApp = appMode === "desktop";
