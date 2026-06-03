#!/usr/bin/env node

import {
  createHash,
  createHmac,
  createPrivateKey,
  randomUUID,
  sign
} from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCT = "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO";
const SOFTWARE_NAME = "万能格式转换器离线专业版";
const LICENSE_PREFIX = "UFC1-";
const LOCAL_TRIAL_KEY_CONTEXT = "ufc-local-trial-v1";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const privateKeyPath = path.join(rootDir, "keys", "private_key.pem");
const recordsPath = path.join(rootDir, "license_records.json");

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printHelp();
    return;
  }

  const privateKeyPem = await readFile(privateKeyPath, "utf8").catch(() => "");
  if (!privateKeyPem) {
    throw new Error(`Missing private key. Run: node ${path.join(rootDir, "keygen.mjs")}`);
  }

  const privateKey = createPrivateKey(privateKeyPem);
  const request = args.request ? await readActivationRequest(args.request) : null;
  const machineId = normalizeMachineId(args.machine || request?.machineId || request?.machine_id || "");
  if (!machineId) {
    throw new Error("Missing --machine or --request activation_request.mrx.");
  }

  if (request) {
    await verifyActivationRequest(request, machineId);
  }

  const now = Math.floor(Date.now() / 1000);
  const days = parsePositiveInt(args.days || "30", "days");
  const issuedAt = args.issuedAt ? parsePositiveInt(args.issuedAt, "issuedAt") : now;
  const expiresAt = args.expiresAt ? parsePositiveInt(args.expiresAt, "expiresAt") : issuedAt + days * 24 * 60 * 60;
  const features = normalizeFeatures(args.features || "basic,convert,export,batch");
  const payload = {
    license_id: args.licenseId || `LIC-${new Date(issuedAt * 1000).toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`,
    product: PRODUCT,
    software_name: SOFTWARE_NAME,
    machine_id: machineId,
    issued_at: issuedAt,
    expires_at: expiresAt,
    edition: args.edition || "pro",
    features
  };

  const signature = sign(null, Buffer.from(canonicalLicensePayload(payload), "utf8"), privateKey).toString("base64url");
  const envelope = {
    version: "ufc-license-v1",
    payload,
    signature
  };
  const envelopeJson = JSON.stringify(envelope);
  const licenseCode = `${LICENSE_PREFIX}${Buffer.from(envelopeJson, "utf8").toString("base64url")}`;

  const outDir = path.resolve(rootDir, args.out || "out");
  await mkdir(outDir, { recursive: true });
  const licenseFilePath = path.join(outDir, args.file || "license.mrx");
  await writeFile(licenseFilePath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
  await appendRecord({
    license_id: payload.license_id,
    customer_name: args.customer || "",
    machine_id: machineId,
    product: PRODUCT,
    days,
    edition: payload.edition,
    features,
    issued_at: issuedAt,
    expires_at: expiresAt,
    license_code: licenseCode,
    license_file_path: licenseFilePath,
    remark: args.remark || "",
    created_at: now
  });

  console.log("License generated.");
  console.log(`Machine ID: ${machineId}`);
  console.log(`Expires at: ${new Date(expiresAt * 1000).toISOString()}`);
  console.log(`License file: ${licenseFilePath}`);
  console.log("");
  console.log(licenseCode);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      continue;
    }
    const raw = item.slice(2);
    const [key, inlineValue] = raw.split("=", 2);
    if (inlineValue !== undefined) {
      args[toCamel(key)] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[toCamel(key)] = true;
      continue;
    }
    args[toCamel(key)] = next;
    index += 1;
  }
  return args;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
}

function printHelp() {
  console.log(`Usage:
  node tools/admin-license-generator/main.mjs --machine XXXX-XXXX-XXXX-XXXX --days 30 --customer "Customer"
  node tools/admin-license-generator/main.mjs --request activation_request.mrx --days 365

Options:
  --machine       Customer machine ID
  --request       Path to activation_request.mrx
  --days          License duration in days, default 30
  --edition       standard or pro, default pro
  --features      Comma list, default basic,convert,export,batch
  --out           Output directory, default ./out
  --file          Output file name, default license.mrx
  --customer      Customer name for local records
  --remark        Local record remark
`);
}

async function readActivationRequest(filePath) {
  const text = await readFile(path.resolve(filePath), "utf8");
  return JSON.parse(text);
}

async function verifyActivationRequest(request, machineId) {
  const signature = request.requestSignature || request.request_signature;
  if (!signature) {
    throw new Error("activation_request.mrx is missing request signature.");
  }
  const product = request.product;
  if (product !== PRODUCT) {
    throw new Error("activation_request.mrx product mismatch.");
  }
  const expected = activationRequestHmac(request, machineId);
  if (!timingSafeTextEqual(signature, expected)) {
    throw new Error("activation_request.mrx signature is invalid.");
  }
}

function activationRequestHmac(request, machineId) {
  const key = createHash("sha256")
    .update(PRODUCT)
    .update("|trial|")
    .update(machineId)
    .update("|")
    .update(LOCAL_TRIAL_KEY_CONTEXT)
    .digest();
  return createHmac("sha256", key)
    .update(canonicalActivationRequest(request), "utf8")
    .digest("base64url");
}

function canonicalActivationRequest(request) {
  return [
    `product=${request.product}`,
    `software_name=${request.softwareName || request.software_name}`,
    `machine_id=${request.machineId || request.machine_id}`,
    `app_version=${request.appVersion || request.app_version}`,
    `trial_status=${request.trialStatus || request.trial_status}`,
    `request_time=${request.requestTime || request.request_time}`,
    `request_id=${request.requestId || request.request_id}`
  ].join("\n");
}

function canonicalLicensePayload(payload) {
  return [
    `license_id=${payload.license_id}`,
    `product=${payload.product}`,
    `software_name=${payload.software_name}`,
    `machine_id=${payload.machine_id}`,
    `issued_at=${payload.issued_at}`,
    `expires_at=${payload.expires_at}`,
    `edition=${payload.edition}`,
    `features=${payload.features.join(",")}`
  ].join("\n");
}

function normalizeMachineId(value) {
  return String(value).trim().toUpperCase();
}

function normalizeFeatures(value) {
  const features = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (features.length === 0) {
    throw new Error("At least one feature is required.");
  }
  return features;
}

function parsePositiveInt(value, label) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

async function appendRecord(record) {
  const current = await readFile(recordsPath, "utf8")
    .then((text) => JSON.parse(text))
    .catch(() => []);
  current.push(record);
  await writeFile(recordsPath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
}

function timingSafeTextEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}
