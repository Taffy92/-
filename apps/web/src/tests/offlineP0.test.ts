import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");

describe("offline P0 release checks", () => {
  it("keeps Tauri Chinese metadata valid UTF-8", () => {
    const tauriConfigPath = resolve(projectRoot, "apps", "desktop", "src-tauri", "tauri.conf.json");
    const config = JSON.parse(readFileSync(tauriConfigPath, "utf8"));
    const bundle = config.tauri.bundle;
    const windowConfig = config.tauri.windows[0];
    const fields = [
      config.package.productName,
      bundle.publisher,
      bundle.copyright,
      bundle.shortDescription,
      bundle.longDescription,
      windowConfig.title
    ].join("\n");

    expect(config.package.productName).toBe("万能格式转换器");
    expect(bundle.publisher).toBe("MR.谢");
    expect(windowConfig.title).toBe("万能格式转换器");
    expect(fields).toContain("本地处理");
    expect(fields).toContain("不上传服务器");
    expect(fields).not.toMatch(/[锟絔|娑搢鐠媩閻▅濮潀閸瑜?]/);
  });

  it("uses a local browser-image-compression worker asset", () => {
    const imageCorePath = resolve(projectRoot, "packages", "image-core", "src", "image.ts");
    const imageCoreSource = readFileSync(imageCorePath, "utf8");
    const localWorkerPath = "/vendor/browser-image-compression/browser-image-compression.js";

    expect(imageCoreSource).toContain("libURL");
    expect(imageCoreSource).toContain(localWorkerPath);
    expect(imageCoreSource).not.toContain("cdn.jsdelivr.net");
    expect(imageCoreSource).not.toContain("unpkg.com");

    const workerAssetPath = resolve(projectRoot, "apps", "web", "public", "vendor", "browser-image-compression", "browser-image-compression.js");
    expect(existsSync(workerAssetPath)).toBe(true);
    expect(readFileSync(workerAssetPath, "utf8")).toContain("browser-image-compression");
  });

  it("exposes stable batch action selectors", () => {
    const toolsClientPath = resolve(projectRoot, "apps", "web", "src", "components", "tools", "ToolsClient.tsx");
    const source = readFileSync(toolsClientPath, "utf8");
    expect(source).toContain('aria-label="重试任务"');
    expect(source).toContain('data-testid="retry-task-button"');
    expect(source).toContain('aria-label="打开结果文件"');
    expect(source).toContain('data-testid="open-result-file-button"');
    expect(source).toContain("结果文件不存在，请重新处理或检查输出目录。");
  });
});
