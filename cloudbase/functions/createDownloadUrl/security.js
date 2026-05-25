const crypto = require("crypto");

function parseAllowedOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

function normalizeOrigin(origin) {
  const raw = String(origin || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function getRequestOrigin(req) {
  return normalizeOrigin(req && req.headers ? req.headers.origin || "" : "");
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  if (!allowedOrigins.length) return false;
  return allowedOrigins.includes(origin);
}

function buildCorsHeaders(req, allowedOrigins) {
  const origin = getRequestOrigin(req);
  const headers = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function normalizePackageType(value) {
  const normalized = String(value || "exe").trim().toLowerCase();
  if (normalized === "exe" || normalized === "msi") return normalized;
  return null;
}

function passwordMatches(input, expected) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

module.exports = {
  parseAllowedOrigins,
  normalizeOrigin,
  getRequestOrigin,
  isOriginAllowed,
  buildCorsHeaders,
  normalizePackageType,
  passwordMatches
};
