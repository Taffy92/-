import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd(), "../..");
const verificationRoot = resolve(projectRoot, "verification", "reliability-2026");
const matrixPath = resolve(verificationRoot, "sample-matrix.json");
const baselinePath = resolve(verificationRoot, "baseline.md");

type SampleCategory = "image" | "pdf" | "word" | "excel" | "media" | "ocr";
type SampleCase = "normal" | "complex" | "oversized" | "damaged" | "unsupported";

type SampleEntry = {
  id: string;
  category: SampleCategory;
  caseType: SampleCase;
  source: string;
  license: string;
  fixturePath: string;
  sha256: string;
  expectedOutcome: "success" | "failure";
  stableAssertions: string[];
  surfaces: Array<"web" | "desktop">;
};

const minimumByCategory: Record<SampleCategory, number> = {
  image: 4,
  pdf: 4,
  word: 3,
  excel: 3,
  media: 4,
  ocr: 2
};

describe("conversion quality baseline", () => {
  it("defines the required non-sensitive sample matrix", () => {
    expect(existsSync(matrixPath)).toBe(true);
    const raw = readFileSync(matrixPath, "utf8");
    const samples = JSON.parse(raw) as SampleEntry[];

    expect(samples.length).toBeGreaterThanOrEqual(20);
    expect(new Set(samples.map((sample) => sample.id)).size).toBe(samples.length);

    for (const [category, minimum] of Object.entries(minimumByCategory)) {
      expect(samples.filter((sample) => sample.category === category).length).toBeGreaterThanOrEqual(minimum);
    }

    for (const caseType of ["normal", "complex", "oversized", "damaged", "unsupported"] as const) {
      expect(samples.some((sample) => sample.caseType === caseType)).toBe(true);
    }

    for (const sample of samples) {
      expect(sample.id).toMatch(/^[a-z0-9-]+$/);
      expect(Object.hasOwn(minimumByCategory, sample.category)).toBe(true);
      expect(["normal", "complex", "oversized", "damaged", "unsupported"]).toContain(sample.caseType);
      expect(sample.source.trim()).not.toBe("");
      expect(sample.license.trim()).not.toBe("");
      expect(isAbsolute(sample.fixturePath)).toBe(false);
      expect(sample.fixturePath).not.toContain("..");
      expect(sample.fixturePath.replaceAll("\\", "/")).toMatch(/^apps\/web\/src\/test-fixtures\/conversion\//);
      expect(sample.sha256).toMatch(/^[A-F0-9]{64}$/);
      expect(["success", "failure"]).toContain(sample.expectedOutcome);
      expect(sample.stableAssertions.length).toBeGreaterThan(0);
      expect(sample.stableAssertions.every((value) => value.trim().length > 0)).toBe(true);
      expect(sample.surfaces.length).toBeGreaterThan(0);
      expect(sample.surfaces.every((surface) => surface === "web" || surface === "desktop")).toBe(true);
    }

    expect(raw).not.toMatch(/[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}/);
    expect(raw).not.toMatch(/private[_-]?key|license[_-]?code|customer[_-]?name|\.mrx/i);
    expect(raw).not.toMatch(/[A-Za-z]:[\\/]/);
  });

  it("pins every fixture by size and SHA256 without sensitive material", () => {
    const samples = JSON.parse(readFileSync(matrixPath, "utf8")) as SampleEntry[];

    for (const sample of samples) {
      const fixturePath = resolve(projectRoot, sample.fixturePath);
      expect(existsSync(fixturePath), sample.id).toBe(true);
      expect(statSync(fixturePath).size, sample.id).toBeGreaterThan(0);

      const content = readFileSync(fixturePath);
      const digest = createHash("sha256").update(content).digest("hex").toUpperCase();
      expect(digest, sample.id).toBe(sample.sha256);
      expect(content.includes(Buffer.from("PRIVATE KEY")), sample.id).toBe(false);
      expect(content.includes(Buffer.from("license_records")), sample.id).toBe(false);
      expect(content.includes(Buffer.from("C:\\Users\\")), sample.id).toBe(false);
      expect(content.includes(Buffer.from("/home/")), sample.id).toBe(false);
      expect(sample.fixturePath.toLowerCase()).not.toMatch(/\.mrx$|license|customer|private-key/);
    }
  });

  it("records a reproducible, non-release baseline", () => {
    expect(existsSync(baselinePath)).toBe(true);
    const baseline = readFileSync(baselinePath, "utf8");

    expect(baseline).toContain("Node.js 20");
    expect(baseline).toContain("pnpm 9.15.4");
    expect(baseline).toContain("Rust");
    expect(baseline).toContain("LibreOffice");
    expect(baseline).toContain("FFmpeg");
    expect(baseline).toContain("仅作为改进前基线");
    expect(baseline).not.toMatch(/[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}/);
    expect(baseline).not.toMatch(/private[_-]?key|license[_-]?code|\.mrx/i);
  });
});
