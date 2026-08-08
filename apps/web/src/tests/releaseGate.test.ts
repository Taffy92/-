import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(process.cwd(), "..", "..");
const releaseScript = resolve(projectRoot, "scripts", "verify-release.mjs");

function readProjectFile(...parts: string[]) {
  return readFileSync(resolve(projectRoot, ...parts), "utf8");
}

describe("unified release gate", () => {
  it("is exposed from the root and keeps a dedicated Office command", () => {
    const rootPackage = JSON.parse(readProjectFile("package.json"));
    const webPackage = JSON.parse(readProjectFile("apps", "web", "package.json"));

    expect(rootPackage.scripts["verify:release"]).toBe("node scripts/verify-release.mjs");
    expect(webPackage.scripts["verify:office"]).toContain("officeDesktopIntegration.test.ts");
    expect(webPackage.scripts["verify:office"]).not.toContain("--passWithNoTests");
  });

  it("lists the mandatory stages in a fixed order", () => {
    const result = spawnSync(process.execPath, [releaseScript, "--list"], {
      cwd: projectRoot,
      encoding: "utf8"
    });

    expect(result.status, result.stderr).toBe(0);
    const stageIds = result.stdout.trim().split(/\r?\n/).map((line) => line.split("\t")[0]);
    expect(stageIds).toEqual([
      "toolchain",
      "tests",
      "privacy",
      "network",
      "cargo-check",
      "cargo-test",
      "office",
      "edgeone-build",
      "artifacts",
      "secret-scan",
      "skip-scan"
    ]);
  });

  it("validates release files, versions, hashes, parts, and installer contents", () => {
    const source = readProjectFile("scripts", "verify-release.mjs");

    expect(source).toContain("SHA256SUMS.txt");
    expect(source).toContain("tauri.conf.json");
    expect(source).toContain("downloads.ts");
    expect(source).toContain("manifest.json");
    expect(source).toContain("certificateThumbprint");
    expect(source).toContain("hashFile");
    expect(source).toContain("verifyReleaseArtifacts");
    expect(source).toContain("verifyInstallerParts");
    expect(source).toContain("verifyPublishedCloudFunctions");
  });

  it("rejects leaked private material and skipped critical conversion tests", () => {
    const source = readProjectFile("scripts", "verify-release.mjs");

    expect(source).toContain("private_key.pem");
    expect(source).toContain("license_records.json");
    expect(source).toContain(".mrx");
    expect(source).toContain("officeDesktopIntegration.test.ts");
    expect(source).toContain("mediaConversionBehavior.test.ts");
    expect(source).toContain("test|it|describe");
    expect(source).toContain("Office verification stage did not execute");
    expect(source).toContain('error?.code === "ENOENT"');
  });

  it("does not deploy, delete release artifacts, or change versions", () => {
    const source = readProjectFile("scripts", "verify-release.mjs");

    expect(source).not.toMatch(/deploy:edgeone|makers deploy|tcb hosting deploy/);
    expect(source).not.toMatch(/rmSync|unlinkSync|writeFileSync|renameSync/);
    expect(source).not.toMatch(/npm version|cargo set-version/);
  });
});
