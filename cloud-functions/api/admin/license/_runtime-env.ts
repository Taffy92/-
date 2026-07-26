const LICENSE_ENV_KEYS = [
  "LICENSE_ADMIN_PASSWORD_SCRYPT",
  "LICENSE_PRIVATE_KEY_PEM_B64",
  "LICENSE_SESSION_SECRET_B64",
  "LICENSE_RECORD_ENCRYPTION_KEY_B64",
] as const;

export type EdgeOneLicenseEnv = Partial<
  Record<(typeof LICENSE_ENV_KEYS)[number], string>
>;

export function applyRuntimeEnv(env: EdgeOneLicenseEnv | undefined): void {
  for (const key of LICENSE_ENV_KEYS) {
    const value = env?.[key];
    if (typeof value === "string" && value) {
      process.env[key] = value;
    }
  }
}
