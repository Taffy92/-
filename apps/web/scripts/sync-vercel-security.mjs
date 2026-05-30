import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { securityHeaders } from "../src/config/securityHeaders.js";

const appRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const vercelPath = resolve(appRoot, "vercel.json");
const config = JSON.parse(readFileSync(vercelPath, "utf8"));

const rootHeader = config.headers.find((item) => item.source === "/(.*)");
if (!rootHeader) {
  throw new Error("vercel.json is missing the root /(.*) header block.");
}

rootHeader.headers = securityHeaders;
writeFileSync(vercelPath, `${JSON.stringify(config, null, 2)}\n`);
