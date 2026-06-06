import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd(), "..", "..");
const tauriConfigPath = resolve(projectRoot, "apps", "desktop", "src-tauri", "tauri.conf.json");

function readTauriConfig() {
  return JSON.parse(readFileSync(tauriConfigPath, "utf8"));
}

describe("Tauri permission hardening", () => {
  it("uses explicit dialog and fs permissions instead of all access", () => {
    const config = readTauriConfig();
    const allowlist = config.tauri.allowlist;

    expect(allowlist.dialog.all).toBe(false);
    expect(allowlist.dialog.open).toBe(true);
    expect(allowlist.dialog.save).toBe(true);
    expect(allowlist.dialog.message).toBe(true);
    expect(allowlist.dialog.confirm).toBe(true);
    expect(allowlist.dialog.ask).toBe(true);

    expect(allowlist.fs.all).toBe(false);
    expect(allowlist.fs.readFile).toBe(true);
    expect(allowlist.fs.readDir).toBe(true);
    expect(allowlist.fs.writeFile).toBe(true);
    expect(allowlist.fs.exists).toBe(true);
    expect(allowlist.fs.createDir).toBe(true);
    expect(allowlist.fs.copyFile).toBe(false);
    expect(allowlist.fs.removeFile).toBe(false);
    expect(allowlist.fs.removeDir).toBe(false);
    expect(allowlist.fs.renameFile).toBe(false);
  });

  it("keeps fs scope bounded to user and project directories", () => {
    const config = readTauriConfig();
    const scope: string[] = config.tauri.allowlist.fs.scope;

    expect(scope).not.toContain("C:/**");
    expect(scope).not.toContain("**");
    expect(scope).toEqual(
      expect.arrayContaining([
        "$HOME/**",
        "$DESKTOP/**",
        "$DOCUMENT/**",
        "$DOWNLOAD/**",
        "$PICTURE/**",
        "$VIDEO/**",
        "$AUDIO/**",
        "D:/**"
      ])
    );
  });

  it("keeps shell, path, process, updater and WebView2 install behavior stable", () => {
    const config = readTauriConfig();
    const allowlist = config.tauri.allowlist;

    expect(config.build.withGlobalTauri).toBe(true);
    expect(allowlist.path.all).toBe(true);
    expect(allowlist.shell.all).toBe(false);
    expect(allowlist.shell.open).toBe(true);
    expect(allowlist.process.all).toBe(false);
    expect(allowlist.process.exit).toBe(false);
    expect(allowlist.process.relaunch).toBe(false);
    expect(config.tauri.updater.active).toBe(false);
    expect(config.tauri.bundle.windows.webviewInstallMode).toMatchObject({
      type: "offlineInstaller",
      silent: true
    });
  });

  it("allows local blob media previews in the desktop WebView CSP", () => {
    const config = readTauriConfig();
    const csp: string = config.tauri.security.csp;

    expect(csp).toContain("media-src");
    expect(csp).toContain("media-src 'self' blob: data:");
  });
});
