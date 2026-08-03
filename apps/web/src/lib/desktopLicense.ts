export type DesktopLicenseSummary = {
  licenseId: string;
  edition: string;
  features: string[];
  issuedAt: number;
  expiresAt: number;
  remainingDays: number;
};

export type DesktopLicenseStatus = {
  allowed: boolean;
  mode: "trial" | "license" | "locked" | string;
  reasonCode: string;
  reason: string;
  product: string;
  softwareName: string;
  machineId: string;
  nowUtc: number;
  trialExpiresAt?: number | null;
  trialRemainingSeconds?: number | null;
  license?: DesktopLicenseSummary | null;
  contact: {
    wechat: string;
    phone: string;
    email: string;
  };
};

export type ActivationRequest = {
  product: string;
  softwareName: string;
  machineId: string;
  appVersion: string;
  trialStatus: string;
  requestTime: number;
  requestId: string;
  requestSignature: string;
};

type TauriGlobal = {
  tauri?: { invoke?: <T>(command: string, args?: Record<string, unknown>) => Promise<T> };
  invoke?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
};

let cachedLicenseStatus: DesktopLicenseStatus | null = null;
let licenseStatusRequest: Promise<DesktopLicenseStatus> | null = null;

function getTauriApi(): TauriGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __TAURI__?: TauriGlobal }).__TAURI__;
}

export function hasDesktopLicenseApi() {
  const tauri = getTauriApi();
  return typeof (tauri?.tauri?.invoke || tauri?.invoke) === "function";
}

async function invokeLicense<T>(command: string, args?: Record<string, unknown>) {
  const tauri = getTauriApi();
  const invoke = tauri?.tauri?.invoke || tauri?.invoke;
  if (typeof invoke !== "function") {
    throw new Error("当前环境不能调用桌面授权服务。");
  }
  return invoke<T>(command, args);
}

export function getDesktopLicenseStatus(options: { force?: boolean } = {}) {
  if (licenseStatusRequest) return licenseStatusRequest;
  if (!options.force && cachedLicenseStatus) return Promise.resolve(cachedLicenseStatus);

  licenseStatusRequest = invokeLicense<DesktopLicenseStatus>("get_license_status")
    .then((status) => {
      cachedLicenseStatus = status;
      return status;
    })
    .finally(() => {
      licenseStatusRequest = null;
    });
  return licenseStatusRequest;
}

export async function activateLicenseCode(code: string) {
  const status = await invokeLicense<DesktopLicenseStatus>("activate_license_code", { code });
  cachedLicenseStatus = status;
  return status;
}

export async function activateLicenseFileContent(content: string) {
  const status = await invokeLicense<DesktopLicenseStatus>("activate_license_file_content", { content });
  cachedLicenseStatus = status;
  return status;
}

export function createActivationRequest() {
  return invokeLicense<ActivationRequest>("create_activation_request");
}
