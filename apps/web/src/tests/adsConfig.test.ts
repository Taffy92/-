import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..", "..", "..", "..");
const adsConfigPath = resolve(projectRoot, "apps", "web", "src", "config", "ads.ts");
const homePagePath = resolve(projectRoot, "apps", "web", "src", "app", "page.tsx");
const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
const adsConfigSource = readFileSync(adsConfigPath, "utf8");
const homePageSource = readFileSync(homePagePath, "utf8");
const toolsClientSource = readFileSync(toolsClientPath, "utf8");

describe("adsConfig", () => {
  it("does not switch the initial ad provider from the browser hostname", () => {
    expect(adsConfigSource).not.toContain("window.location.hostname");
    expect(adsConfigSource).not.toContain('typeof window !== "undefined"');
    expect(adsConfigSource).toContain('process.env.NEXT_PUBLIC_ADS_PROVIDER || "google"');
  });

  it("renders the configured homepage slot on the landing page", () => {
    expect(homePageSource).toContain('<AdSlot config={adsConfig} name="homeMiddle" className="apple-home-ad-slot" />');
  });

  it("does not render the tool page ad slot in the online tools panel", () => {
    expect(toolsClientSource).not.toContain('<AdSlot config={adsConfig} name="toolBottom" />');
  });
});
