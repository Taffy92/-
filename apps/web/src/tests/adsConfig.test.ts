import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..", "..", "..", "..");
const adsConfigPath = resolve(projectRoot, "apps", "web", "src", "config", "ads.ts");
const homePagePath = resolve(projectRoot, "apps", "web", "src", "app", "page.tsx");
const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
const adSlotPath = resolve(projectRoot, "packages", "ui", "src", "components", "ads", "AdSlot.tsx");
const edgeOneConfigPath = resolve(projectRoot, "edgeone.json");
const rootVercelConfigPath = resolve(projectRoot, "vercel.json");
const appVercelConfigPath = resolve(projectRoot, "apps", "web", "vercel.json");
const adsConfigSource = readFileSync(adsConfigPath, "utf8");
const homePageSource = readFileSync(homePagePath, "utf8");
const toolsClientSource = readFileSync(toolsClientPath, "utf8");
const adSlotSource = readFileSync(adSlotPath, "utf8");
const deploymentConfigSources = [
  readFileSync(edgeOneConfigPath, "utf8"),
  readFileSync(rootVercelConfigPath, "utf8"),
  readFileSync(appVercelConfigPath, "utf8")
];

describe("adsConfig", () => {
  it("does not switch the initial ad provider from the browser hostname", () => {
    expect(adsConfigSource).not.toContain("window.location.hostname");
    expect(adsConfigSource).not.toContain('typeof window !== "undefined"');
    expect(adsConfigSource).toContain('process.env.NEXT_PUBLIC_ADS_PROVIDER || "baidu"');
    expect(adsConfigSource).not.toContain("GOOGLE_AD");
  });

  it("renders the configured homepage slot on the landing page", () => {
    expect(homePageSource).toContain('<AdSlot config={adsConfig} name="homeMiddle" className="v2-home-ad-slot" />');
  });

  it("does not render the tool page ad slot in the online tools panel", () => {
    expect(toolsClientSource).not.toContain('<AdSlot config={adsConfig} name="toolBottom" />');
  });

  it("runs third-party ad code in a sandbox without parent-document access", () => {
    expect(adSlotSource).toContain('sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"');
    expect(adSlotSource).not.toContain("allow-same-origin");
    expect(adSlotSource).toContain("srcDoc={source}");
    expect(adSlotSource).not.toContain('document.createElement("script")');
  });

  it("keeps every deployment policy free of retired Google ad domains", () => {
    for (const source of deploymentConfigSources) {
      expect(source).not.toMatch(/googlesyndication|doubleclick|pagead2\.google/i);
    }

    expect(deploymentConfigSources[0]).toContain("/release/v2.0.0/edgeone-v24/*");
    expect(deploymentConfigSources[0]).not.toContain("/release/v1.0.0/edgeone/*");
  });
});
