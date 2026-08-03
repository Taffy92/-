import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { securityHeaders } from "../src/config/securityHeaders.js";

const scriptDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const root = resolve(scriptDir, "../out");
const args = new Map(process.argv.slice(2).map((item, index, all) => item.startsWith("--") ? [item.slice(2), all[index + 1]] : []));
const host = args.get("hostname") || "127.0.0.1";
const port = Number(args.get("port") || 3010);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
  [".zip", "application/zip"]
]);

function resolveFile(urlPath) {
  const decodedPath = decodeURIComponent(new URL(urlPath, "http://local.test").pathname);
  const normalized = normalize(decodedPath).replace(/^([/\\])+/, "");
  const target = resolve(root, normalized);
  if (!target.startsWith(root + sep) && target !== root) return null;

  if (existsSync(target) && statSync(target).isFile()) return target;
  if (existsSync(target) && statSync(target).isDirectory()) {
    const indexFile = join(target, "index.html");
    if (existsSync(indexFile)) return indexFile;
  }

  const htmlFile = `${target}.html`;
  if (existsSync(htmlFile)) return htmlFile;
  return null;
}

const server = createServer((request, response) => {
  const requestedFile = resolveFile(request.url || "/");
  const filePath = requestedFile || resolveFile("/404.html");
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(requestedFile ? 200 : 404, {
    "cache-control": "no-store",
    "content-type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
    ...Object.fromEntries(securityHeaders.map(({ key, value }) => [key, value]))
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Static server ready at http://${host}:${port}`);
});
