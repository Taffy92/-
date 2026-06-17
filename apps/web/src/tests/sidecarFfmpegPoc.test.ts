import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const repoRoot = path.join(root, "../..");
const rustMain = readFileSync(path.join(repoRoot, "apps/desktop/src-tauri/src/main.rs"), "utf8");
const sidecarSource = readFileSync(path.join(repoRoot, "apps/desktop/src-tauri/src/sidecar_ffmpeg.rs"), "utf8");
const tauriConfig = readFileSync(path.join(repoRoot, "apps/desktop/src-tauri/tauri.conf.json"), "utf8");
const webPrepareStatic = readFileSync(path.join(repoRoot, "apps/web/scripts/prepare-static.mjs"), "utf8");
const toolsClientSource = readFileSync(path.join(repoRoot, "apps/web/src/components/tools/ToolsClient.tsx"), "utf8");
const sidecarHelperSource = readFileSync(path.join(repoRoot, "apps/web/src/lib/sidecarFfmpeg.ts"), "utf8");

describe("sidecar FFmpeg backend safety boundary", () => {
  it("registers internal sidecar commands without replacing existing media flow", () => {
    expect(rustMain).toContain("check_ffmpeg_sidecar");
    expect(rustMain).toContain("get_ffmpeg_sidecar_version");
    expect(rustMain).toContain("run_ffmpeg_sidecar_poc");
    expect(sidecarSource).toContain("version-check");
    expect(sidecarSource).toContain("buildconf-check");
    expect(sidecarSource).toContain("probe-duration");
    expect(sidecarSource).toContain("convert-video-sidecar");
    expect(sidecarSource).toContain("convert-mp4-to-webm-poc");
    expect(sidecarSource).toContain("convert-wav-to-flac-poc");
    expect(sidecarSource).toContain("verify_sidecar_hashes");
    expect(sidecarSource).toContain("SHA256SUMS.txt");
  });

  it("does not allow raw command execution or shell string concatenation", () => {
    expect(sidecarSource).toContain("Command::new");
    expect(sidecarSource).toContain(".args(&built.args)");
    expect(sidecarSource).not.toContain("cmd.exe");
    expect(sidecarSource).not.toContain("powershell.exe");
    expect(sidecarSource).not.toContain("cmd /c");
    expect(sidecarSource).not.toContain("rawArgs");
    expect(sidecarSource).not.toContain("user_command");
  });

  it("keeps Tauri permissions and WebView2 offline installer unchanged", () => {
    expect(tauriConfig).toContain('"process": {');
    expect(tauriConfig).toContain('"all": false');
    expect(tauriConfig).toContain('"updater": {');
    expect(tauriConfig).toContain('"active": false');
    expect(tauriConfig).toContain('"webviewInstallMode"');
    expect(tauriConfig).toContain('"offlineInstaller"');
    expect(tauriConfig).toContain('"resources/ffmpeg"');
    expect(tauriConfig).not.toContain('"shell": {\n        "all": true');
  });

  it("keeps sidecar binaries out of online static assets", () => {
    expect(webPrepareStatic).not.toContain("ffmpeg.exe");
    expect(webPrepareStatic).not.toContain("ffprobe.exe");
    expect(existsSync(path.join(repoRoot, "apps/web/public/ffmpeg/ffmpeg.exe"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "apps/web/public/ffmpeg/ffprobe.exe"))).toBe(false);
  });

  it("bundles verified sidecar resources only for desktop", () => {
    expect(existsSync(path.join(repoRoot, "apps/desktop/src-tauri/resources/ffmpeg/README.txt"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe"))).toBe(true);
    expect(readFileSync(path.join(repoRoot, "apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt"), "utf8")).toContain("bin/ffmpeg.exe");
  });

  it("shows the sidecar priority setting only in the desktop surface", () => {
    expect(toolsClientSource).toContain("if (!isDesktopSurface) return");
    expect(toolsClientSource).toContain("const manuallyDisabled = window.localStorage.getItem(sidecarExperimentStorageKey) === \"manual-disabled\"");
    expect(toolsClientSource).toContain("window.localStorage.setItem(sidecarExperimentStorageKey, manuallyDisabled ? \"manual-disabled\" : \"enabled\")");
    expect(toolsClientSource).toContain("window.localStorage.setItem(sidecarExperimentStorageKey, event.target.checked ? \"enabled\" : \"manual-disabled\")");
    expect(toolsClientSource).toContain("backend: \"sidecar\"");
    expect(toolsClientSource).toContain("backend: failureBackend");
    expect(toolsClientSource).toContain("probe-duration");
  });

  it("passes only whitelisted sidecar request fields from the desktop UI", () => {
    expect(toolsClientSource).toContain("outputFormat: task.mode === \"video-convert\" ? videoFormat : task.mode === \"audio-convert\" ? audioFormat : undefined");
    expect(toolsClientSource).toContain("videoSize");
    expect(toolsClientSource).toContain("audioBitrate");
    expect(toolsClientSource).toContain("mediaQuality");
    expect(toolsClientSource).toContain("stripMetadata");
    expect(toolsClientSource).toContain("outputFormat: options.outputFormat");
    expect(toolsClientSource).not.toContain("rawArgs");
  });

  it("limits sidecar priority to local safe formats and keeps WASM as fallback path", () => {
    expect(sidecarHelperSource).toContain("convert-video-sidecar");
    expect(sidecarHelperSource).toContain("convert-wav-to-flac-poc");
    expect(sidecarHelperSource).toContain("convert-mp4-to-webm-poc");
    expect(sidecarHelperSource).toContain("probe-duration");
    expect(sidecarHelperSource).toContain("options.audioFormat === \"flac\"");
    expect(sidecarHelperSource).toContain("sidecarVideoFormats.includes(extension)");
    expect(sidecarHelperSource).toContain("sidecarVideoFormats.includes(options.videoFormat)");
    expect(sidecarHelperSource).not.toContain("mp3-to");
    expect(sidecarHelperSource).not.toContain("aac-to");
  });

  it("uses bundled FFmpeg codecs that are present in the offline sidecar build", () => {
    expect(sidecarSource).toContain("libopenh264");
    expect(sidecarSource).toContain("libvpx-vp9");
    expect(sidecarSource).toContain("mpeg4");
    expect(sidecarSource).toContain("libmp3lame");
    expect(sidecarSource).not.toContain("libx264");
  });
});
