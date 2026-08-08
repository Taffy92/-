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

    expect(tauriConfig.tauri.bundle.resources).toEqual(["resources/ffmpeg", "resources/libreoffice"]);
    expect(JSON.stringify(tauriConfig)).not.toContain("admin-license-generator");
    expect(JSON.stringify(tauriConfig)).not.toContain("private_key.pem");
    expect(desktopBuildScript).not.toContain("admin-license-generator");
    expect(desktopBuildScript).not.toContain("private_key.pem");
    expect(gitignore).toContain("tools/admin-license-generator/keys/");
    expect(gitignore).toContain("tools/admin-license-generator/license_records.json");
  });

  it("checks license status without visible helper consoles or writable machine-id caches", () => {
    const licenseSource = readProjectFile("apps", "desktop", "src-tauri", "src", "license.rs");

    expect(licenseSource).toContain("CREATE_NO_WINDOW");
    expect(licenseSource).toContain("hidden_command_output(\"wmic\"");
    expect(licenseSource).toContain("static MACHINE_ID: OnceLock<String>");
    expect(licenseSource).toContain("MACHINE_ID.get_or_init(compute_machine_id)");
    expect(licenseSource).not.toContain("machine.id");
    expect(licenseSource).not.toContain("REGISTRY_MACHINE_ID_VALUE");
  });

  it("keeps the license gate desktop-only and leaves online tabs unchanged", () => {
    const toolsSource = readProjectFile("apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const localToolsSource = readProjectFile("apps", "web", "src", "components", "tools", "LocalToolsClient.tsx");
    const localToolControllerSource = readProjectFile("apps", "web", "src", "components", "tools", "useLocalToolController.ts");
    const gateSource = readProjectFile("apps", "web", "src", "components", "tools", "LicenseGate.tsx");

    const tabBlock = toolsSource.slice(toolsSource.indexOf("const webTabs"), toolsSource.indexOf("const desktopTabs"));
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
    expect(localToolsSource).toContain('process.env.NEXT_PUBLIC_APP_MODE === "desktop"');
    expect(localToolsSource).toContain('import("@/components/tools/LicenseGate")');
    expect(localToolsSource).toContain('import("@/lib/desktopLicense")');
    expect(localToolsSource).toContain("const nextStatus = await api.getDesktopLicenseStatus()");
    expect(localToolControllerSource).toContain("if (!nextStatus.allowed) throw new Error");
    expect(localToolsSource).toContain("desktop && desktopLicenseStatus && !desktopLicenseStatus.allowed");
    expect(gateSource).toContain("activation_request.mrx");
    expect(gateSource).toContain("license.mrx");
  });

  it("does not re-check the license when downloading an already generated result", () => {
    const toolsSource = readProjectFile("apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const runTaskBlock = toolsSource.slice(toolsSource.indexOf("async function runCurrentTask()"), toolsSource.indexOf("async function runCrop()"));
    const downloadBlock = toolsSource.slice(toolsSource.indexOf("async function handleDownload()"), toolsSource.indexOf("async function openLocalPath("));

    expect(runTaskBlock).toContain("await ensureDesktopLicenseAllowed()");
    expect(downloadBlock).not.toContain("ensureDesktopLicenseAllowed");
    expect(downloadBlock).toContain("结果已保存");
  });

  it("keeps background authorization checks from replacing the workbench during tool switches", () => {
    const toolsSource = readProjectFile("apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const localToolsSource = readProjectFile("apps", "web", "src", "components", "tools", "LocalToolsClient.tsx");
    const localToolControllerSource = readProjectFile("apps", "web", "src", "components", "tools", "useLocalToolController.ts");
    const catalogSource = readProjectFile("apps", "web", "src", "components", "tools", "UnifiedToolCatalog.tsx");
    const licenseSource = readProjectFile("apps", "web", "src", "lib", "desktopLicense.ts");

    expect(toolsSource).not.toContain("desktopLicenseLoading");
    expect(localToolsSource).not.toContain("desktopLicenseLoading");
    expect(toolsSource).not.toContain("正在检查授权状态");
    expect(localToolsSource).not.toContain("正在检查授权状态");
    expect(catalogSource).toContain('import Link from "next/link"');
    expect(licenseSource).toContain("cachedLicenseStatus");
    expect(licenseSource).toContain("licenseStatusRequest");
    expect(toolsSource).toContain("getDesktopLicenseStatus({ force: true })");
    expect(localToolControllerSource).toContain("getDesktopLicenseStatus({ force: true })");
  });

  it("documents the complete offline activation flow in the install guide", () => {
    const installGuide = readProjectFile(
      "apps",
      "web",
      "..",
      "..",
      "release",
      "v2.0.0",
      "docs",
      "INSTALL_GUIDE.md"
    );

    expect(installGuide).toContain("3 天试用");
    expect(installGuide).toContain("机器码");
    expect(installGuide).toContain("激活码");
    expect(installGuide).toContain("license.mrx");
  });
});
