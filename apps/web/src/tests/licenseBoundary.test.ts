import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");

function readProjectFile(...parts: string[]) {
  return readFileSync(resolve(projectRoot, ...parts), "utf8");
}

describe("offline license boundary", () => {
  it("registers desktop license commands in Tauri only", () => {
    const mainSource = readProjectFile("apps", "desktop", "src-tauri", "src", "main.rs");
    const licenseSource = readProjectFile("apps", "desktop", "src-tauri", "src", "license.rs");
    const cargoSource = readProjectFile("apps", "desktop", "src-tauri", "Cargo.toml");

    expect(mainSource).toContain("mod license;");
    expect(mainSource).toContain("license::get_license_status");
    expect(mainSource).toContain("license::activate_license_code");
    expect(mainSource).toContain("license::activate_license_file_content");
    expect(mainSource).toContain("license::create_activation_request");
    expect(licenseSource).toContain("UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO");
    expect(licenseSource).toContain("PUBLIC_KEY_RAW_B64");
    expect(licenseSource).not.toContain("PRIVATE_KEY");
    expect(cargoSource).toContain("ed25519-dalek");
  });

  it("keeps admin generator and private keys out of customer bundle inputs", () => {
    const tauriConfig = JSON.parse(readProjectFile("apps", "desktop", "src-tauri", "tauri.conf.json"));
    const gitignore = readProjectFile(".gitignore");
    const desktopBuildScript = readProjectFile("apps", "web", "scripts", "build-desktop.mjs");

    expect(tauriConfig.tauri.bundle.resources).toEqual(["resources/ffmpeg"]);
    expect(JSON.stringify(tauriConfig)).not.toContain("admin-license-generator");
    expect(JSON.stringify(tauriConfig)).not.toContain("private_key.pem");
    expect(desktopBuildScript).not.toContain("admin-license-generator");
    expect(desktopBuildScript).not.toContain("private_key.pem");
    expect(gitignore).toContain("tools/admin-license-generator/keys/");
    expect(gitignore).toContain("tools/admin-license-generator/license_records.json");
  });

  it("keeps the license gate desktop-only and leaves online tabs unchanged", () => {
    const toolsSource = readProjectFile("apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const gateSource = readProjectFile("apps", "web", "src", "components", "tools", "LicenseGate.tsx");

    const tabBlock = toolsSource.slice(toolsSource.indexOf("const webTabs"), toolsSource.indexOf("const aspectOptions"));
    expect(tabBlock).toContain('id: "video-convert"');
    expect(tabBlock).toContain('id: "audio-convert"');
    expect(tabBlock).toContain('id: "video-audio"');
    expect(tabBlock).not.toContain("LicenseGate");
    expect(toolsSource).not.toContain('import { LicenseGate }');
    expect(toolsSource).not.toContain('import { getDesktopLicenseStatus, hasDesktopLicenseApi }');
    expect(toolsSource).toContain('process.env.NEXT_PUBLIC_APP_MODE === "desktop"');
    expect(toolsSource).toContain('import("@/components/tools/LicenseGate")');
    expect(toolsSource).toContain('import("@/lib/desktopLicense")');
    expect(toolsSource).toContain("isDesktopSurface && desktopLicenseStatus && !desktopLicenseStatus.allowed");
    expect(toolsSource).toContain("await ensureDesktopLicenseAllowed()");
    expect(gateSource).toContain("activation_request.mrx");
    expect(gateSource).toContain("license.mrx");
  });
});
