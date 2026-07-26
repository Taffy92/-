export type LicenseDuration = 30 | 90 | 180 | 365 | "permanent";

export type LicenseResult = {
  recordId: string;
  licenseId: string;
  parentLicenseId: string | null;
  customerName: string;
  machineCode: string;
  issuedAt: number;
  previousExpiresAt: number | null;
  expiresAt: number;
  durationDays: number | null;
  permanent: boolean;
  licenseCode: string;
  licenseFileName: "license.mrx";
  licenseFileContent: string;
};

export type LicenseHistoryItem = {
  recordId: string;
  licenseId: string;
  parentLicenseId: string | null;
  customerName: string;
  maskedMachineCode: string;
  issuedAt: number;
  previousExpiresAt: number | null;
  expiresAt: number;
  durationDays: number | null;
  permanent: boolean;
  licenseCode: string;
  remark: string;
  createdAt: number;
  status: "active" | "expired";
};

export type LicenseHistoryPage = {
  page: number;
  pageSize: number;
  total: number;
  items: LicenseHistoryItem[];
};

export type LicenseDraft = {
  customerName: string;
  machineCode: string;
  duration: LicenseDuration;
  remark: string;
  parentRecordId: string | null;
  renewalMachineCode: string;
};
