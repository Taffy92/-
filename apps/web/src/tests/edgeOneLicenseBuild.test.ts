import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd(), "..", "..");
const edgeOneBuildPath = resolve(projectRoot, "apps", "web", "scripts", "build-edgeone.mjs");
const edgeOneConfigPath = resolve(projectRoot, "edgeone.json");
const edgeOneFunctionRoot = resolve(
  projectRoot,
  "cloud-functions",
  "api",
  "admin",
  "license"
);

describe("EdgeOne private license admin build", () => {
  it("packages the license functions with only their runtime dependency", () => {
    const buildSource = readFileSync(edgeOneBuildPath, "utf8");

    expect(buildSource).toContain('"cloud-functions"');
    expect(buildSource).toContain('"@edgeone/pages-blob"');
    expect(buildSource).toContain("writeFunctionRuntimePackage");
  });

  it("rejects private keys, license files, and customer record exports", () => {
    const buildSource = readFileSync(edgeOneBuildPath, "utf8");

    expect(buildSource).toContain("assertNoPrivateLicenseMaterial");
    expect(buildSource).toContain("PRIVATE KEY");
    expect(buildSource).toContain(".mrx");
    expect(buildSource).toContain("license_records.json");
  });

  it("recovers and verifies published installer parts when CI has no local installers", () => {
    const buildSource = readFileSync(edgeOneBuildPath, "utf8");

    expect(buildSource).toContain("fetchPublishedInstallerManifest");
    expect(buildSource).toContain("reusePublishedInstallerParts");
    expect(buildSource).toContain("failed size or SHA256 verification");
    expect(buildSource).toContain("failed complete SHA256 verification");
  });

  it("exposes the private admin functions at the repository root for Git builds", () => {
    for (const relativePath of [
      "health.ts",
      "session.ts",
      "generate.ts",
      "backup.ts",
      "records/index.ts",
      "records/[id]/file.ts"
    ]) {
      expect(existsSync(resolve(edgeOneFunctionRoot, relativePath))).toBe(true);
    }
  });

  it("pins a mainland region and disables caching and indexing for the admin surface", () => {
    const config = JSON.parse(readFileSync(edgeOneConfigPath, "utf8"));

    expect(config.buildCommand).toBe("npm run build:edgeone");
    expect(config.installCommand).toBe("pnpm install --frozen-lockfile");
    expect(config.outputDirectory).toBe("apps/web/out");
    expect(config.nodeVersion).toBe("20.18.0");
    expect(config.cloudFunctions?.mainlandRegions).toEqual(["ap-guangzhou"]);
    expect(config.headers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: "/admin/license/*",
        headers: expect.arrayContaining([
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ])
      }),
      expect.objectContaining({
        source: "/api/admin/license/*",
        headers: expect.arrayContaining([
          { key: "Cache-Control", value: "no-store" }
        ])
      })
    ]));
  });
});
