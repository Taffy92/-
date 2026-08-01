import {
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual
} from "node:crypto";

export const SESSION_COOKIE_NAME = "license_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

export async function hashAdminPassword(
  password: string,
  salt: Buffer = randomBytes(16)
): Promise<string> {
  const hash = await derivePassword(password, salt, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });
  return [
    "scrypt",
    "v1",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    hash.toString("base64url")
  ].join("$");
}

export async function verifyAdminPassword(
  password: string,
  encodedDigest: string
): Promise<boolean> {
  try {
    const [algorithm, version, rawN, rawR, rawP, rawSalt, rawHash] =
      encodedDigest.split("$");
    if (algorithm !== "scrypt" || version !== "v1") return false;

    const N = Number.parseInt(rawN, 10);
    const r = Number.parseInt(rawR, 10);
    const p = Number.parseInt(rawP, 10);
    const salt = Buffer.from(rawSalt, "base64url");
    const expected = Buffer.from(rawHash, "base64url");
    if (
      N !== SCRYPT_N ||
      r !== SCRYPT_R ||
      p !== SCRYPT_P ||
      salt.length < 16 ||
      expected.length !== SCRYPT_KEY_LENGTH
    ) {
      return false;
    }

    const actual = await derivePassword(password, salt, { N, r, p });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSessionToken(
  sessionSecret: string,
  now = Math.floor(Date.now() / 1000)
): string {
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(16).toString("base64url")
  }), "utf8").toString("base64url");
  return `${payload}.${signSessionPayload(payload, sessionSecret)}`;
}

export function verifySessionToken(
  token: string,
  sessionSecret: string,
  now = Math.floor(Date.now() / 1000)
): boolean {
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;
    const expected = signSessionPayload(payload, sessionSecret);
    if (!safeTextEqual(signature, expected)) return false;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      version?: number;
      issuedAt?: number;
      expiresAt?: number;
      nonce?: string;
    };
    return (
      parsed.version === 1 &&
      Number.isInteger(parsed.issuedAt) &&
      Number.isInteger(parsed.expiresAt) &&
      typeof parsed.nonce === "string" &&
      parsed.expiresAt! > now &&
      parsed.issuedAt! <= now
    );
  } catch {
    return false;
  }
}

export function createSessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    "Path=/api/admin/license",
    "HttpOnly",
    "Secure",
    "SameSite=Strict"
  ].join("; ");
}

export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Max-Age=0",
    "Path=/api/admin/license",
    "HttpOnly",
    "Secure",
    "SameSite=Strict"
  ].join("; ");
}

export function readSessionToken(request: Request): string {
  const cookie = request.headers.get("cookie") ?? "";
  for (const item of cookie.split(";")) {
    const [rawName, ...rawValue] = item.trim().split("=");
    if (rawName === SESSION_COOKIE_NAME) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return "";
}

export function hasValidSession(
  request: Request,
  sessionSecret: string,
  now = Math.floor(Date.now() / 1000)
): boolean {
  return verifySessionToken(readSessionToken(request), sessionSecret, now);
}

function derivePassword(
  password: string,
  salt: Buffer,
  options: { N: number; r: number; p: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      { ...options, maxmem: SCRYPT_MAX_MEMORY },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      }
    );
  });
}

function signSessionPayload(payload: string, sessionSecret: string): string {
  return createHmac("sha256", sessionSecret).update(payload, "utf8").digest("base64url");
}

function safeTextEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
