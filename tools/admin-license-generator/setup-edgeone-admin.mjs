#!/usr/bin/env node

import {
  createPrivateKey,
  createPublicKey,
  randomBytes,
  scryptSync
} from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolDir, "..", "..");
const privateKeyPath = path.join(toolDir, "keys", "private_key.pem");
const desktopLicensePath = path.join(
  projectRoot,
  "apps",
  "desktop",
  "src-tauri",
  "src",
  "license.rs"
);
const outputPath = path.join(toolDir, ".tmp", "edgeone-admin-secrets.env");
const password = process.env.UFC_EDGEONE_ADMIN_PASSWORD ?? "";

if (Number.parseInt(process.versions.node.split(".")[0], 10) !== 24) {
  throw new Error("请使用项目规定的 Node.js 24 运行此工具。");
}
if (!password) {
  throw new Error("管理员密码不能为空。");
}

const privateKeyPem = await readFile(privateKeyPath, "utf8");
await verifyDesktopPublicKey(privateKeyPem);

const salt = randomBytes(16);
const passwordHash = scryptSync(password, salt, 64, {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024
});
const passwordDigest = [
  "scrypt",
  "v1",
  "16384",
  "8",
  "1",
  salt.toString("base64url"),
  passwordHash.toString("base64url")
].join("$");
const sessionSecret = randomBytes(32).toString("base64url");
const values = {
  LICENSE_ADMIN_PASSWORD_SCRYPT: passwordDigest,
  LICENSE_PRIVATE_KEY_PEM_B64: Buffer.from(privateKeyPem, "utf8").toString("base64"),
  LICENSE_SESSION_SECRET_B64: Buffer.from(sessionSecret, "utf8").toString("base64"),
  LICENSE_RECORD_ENCRYPTION_KEY_B64: randomBytes(32).toString("base64")
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n")}\n`,
  { encoding: "utf8", mode: 0o600 }
);

console.log("EdgeOne 后台四项秘密配置已生成。");
console.log(`配置文件：${outputPath}`);
console.log("文件内容不会自动上传，也不会显示在日志中。");

async function verifyDesktopPublicKey(pem) {
  const desktopSource = await readFile(desktopLicensePath, "utf8");
  const match = desktopSource.match(/PUBLIC_KEY_RAW_B64:\s*&str\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error("无法读取桌面端内置公钥。");
  }

  const publicDer = createPublicKey(createPrivateKey(pem)).export({
    format: "der",
    type: "spki"
  });
  const rawPublicKey = Buffer.from(publicDer).subarray(-32).toString("base64");
  if (rawPublicKey !== match[1]) {
    throw new Error("本地私钥与桌面端内置公钥不匹配，已停止生成配置。");
  }
}
