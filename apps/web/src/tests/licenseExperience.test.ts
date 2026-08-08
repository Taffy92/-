import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  formatActivationStatusMessage,
  formatDesktopLicenseLabel
} from "../lib/desktopLicense";
import type { DesktopLicenseStatus } from "../lib/desktopLicense";

const projectRoot = resolve(process.cwd(), "..", "..");

function readProjectFile(...parts: string[]) {
  return readFileSync(resolve(projectRoot, ...parts), "utf8");
}

function status(overrides: Partial<DesktopLicenseStatus> = {}): DesktopLicenseStatus {
  return {
    allowed: false,
    mode: "locked",
    reasonCode: "trial_expired",
    reason: "3 天试用已结束。",
    product: "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO",
    softwareName: "万能格式转换器离线专业版",
    machineId: "TEST-TEST-TEST-TEST",
    nowUtc: 1_700_000_000,
    contact: { wechat: "test", phone: "test", email: "test@example.com" },
    ...overrides
  };
}

describe("download, trial, and activation experience", () => {
  it("keeps one primary download action above integrity details", () => {
    const source = readProjectFile("apps", "web", "src", "app", "download", "page.tsx");
    const config = readProjectFile("apps", "web", "src", "config", "downloads.ts");

    expect(source).toContain("离线专业版面向批量处理、敏感文件和断网办公");
    expect(source).toContain("Windows 10 / 11 x64");
    expect(source).toContain("文件只在当前设备处理，不上传服务器");
    expect(source).toContain("3 天完整试用");
    expect(source).toContain("InstallerDownloadButton");
    expect(source).toContain("<details");
    expect(source.indexOf("InstallerDownloadButton")).toBeLessThan(source.indexOf("<details"));
    expect(source).toContain("downloadsConfig.version");
    expect(source).toContain("downloadsConfig.fileSize");
    expect(source).toContain("downloadsConfig.sha256");
    expect(config).toContain("windowsCodeSigned: false");
  });

  it("makes the unsigned SmartScreen risk explicit without hiding SHA256 guidance", () => {
    const source = readProjectFile("apps", "web", "src", "app", "download", "page.tsx");

    expect(source).toContain("downloadsConfig.windowsCodeSigned");
    expect(source).toContain("当前安装包尚未代码签名");
    expect(source).toContain("Microsoft Defender SmartScreen");
    expect(source).toContain("SHA256");
    expect(source).toContain("分片");
  });

  it("shows trial days without blocking the workbench", () => {
    const toolsSource = readProjectFile("apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const localToolsSource = readProjectFile("apps", "web", "src", "components", "tools", "LocalToolsClient.tsx");

    expect(formatDesktopLicenseLabel(status({
      allowed: true,
      mode: "trial",
      trialRemainingSeconds: 172_800
    }))).toBe("试用剩余 2 天");
    expect(toolsSource).toContain("formatDesktopLicenseLabel(desktopLicenseStatus)");
    expect(localToolsSource).toContain("formatDesktopLicenseLabel(desktopLicenseStatus)");
  });

  it.each([
    ["license_format_error", "格式错误"],
    ["license_invalid", "签名无效"],
    ["machine_mismatch", "机器码不匹配"],
    ["license_expired", "授权已过期"],
    ["time_rollback", "系统时间异常"],
    ["trial_tampered", "文件损坏或本地记录异常"]
  ])("explains %s activation failures", (reasonCode, label) => {
    expect(formatActivationStatusMessage(status({ reasonCode }), "code")).toContain(label);
  });

  it("returns to the existing task after activation without a restart", () => {
    const gateSource = readProjectFile("apps", "web", "src", "components", "tools", "LicenseGate.tsx");

    expect(gateSource).toContain("formatActivationStatusMessage(nextStatus");
    expect(gateSource).toContain("onStatusChange(nextStatus)");
    expect(gateSource).not.toContain("location.reload");
    expect(gateSource).not.toContain("relaunch");
    expect(formatActivationStatusMessage(status({ allowed: true, mode: "license" }), "file"))
      .toBe("授权文件激活成功，无需重启。");
  });
});
