export type LicenseDuration = number | "permanent";

export type LicensePayload = {
  license_id: string;
  product: string;
  software_name: string;
  machine_id: string;
  issued_at: number;
  expires_at: number;
  edition: string;
  features: string[];
};

export type LicenseEnvelope = {
  version: "ufc-license-v1";
  payload: LicensePayload;
  signature: string;
};

export type ActivationRequest = {
  product: string;
  softwareName?: string;
  software_name?: string;
  machineId?: string;
  machine_id?: string;
  appVersion?: string;
  app_version?: string;
  trialStatus?: string;
  trial_status?: string;
  requestTime?: number;
  request_time?: number;
  requestId?: string;
  request_id?: string;
  requestSignature?: string;
  request_signature?: string;
};

export type GenerateLicenseInput = {
  privateKeyPem: string;
  machineCode: string;
  duration: LicenseDuration;
  now?: number;
  previousExpiresAt?: number;
  licenseId?: string;
};

export type GeneratedLicense = {
  machineCode: string;
  issuedAt: number;
  expiresAt: number;
  licenseCode: string;
  licenseFileName: "license.mrx";
  licenseFileContent: string;
  envelope: LicenseEnvelope;
};
