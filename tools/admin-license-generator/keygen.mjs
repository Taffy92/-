#!/usr/bin/env node

import { generateKeyPairSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(rootDir, "keys");

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const publicPem = publicKey.export({ format: "pem", type: "spki" });
const privatePem = privateKey.export({ format: "pem", type: "pkcs8" });
const publicDer = publicKey.export({ format: "der", type: "spki" });
const rawPublicKeyBase64 = Buffer.from(publicDer).subarray(-32).toString("base64");

await mkdir(keysDir, { recursive: true });
await writeFile(path.join(keysDir, "public_key.pem"), publicPem, "utf8");
await writeFile(path.join(keysDir, "private_key.pem"), privatePem, "utf8");
await writeFile(path.join(keysDir, "public_key_raw_base64.txt"), `${rawPublicKeyBase64}\n`, "utf8");

console.log("Generated Ed25519 key pair.");
console.log(`Public key: ${path.join(keysDir, "public_key.pem")}`);
console.log(`Private key: ${path.join(keysDir, "private_key.pem")}`);
console.log(`Raw public key base64: ${rawPublicKeyBase64}`);
console.log("Before production release, update PUBLIC_KEY_RAW_B64 in apps/desktop/src-tauri/src/license.rs.");
