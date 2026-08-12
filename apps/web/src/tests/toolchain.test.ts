import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd(), "../..");

describe("release toolchain", () => {
  it("keeps the declared Node and pnpm versions aligned", () => {
    const nvmrc = readFileSync(resolve(projectRoot, ".nvmrc"), "utf8").trim();
    const packageJson = JSON.parse(
      readFileSync(resolve(projectRoot, "package.json"), "utf8")
    ) as {
      engines?: { node?: string; pnpm?: string };
      packageManager?: string;
      scripts?: Record<string, string>;
    };

    expect(nvmrc).toBe("24");
    expect(packageJson.engines).toEqual({ node: "24.x", pnpm: "9.15.4" });
    expect(packageJson.packageManager).toBe("pnpm@9.15.4");
    expect(packageJson.scripts?.["verify:toolchain"]).toBe(
      "node scripts/verify-toolchain.mjs"
    );
  });

  it("accepts only Node 24 and pnpm 9.15.4", async () => {
    const moduleUrl = pathToFileURL(
      resolve(projectRoot, "scripts", "verify-toolchain.mjs")
    ).href;
    const { validateToolchain } = await import(moduleUrl) as {
      validateToolchain(input: {
        nodeVersion: string;
        pnpmVersion: string;
      }): { ok: boolean; errors: string[] };
    };

    expect(validateToolchain({
      nodeVersion: "v24.5.0",
      pnpmVersion: "9.15.4"
    })).toEqual({ ok: true, errors: [] });

    expect(validateToolchain({
      nodeVersion: "v26.1.0",
      pnpmVersion: "9.15.4"
    })).toMatchObject({ ok: false });

    expect(validateToolchain({
      nodeVersion: "v24.5.0",
      pnpmVersion: "11.16.0"
    })).toMatchObject({ ok: false });
  });
});
