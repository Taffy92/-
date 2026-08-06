import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");

function readProjectFile(...parts: string[]) {
  return readFileSync(resolve(projectRoot, ...parts), "utf8");
}

describe("offline LibreOffice integration", () => {
  it("bundles a reproducible, version-pinned runtime resource", () => {
    const config = JSON.parse(readProjectFile("apps", "desktop", "src-tauri", "tauri.conf.json"));
    const manifest = JSON.parse(readProjectFile("apps", "desktop", "src-tauri", "resources", "libreoffice", "manifest.json"));
    const prepareScript = readProjectFile("scripts", "prepare-libreoffice.mjs");

    expect(config.tauri.bundle.resources).toContain("resources/libreoffice");
    expect(config.tauri.bundle.targets).toEqual(["msi"]);
    expect(manifest.component).toBe("LibreOffice");
    expect(manifest.version).toBe("26.2.5");
    expect(prepareScript).toContain("download.documentfoundation.org/libreoffice/stable/${version}");
    expect(prepareScript).toContain("msiexec.exe");
    expect(existsSync(resolve(projectRoot, "apps", "desktop", "src-tauri", "resources", "libreoffice", "README.md"))).toBe(true);
  });

  it("routes desktop Word and Excel rendering through the native command while retaining the web WASM path", () => {
    const toolsSource = readProjectFile("apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const rustSource = readProjectFile("apps", "desktop", "src-tauri", "src", "libreoffice.rs");
    const mainSource = readProjectFile("apps", "desktop", "src-tauri", "src", "main.rs");

    expect(toolsSource).toContain('invokeTauri<NativeOfficePdfResult>("convert_office_to_pdf"');
    expect(toolsSource).toContain("preferNative = false");
    expect(toolsSource).toContain("renderDocxToImagePages(source");
    expect(toolsSource).toContain("renderExcelToImagePages(source");
    expect(toolsSource).toContain('backend: isDesktopSurface ? "libreoffice" : "wasm"');
    expect(rustSource).toContain("resolve_libreoffice_file(&app, \"program/soffice.com\")");
    expect(rustSource).toContain("cleanup_office_conversion");
    expect(rustSource).toContain("SUPPORTED_EXTENSIONS");
    expect(rustSource).not.toContain("Command::new(\"cmd\"");
    expect(mainSource).toContain("libreoffice::convert_office_to_pdf");
  });
});
