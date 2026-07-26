export type LicenseAdminConfig = {
  passwordDigest: string;
  privateKeyPem: string;
  sessionSecret: string;
  recordEncryptionKey: Buffer;
};

export function readLicenseAdminConfig(
  env: NodeJS.ProcessEnv = process.env
): LicenseAdminConfig {
  const passwordDigest = env.LICENSE_ADMIN_PASSWORD_SCRYPT ?? "";
  const privateKeyPem = decodeText(env.LICENSE_PRIVATE_KEY_PEM_B64);
  const sessionSecret = decodeText(env.LICENSE_SESSION_SECRET_B64);
  const recordEncryptionKey = decodeBytes(env.LICENSE_RECORD_ENCRYPTION_KEY_B64);

  if (
    !passwordDigest ||
    !privateKeyPem ||
    Buffer.byteLength(sessionSecret, "utf8") < 32 ||
    recordEncryptionKey.length !== 32
  ) {
    throw new Error("LICENSE_ADMIN_NOT_CONFIGURED");
  }

  return {
    passwordDigest,
    privateKeyPem,
    sessionSecret,
    recordEncryptionKey
  };
}

function decodeText(value: string | undefined): string {
  if (!value) return "";
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function decodeBytes(value: string | undefined): Buffer {
  if (!value) return Buffer.alloc(0);
  try {
    return Buffer.from(value, "base64");
  } catch {
    return Buffer.alloc(0);
  }
}
