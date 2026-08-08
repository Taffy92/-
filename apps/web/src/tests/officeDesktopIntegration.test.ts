import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(process.cwd(), "..", "..");
const libreOfficeRoot = resolve(projectRoot, "apps/desktop/src-tauri/resources/libreoffice");
const libreOfficeExecutable = resolve(libreOfficeRoot, "program/soffice.com");
const manifestPath = resolve(libreOfficeRoot, "manifest.json");
const fixtureRoot = resolve(process.cwd(), "src/test-fixtures/conversion");
let temporaryRoot = "";

beforeAll(async () => {
  if (!existsSync(libreOfficeExecutable) || !existsSync(manifestPath)) {
    throw new Error("Office desktop environment not ready: pinned LibreOffice runtime is missing");
  }
  temporaryRoot = await mkdtemp(join(tmpdir(), "mrx-office-integration-"));
});

afterAll(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
});

describe("desktop LibreOffice conversion", () => {
  it("runs the pinned runtime instead of silently skipping the environment", async () => {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const { stdout } = await execFileAsync(libreOfficeExecutable, ["--version"], {
      timeout: 30_000,
      windowsHide: true
    });

    expect(manifest.version).toBe("26.2.5");
    expect(stdout).toContain(manifest.version);
  }, 30_000);

  it.each([
    ["word/basic-two-pages.docx", 2],
    ["excel/basic-two-sheets.xlsx", 2]
  ])("converts %s into a readable multi-page PDF", async (relativeFixture, minimumPages) => {
    const inputPath = resolve(fixtureRoot, relativeFixture);
    const outputDirectory = await mkdtemp(join(temporaryRoot, "conversion-"));
    const profileDirectory = await mkdtemp(join(temporaryRoot, "profile-"));
    const profileUrl = `file:///${profileDirectory.replaceAll("\\", "/").replaceAll(" ", "%20")}`;

    await execFileAsync(libreOfficeExecutable, [
      "--headless",
      "--invisible",
      "--nodefault",
      "--nologo",
      "--nolockcheck",
      "--norestore",
      `-env:UserInstallation=${profileUrl}`,
      "--convert-to",
      "pdf",
      "--outdir",
      outputDirectory,
      inputPath
    ], {
      cwd: resolve(libreOfficeRoot, "program"),
      timeout: 60_000,
      windowsHide: true
    });

    const outputName = `${basename(inputPath, extname(inputPath))}.pdf`;
    const outputPath = resolve(outputDirectory, outputName);
    expect(existsSync(outputPath)).toBe(true);

    const pdf = await PDFDocument.load(new Uint8Array(await readFile(outputPath)));
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(minimumPages);
  }, 70_000);
});
