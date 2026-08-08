import { describe, expect, it } from "vitest";
import {
  ConversionFailure,
  canTransitionConversionTask,
  selectConversionBackend,
  toPublicConversionError
} from "../lib/conversion";

describe("conversion task contract", () => {
  it("allows only the declared happy-path and active failure transitions", () => {
    expect(canTransitionConversionTask("queued", "inspecting")).toBe(true);
    expect(canTransitionConversionTask("inspecting", "ready")).toBe(true);
    expect(canTransitionConversionTask("ready", "running")).toBe(true);
    expect(canTransitionConversionTask("running", "writing")).toBe(true);
    expect(canTransitionConversionTask("writing", "completed")).toBe(true);

    expect(canTransitionConversionTask("running", "failed")).toBe(true);
    expect(canTransitionConversionTask("running", "cancelled")).toBe(true);
    expect(canTransitionConversionTask("writing", "failed")).toBe(true);
    expect(canTransitionConversionTask("writing", "cancelled")).toBe(true);

    expect(canTransitionConversionTask("queued", "running")).toBe(false);
    expect(canTransitionConversionTask("ready", "completed")).toBe(false);
    expect(canTransitionConversionTask("completed", "running")).toBe(false);
    expect(canTransitionConversionTask("failed", "running")).toBe(false);
    expect(canTransitionConversionTask("cancelled", "running")).toBe(false);
  });

  it("selects existing local backends only when their requirements are met", () => {
    expect(selectConversionBackend({
      family: "office",
      surface: "desktop",
      hasLocalPath: true,
      sidecarReady: false
    })).toBe("libreoffice");

    expect(selectConversionBackend({
      family: "media",
      surface: "desktop",
      hasLocalPath: true,
      sidecarReady: true
    })).toBe("sidecar");

    expect(selectConversionBackend({
      family: "media",
      surface: "desktop",
      hasLocalPath: false,
      sidecarReady: true
    })).toBe("browser");

    expect(selectConversionBackend({
      family: "office",
      surface: "web",
      hasLocalPath: false,
      sidecarReady: false
    })).toBe("browser");
  });

  it("serializes known failures without including their cause", () => {
    const failure = new ConversionFailure({
      code: "backend-unavailable",
      stage: "conversion",
      backend: "sidecar",
      message: "本地媒体引擎不可用",
      action: "请检查本地组件后重试",
      cause: new Error("private implementation detail")
    });

    const publicError = toPublicConversionError(failure);
    expect(publicError).toEqual({
      code: "backend-unavailable",
      stage: "conversion",
      backend: "sidecar",
      message: "本地媒体引擎不可用",
      action: "请检查本地组件后重试"
    });
    expect(JSON.stringify(publicError)).not.toContain("private implementation detail");
  });

  it("normalizes unknown exceptions without exposing paths or stacks", () => {
    const unknown = new Error("Failed at C:\\Users\\customer\\secret.pdf");
    unknown.stack = "Error: failed\n    at /home/customer/private/convert.ts:42:5";

    const publicError = toPublicConversionError(unknown, {
      stage: "writing",
      backend: "browser"
    });

    expect(publicError).toEqual({
      code: "unknown",
      stage: "writing",
      backend: "browser",
      message: "转换过程中发生未知错误",
      action: "请重试；如果问题持续，请换用受支持的文件或格式"
    });
    expect(JSON.stringify(publicError)).not.toMatch(/customer|secret\.pdf|convert\.ts/i);
  });
});
