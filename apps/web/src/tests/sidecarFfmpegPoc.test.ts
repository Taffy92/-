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

describe("sidecar FFmpeg low-risk backend safety boundary", () => {
  it("registers internal sidecar commands without replacing existing media flow", () => {
    expect(rustMain).toContain("check_ffmpeg_sidecar");
    expect(rustMain).toContain("get_ffmpeg_sidecar_version");
    expect(rustMain).toContain("run_ffmpeg_sidecar_poc");
    expect(sidecarSource).toContain("version-check");
    expect(sidecarSource).toContain("buildconf-check");
    expect(sidecarSource).toContain("probe-duration");
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

  it("shows the low-risk sidecar priority setting only in the desktop surface", () => {
    expect(toolsClientSource).toContain("使用本地 sidecar FFmpeg 优先处理低风险格式");
    expect(toolsClientSource).toContain("if (!isDesktopSurface) return");
    expect(toolsClientSource).toContain("const manuallyDisabled = window.localStorage.getItem(sidecarExperimentStorageKey) === \"disabled\"");
    expect(toolsClientSource).toContain("setSidecarExperimentEnabled(!manuallyDisabled)");
    expect(toolsClientSource).toContain("sidecar 低风险优先处理中");
    expect(toolsClientSource).toContain("backend: \"sidecar\"");
    expect(toolsClientSource).toContain("backend: failureBackend");
    expect(toolsClientSource).toContain("probe-duration");
    expect(toolsClientSource).toContain("sidecar FFmpeg 处理失败");
  });

  it("limits sidecar priority to low-risk formats and keeps WASM as fallback path", () => {
    expect(sidecarHelperSource).toContain("convert-wav-to-flac-poc");
    expect(sidecarHelperSource).toContain("convert-mp4-to-webm-poc");
    expect(sidecarHelperSource).toContain("probe-duration");
    expect(sidecarHelperSource).toContain("options.audioFormat === \"flac\"");
    expect(sidecarHelperSource).toContain("options.videoFormat === \"webm\"");
    expect(sidecarHelperSource).toContain("MP4/H.264");
    expect(sidecarHelperSource).toContain("视频提取音频不属于 sidecar 低风险优先范围");
    expect(sidecarHelperSource).not.toContain("mp3-to");
    expect(sidecarHelperSource).not.toContain("aac-to");
  });
});
