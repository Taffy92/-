import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");

function readSource(relativePath: string) {
  return readFileSync(resolve(sourceRoot, relativePath), "utf8");
}

describe("ToolsClient responsibility boundaries", () => {
  it("delegates conversion state, cancellation and error normalization", () => {
    const tools = readSource("components/tools/ToolsClient.tsx");
    const controller = readSource("components/tools/useConversionController.ts");

    expect(tools).toContain('from "@/components/tools/useConversionController"');
    expect(tools).toContain("useConversionController()");
    expect(tools).not.toContain('useState<ProcessState>("idle")');
    expect(tools).not.toContain("const cancelRef = useRef(false)");
    expect(tools).not.toContain("function cancelTask() {");
    expect(tools).not.toContain("function friendlyError(error: unknown)");

    expect(controller).toContain('useState<ProcessState>("idle")');
    expect(controller).toContain("const cancelRef = useRef(false)");
    expect(controller).toContain("function cancelTask()");
    expect(controller).toContain("export function friendlyError");
  });

  it("renders the existing desktop canvas and online result DOM through leaf components", () => {
    const tools = readSource("components/tools/ToolsClient.tsx");
    const desktop = readSource("components/tools/DesktopTaskWorkspace.tsx");
    const result = readSource("components/tools/ConversionResultView.tsx");

    expect(tools).toContain("<DesktopTaskWorkspace");
    expect(tools).toContain("<ConversionResultView");
    expect(tools).not.toContain('<section className="desktop-a-task-canvas">');
    expect(tools).not.toContain("const onlineTaskActionBar = (");

    expect(desktop).toContain('<section className="desktop-a-task-canvas">');
    expect(desktop).toContain('<div className="desktop-a-preview-area">');
    expect(result).toContain("a2-task-status");
    expect(result).toContain("a2-task-actions");
    expect(result).toContain('aria-label="逐页下载结果"');
  });

  it("keeps direct browser and Tauri file writes out of the main component", () => {
    const tools = readSource("components/tools/ToolsClient.tsx");
    const output = readSource("lib/conversion/desktopOutput.ts");

    expect(tools).not.toContain("writeBinaryFile");
    expect(tools).not.toContain("createWritable");
    expect(output).toContain("saveBlobToOutputDirectory");
    expect(output).toContain("saveFilesToOutputDirectory");
    expect(output).toContain("createOutputSubdirectory");
  });

  it("loads the desktop workbench only when an online route actually needs it", () => {
    const desktopEntry = readSource("components/tools/DesktopToolsEntry.tsx");
    const onlineEntry = readSource("components/tools/OnlineToolsEntry.tsx");
    expect(desktopEntry).toContain('lazy(() =>');
    expect(desktopEntry).toContain('import("@/components/tools/ToolsClient")');
    expect(onlineEntry).toContain('lazy(() =>');
    expect(onlineEntry).toContain('import("@/components/tools/ToolsClient")');
    expect(readSource("app/page.tsx")).not.toContain('from "@/components/tools/ToolsClient"');
    expect(readSource("app/tools/page.tsx")).not.toContain('from "@/components/tools/ToolsClient"');
  });
});
