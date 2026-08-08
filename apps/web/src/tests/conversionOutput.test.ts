import { describe, expect, it, vi } from "vitest";
import {
  cleanupDesktopTemporaryOutput,
  createDesktopOutputPlan,
  createMultiPageOutputDirectory,
  finalizeDesktopOutput
} from "../lib/conversion/desktopOutput";
import { createConversionResourceScope } from "../lib/conversion/resources";
import { createWebOutput } from "../lib/conversion/webOutput";

describe("conversion output contract", () => {
  it("creates Web output with Blob/Object URL only", () => {
    const createObjectURL = vi.fn(() => "blob:local-result");
    const revokeObjectURL = vi.fn();
    const scope = createConversionResourceScope({ revokeObjectURL });
    const blob = new Blob(["result"], { type: "text/plain" });

    const output = createWebOutput(blob, "result.txt", scope, { createObjectURL });

    expect(output).toEqual({ blob, name: "result.txt", objectUrl: "blob:local-result" });
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    scope.releaseObjectUrl(output.objectUrl);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:local-result");
  });

  it("uses a task temporary name and a stable non-overwriting final suffix", () => {
    const plan = createDesktopOutputPlan({
      outputRoot: "D:\\Exports",
      taskId: "task/42",
      requestedName: "report.pdf",
      existingNames: ["report.pdf", "report (2).pdf"]
    });

    expect(plan.finalName).toBe("report (3).pdf");
    expect(plan.finalPath).toBe("D:\\Exports\\report (3).pdf");
    expect(plan.temporaryPath).toMatch(/^D:\\Exports\\\.mrx-task-task_42-/);
    expect(plan.temporaryPath).toMatch(/\.tmp$/);
  });

  it("preserves an absolute Windows drive root", () => {
    const plan = createDesktopOutputPlan({
      outputRoot: "D:\\",
      taskId: "task-root",
      requestedName: "result.pdf",
      existingNames: []
    });

    expect(plan.outputRoot).toBe("D:\\");
    expect(plan.finalPath).toBe("D:\\result.pdf");
  });

  it("places multi-page Office and PDF results in a same-name child folder", () => {
    expect(createMultiPageOutputDirectory({
      outputRoot: "D:\\Exports",
      sourceName: "annual-report.docx",
      existingNames: []
    })).toEqual({
      directoryName: "annual-report",
      directoryPath: "D:\\Exports\\annual-report"
    });
  });

  it("finalizes and cleans only the planned temporary file", async () => {
    const invoke = vi.fn(async () => "D:\\Exports\\report.pdf");
    const plan = createDesktopOutputPlan({
      outputRoot: "D:\\Exports",
      taskId: "task-1",
      requestedName: "report.pdf",
      existingNames: []
    });

    await finalizeDesktopOutput(invoke, plan);
    await cleanupDesktopTemporaryOutput(invoke, plan);

    expect(invoke).toHaveBeenNthCalledWith(1, "finalize_task_output", {
      outputRoot: plan.outputRoot,
      temporaryPath: plan.temporaryPath,
      finalName: plan.finalName
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "cleanup_task_temporary_file", {
      outputRoot: plan.outputRoot,
      temporaryPath: plan.temporaryPath
    });
    expect(invoke.mock.calls.flat().join(" ")).not.toContain("remove_dir_all");
  });

  it("releases only resources registered to the failed or cancelled task", async () => {
    const revoked: string[] = [];
    const firstCleanup = vi.fn(async () => undefined);
    const secondCleanup = vi.fn(async () => undefined);
    const first = createConversionResourceScope({ revokeObjectURL: (url) => revoked.push(url) });
    const second = createConversionResourceScope({ revokeObjectURL: (url) => revoked.push(url) });
    const controller = first.createAbortController();

    first.trackObjectUrl("blob:first");
    first.trackLocalCleanup(firstCleanup);
    second.trackObjectUrl("blob:second");
    second.trackLocalCleanup(secondCleanup);

    await first.cleanup();

    expect(controller.signal.aborted).toBe(true);
    expect(revoked).toEqual(["blob:first"]);
    expect(firstCleanup).toHaveBeenCalledOnce();
    expect(secondCleanup).not.toHaveBeenCalled();

    await first.cleanup();
    expect(firstCleanup).toHaveBeenCalledOnce();
  });
});
