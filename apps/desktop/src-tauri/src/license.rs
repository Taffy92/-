use base64::{
  engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD},
  Engine as _
};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
  env,
  fs,
  path::{Path, PathBuf},
  process::Command,
  time::{SystemTime, UNIX_EPOCH}
};
use tauri::AppHandle;
use winreg::{enums::*, RegKey};

const PRODUCT: &str = "UNIVERSAL_FORMAT_CONVERTER_OFFLINE_PRO";
const SOFTWARE_NAME: &str = "万能格式转换器离线专业版";
const APP_DIR_NAME: &str = "UniversalFormatConverterOfflinePro";
const TRIAL_FILE_NAME: &str = "trial.dat";
const LICENSE_FILE_NAME: &str = "license.mrx";
const REGISTRY_PATH: &str = "Software\\UniversalFormatConverterOfflinePro\\Trial";
const TRIAL_SECONDS: u64 = 3 * 24 * 60 * 60;
const TIME_ROLLBACK_GRACE: u64 = 5 * 60;
const LICENSE_CODE_PREFIX: &str = "UFC1-";
const LOCAL_TRIAL_KEY_CONTEXT: &str = "ufc-local-trial-v1";

const PUBLIC_KEY_RAW_B64: &str = "qWYN9p6oQy5Qr0xaDmf8CGR3jOrA/TXNg6EkLPhdTSM=";

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseStatus {
  allowed: bool,
  mode: String,
  reason_code: String,
  reason: String,
  product: String,
  software_name: String,
  machine_id: String,
  now_utc: u64,
  trial_expires_at: Option<u64>,
  trial_remaining_seconds: Option<u64>,
  license: Option<LicenseSummary>,
  contact: ContactInfo
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseSummary {
  license_id: String,
  edition: String,
  features: Vec<String>,
  issued_at: u64,
  expires_at: u64,
  remaining_days: u64
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ContactInfo {
  wechat: String,
  phone: String,
  email: String
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
struct LicensePayload {
  license_id: String,
  product: String,
  software_name: String,
  machine_id: String,
  issued_at: u64,
  expires_at: u64,
  edition: String,
  features: Vec<String>
}

#[derive(Debug, Serialize, Deserialize)]
struct LicenseEnvelope {
  version: String,
  payload: LicensePayload,
  signature: String
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
struct TrialPayload {
  product: String,
  machine_id: String,
  first_run_time: u64,
  trial_expires_at: u64,
  last_success_run_time: u64,
  trial_status: String
}

#[derive(Debug, Serialize, Deserialize)]
struct TrialRecord {
  version: String,
  data: String,
  hmac: String
}

#[derive(Debug, Serialize, Deserialize)]
struct LegacyTrialRecord {
  version: String,
  payload: TrialPayload,
  hmac: String
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivationRequest {
  product: String,
  software_name: String,
  machine_id: String,
  app_version: String,
  trial_status: String,
  request_time: u64,
  request_id: String,
  request_signature: String
}

enum StoredLicense {
  Missing,
  Valid(LicensePayload),
  Invalid(String, String),
  Expired(LicensePayload)
}

enum TrialDecision {
  Active(TrialPayload),
  Locked(String, String, Option<u64>)
}

enum TrialSource {
  Valid(TrialPayload),
  Invalid
}

#[tauri::command]
pub fn get_license_status(app: AppHandle) -> LicenseStatus {
  evaluate_license_status(&app, true)
}

#[tauri::command]
pub fn activate_license_code(app: AppHandle, code: String) -> LicenseStatus {
  activate_license_blob(&app, &code)
}

#[tauri::command]
pub fn activate_license_file_content(app: AppHandle, content: String) -> LicenseStatus {
  activate_license_blob(&app, &content)
}

#[tauri::command]
pub fn create_activation_request(app: AppHandle) -> ActivationRequest {
  let machine_id = machine_id();
  let now = now_utc();
  let status = evaluate_license_status(&app, false);
  let mut request = ActivationRequest {
    product: PRODUCT.to_string(),
    software_name: SOFTWARE_NAME.to_string(),
    machine_id: machine_id.clone(),
    app_version: app.package_info().version.to_string(),
    trial_status: status.mode,
    request_time: now,
    request_id: format!("REQ-{now}-{machine_id}"),
    request_signature: String::new()
  };
  request.request_signature = activation_request_hmac(&request, &machine_id);
  request
}

pub fn require_license_allowed(app: &AppHandle) -> Result<(), String> {
  let status = evaluate_license_status(app, true);
  if status.allowed {
    Ok(())
  } else {
    Err(status.reason)
  }
}

fn activate_license_blob(_app: &AppHandle, blob: &str) -> LicenseStatus {
  let machine_id = machine_id();
  let now = now_utc();
  match parse_and_verify_license(blob, &machine_id, now) {
    StoredLicense::Valid(payload) => {
      if let Err(message) = save_license_blob(blob) {
        return locked_status(machine_id, now, "license_save_failed", &message, None, None);
      }
      let _ = touch_trial_success(&machine_id, now);
      allowed_license_status(machine_id, now, payload)
    }
    StoredLicense::Expired(payload) => locked_status(
      machine_id,
      now,
      "license_expired",
      "授权已过期，请联系管理员续费。",
      None,
      Some(payload)
    ),
    StoredLicense::Invalid(code, message) => locked_status(machine_id, now, &code, &message, None, None),
    StoredLicense::Missing => locked_status(machine_id, now, "license_format_error", "授权码或授权文件格式错误。", None, None)
  }
}

fn evaluate_license_status(_app: &AppHandle, update_success_time: bool) -> LicenseStatus {
  let machine_id = machine_id();
  let now = now_utc();

  match read_stored_license(&machine_id, now) {
    StoredLicense::Valid(payload) => {
      if has_time_rollback(&machine_id, now) {
        return locked_status(
          machine_id,
          now,
          "time_rollback",
          "检测到系统时间异常，请恢复正确时间或联系管理员。",
          None,
          Some(payload)
        );
      }
      if update_success_time {
        update_license_clock(&machine_id, now);
      }
      return allowed_license_status(machine_id, now, payload);
    }
    StoredLicense::Expired(payload) => {
      return locked_status(
        machine_id,
        now,
        "license_expired",
        "授权已过期，请联系管理员续费。",
        None,
        Some(payload)
      );
    }
    StoredLicense::Invalid(code, message) => {
      return locked_status(machine_id, now, &code, &message, None, None);
    }
    StoredLicense::Missing => {}
  }

  match evaluate_trial(&machine_id, now, update_success_time) {
    TrialDecision::Active(payload) => allowed_trial_status(machine_id, now, payload),
    TrialDecision::Locked(code, message, expires_at) => locked_status(machine_id, now, &code, &message, expires_at, None)
  }
}

fn read_stored_license(machine_id: &str, now: u64) -> StoredLicense {
  let Some(blob) = read_license_blob() else {
    return StoredLicense::Missing;
  };
  parse_and_verify_license(&blob, machine_id, now)
}

fn parse_and_verify_license(blob: &str, machine_id: &str, now: u64) -> StoredLicense {
  let trimmed = blob.trim();
  if trimmed.is_empty() {
    return StoredLicense::Missing;
  }

  let envelope_text = if let Some(encoded) = trimmed.strip_prefix(LICENSE_CODE_PREFIX) {
    match URL_SAFE_NO_PAD.decode(encoded.trim()) {
      Ok(bytes) => match String::from_utf8(bytes) {
        Ok(value) => value,
        Err(_) => {
          return StoredLicense::Invalid("license_format_error".to_string(), "授权码格式错误。".to_string());
        }
      },
      Err(_) => {
        return StoredLicense::Invalid("license_format_error".to_string(), "授权码格式错误。".to_string());
      }
    }
  } else {
    trimmed.to_string()
  };

  let envelope: LicenseEnvelope = match serde_json::from_str(&envelope_text) {
    Ok(value) => value,
    Err(_) => {
      return StoredLicense::Invalid("license_format_error".to_string(), "授权码或授权文件格式错误。".to_string());
    }
  };

  if envelope.version != "ufc-license-v1" {
    return StoredLicense::Invalid("license_format_error".to_string(), "授权版本不受支持。".to_string());
  }

  if !verify_license_signature(&envelope.payload, &envelope.signature) {
    return StoredLicense::Invalid("license_invalid".to_string(), "授权签名无效，授权码或授权文件可能被修改。".to_string());
  }
  if envelope.payload.product != PRODUCT {
    return StoredLicense::Invalid("product_mismatch".to_string(), "授权不属于当前产品。".to_string());
  }
  if envelope.payload.machine_id != machine_id {
    return StoredLicense::Invalid("machine_mismatch".to_string(), "授权不属于当前设备。".to_string());
  }
  if envelope.payload.expires_at <= now {
    return StoredLicense::Expired(envelope.payload);
  }
  if envelope.payload.features.is_empty() {
    return StoredLicense::Invalid("features_invalid".to_string(), "授权功能为空。".to_string());
  }

  StoredLicense::Valid(envelope.payload)
}

fn verify_license_signature(payload: &LicensePayload, signature_text: &str) -> bool {
  let Ok(public_bytes) = STANDARD.decode(PUBLIC_KEY_RAW_B64) else {
    return false;
  };
  let Ok(public_key_bytes) = <[u8; 32]>::try_from(public_bytes.as_slice()) else {
    return false;
  };
  let Ok(verifying_key) = VerifyingKey::from_bytes(&public_key_bytes) else {
    return false;
  };
  let Ok(signature_bytes) = URL_SAFE_NO_PAD.decode(signature_text.trim()) else {
    return false;
  };
  let Ok(signature) = Signature::from_slice(&signature_bytes) else {
    return false;
  };
  verifying_key
    .verify(canonical_license_payload(payload).as_bytes(), &signature)
    .is_ok()
}

fn canonical_license_payload(payload: &LicensePayload) -> String {
  format!(
    "license_id={}\nproduct={}\nsoftware_name={}\nmachine_id={}\nissued_at={}\nexpires_at={}\nedition={}\nfeatures={}",
    payload.license_id,
    payload.product,
    payload.software_name,
    payload.machine_id,
    payload.issued_at,
    payload.expires_at,
    payload.edition,
    payload.features.join(",")
  )
}

fn evaluate_trial(machine_id: &str, now: u64, update_success_time: bool) -> TrialDecision {
  let sources = read_trial_sources(machine_id);
  let had_sources = !sources.is_empty();
  if sources.iter().any(|source| matches!(source, TrialSource::Invalid)) {
    return TrialDecision::Locked(
      "trial_tampered".to_string(),
      "本地试用记录异常或被修改，请联系管理员激活。".to_string(),
      None
    );
  }

  let valid_payloads: Vec<TrialPayload> = sources
    .into_iter()
    .filter_map(|source| match source {
      TrialSource::Valid(payload) => Some(payload),
      TrialSource::Invalid => None
    })
    .collect();

  let payload = if valid_payloads.is_empty() {
    TrialPayload {
      product: PRODUCT.to_string(),
      machine_id: machine_id.to_string(),
      first_run_time: now,
      trial_expires_at: now + TRIAL_SECONDS,
      last_success_run_time: now,
      trial_status: "active".to_string()
    }
  } else {
    merge_trial_payloads(valid_payloads)
  };

  if payload.last_success_run_time > now.saturating_add(TIME_ROLLBACK_GRACE) {
    return TrialDecision::Locked(
      "time_rollback".to_string(),
      "检测到系统时间异常，请恢复正确时间或联系管理员。".to_string(),
      Some(payload.trial_expires_at)
    );
  }

  if now > payload.trial_expires_at {
    return TrialDecision::Locked(
      "trial_expired".to_string(),
      "3 天试用已结束，请联系管理员获取正式授权。".to_string(),
      Some(payload.trial_expires_at)
    );
  }

  let mut final_payload = payload.clone();
  if update_success_time {
    final_payload.last_success_run_time = now;
    let _ = write_trial_payload(&final_payload);
  } else if !had_sources {
    let _ = write_trial_payload(&final_payload);
  }

  TrialDecision::Active(final_payload)
}

fn read_trial_sources(machine_id: &str) -> Vec<TrialSource> {
  let mut sources = Vec::new();
  for path in trial_file_paths() {
    if let Some(text) = read_existing_text_file(&path) {
      sources.push(match parse_trial_record(&text, machine_id) {
        Some(payload) => TrialSource::Valid(payload),
        None => TrialSource::Invalid
      });
    }
  }
  if let Some(text) = read_trial_registry() {
    sources.push(match parse_trial_record(&text, machine_id) {
      Some(payload) => TrialSource::Valid(payload),
      None => TrialSource::Invalid
    });
  }
  sources
}

fn parse_trial_record(text: &str, machine_id: &str) -> Option<TrialPayload> {
  let record: TrialRecord = match serde_json::from_str(text) {
    Ok(value) => value,
    Err(_) => return parse_legacy_trial_record(text, machine_id)
  };
  if record.version != "ufc-trial-v1" {
    return None;
  }
  let payload = decode_trial_payload(&record.data, machine_id)?;
  if payload.product != PRODUCT || payload.machine_id != machine_id {
    return None;
  }
  let expected = trial_hmac(&payload);
  if !constant_time_eq(expected.as_bytes(), record.hmac.as_bytes()) {
    return None;
  }
  Some(payload)
}

fn parse_legacy_trial_record(text: &str, machine_id: &str) -> Option<TrialPayload> {
  let record: LegacyTrialRecord = serde_json::from_str(text).ok()?;
  if record.version != "ufc-trial-v1" {
    return None;
  }
  if record.payload.product != PRODUCT || record.payload.machine_id != machine_id {
    return None;
  }
  let expected = trial_hmac(&record.payload);
  if !constant_time_eq(expected.as_bytes(), record.hmac.as_bytes()) {
    return None;
  }
  Some(record.payload)
}

fn merge_trial_payloads(payloads: Vec<TrialPayload>) -> TrialPayload {
  let first_run_time = payloads.iter().map(|payload| payload.first_run_time).min().unwrap_or_else(now_utc);
  let last_success_run_time = payloads
    .iter()
    .map(|payload| payload.last_success_run_time)
    .max()
    .unwrap_or(first_run_time);
  TrialPayload {
    product: PRODUCT.to_string(),
    machine_id: payloads
      .first()
      .map(|payload| payload.machine_id.clone())
      .unwrap_or_default(),
    first_run_time,
    trial_expires_at: first_run_time + TRIAL_SECONDS,
    last_success_run_time,
    trial_status: "active".to_string()
  }
}

fn touch_trial_success(machine_id: &str, now: u64) -> Result<(), String> {
  match evaluate_trial(machine_id, now, false) {
    TrialDecision::Active(mut payload) => {
      payload.last_success_run_time = now;
      write_trial_payload(&payload);
      Ok(())
    }
    TrialDecision::Locked(_, _, _) => Ok(())
  }
}

fn has_time_rollback(machine_id: &str, now: u64) -> bool {
  read_valid_trial_payloads(machine_id)
    .into_iter()
    .map(|payload| payload.last_success_run_time)
    .max()
    .is_some_and(|last_success_run_time| last_success_run_time > now.saturating_add(TIME_ROLLBACK_GRACE))
}

fn update_license_clock(machine_id: &str, now: u64) {
  let payloads = read_valid_trial_payloads(machine_id);
  let mut payload = if payloads.is_empty() {
    TrialPayload {
      product: PRODUCT.to_string(),
      machine_id: machine_id.to_string(),
      first_run_time: now,
      trial_expires_at: now + TRIAL_SECONDS,
      last_success_run_time: now,
      trial_status: "active".to_string()
    }
  } else {
    merge_trial_payloads(payloads)
  };
  payload.last_success_run_time = now;
  write_trial_payload(&payload);
}

fn read_valid_trial_payloads(machine_id: &str) -> Vec<TrialPayload> {
  read_trial_sources(machine_id)
    .into_iter()
    .filter_map(|source| match source {
      TrialSource::Valid(payload) => Some(payload),
      TrialSource::Invalid => None
    })
    .collect()
}

fn write_trial_payload(payload: &TrialPayload) {
  let record = TrialRecord {
    version: "ufc-trial-v1".to_string(),
    data: encode_trial_payload(payload),
    hmac: trial_hmac(payload)
  };
  let Ok(text) = serde_json::to_string(&record) else {
    return;
  };

  for path in trial_file_paths() {
    let _ = write_text_file(&path, &text);
  }
  let _ = write_trial_registry(&text);
}

fn trial_hmac(payload: &TrialPayload) -> String {
  let mut mac = HmacSha256::new_from_slice(trial_hmac_key(&payload.machine_id).as_slice())
    .expect("HMAC accepts keys of any size");
  mac.update(canonical_trial_payload(payload).as_bytes());
  to_upper_hex(&mac.finalize().into_bytes())
}

fn activation_request_hmac(request: &ActivationRequest, machine_id: &str) -> String {
  let mut mac = HmacSha256::new_from_slice(trial_hmac_key(machine_id).as_slice())
    .expect("HMAC accepts keys of any size");
  mac.update(canonical_activation_request(request).as_bytes());
  URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes())
}

fn trial_hmac_key(machine_id: &str) -> Vec<u8> {
  let mut hasher = Sha256::new();
  hasher.update(PRODUCT.as_bytes());
  hasher.update(b"|trial|");
  hasher.update(machine_id.as_bytes());
  hasher.update(b"|");
  hasher.update(LOCAL_TRIAL_KEY_CONTEXT.as_bytes());
  hasher.finalize().to_vec()
}

fn encode_trial_payload(payload: &TrialPayload) -> String {
  let plaintext = serde_json::to_vec(payload).unwrap_or_default();
  let keystream = local_keystream(&payload.machine_id, plaintext.len());
  let encoded: Vec<u8> = plaintext
    .iter()
    .zip(keystream.iter())
    .map(|(left, right)| left ^ right)
    .collect();
  URL_SAFE_NO_PAD.encode(encoded)
}

fn decode_trial_payload(data: &str, machine_id: &str) -> Option<TrialPayload> {
  let encrypted = URL_SAFE_NO_PAD.decode(data).ok()?;
  let keystream = local_keystream(machine_id, encrypted.len());
  let plaintext: Vec<u8> = encrypted
    .iter()
    .zip(keystream.iter())
    .map(|(left, right)| left ^ right)
    .collect();
  serde_json::from_slice(&plaintext).ok()
}

fn local_keystream(machine_id: &str, len: usize) -> Vec<u8> {
  let mut stream = Vec::with_capacity(len);
  let mut counter = 0_u64;
  while stream.len() < len {
    let mut hasher = Sha256::new();
    hasher.update(PRODUCT.as_bytes());
    hasher.update(b"|trial-stream|");
    hasher.update(machine_id.as_bytes());
    hasher.update(b"|");
    hasher.update(LOCAL_TRIAL_KEY_CONTEXT.as_bytes());
    hasher.update(counter.to_le_bytes());
    stream.extend_from_slice(&hasher.finalize());
    counter += 1;
  }
  stream.truncate(len);
  stream
}

fn canonical_trial_payload(payload: &TrialPayload) -> String {
  format!(
    "product={}\nmachine_id={}\nfirst_run_time={}\ntrial_expires_at={}\nlast_success_run_time={}\ntrial_status={}",
    payload.product,
    payload.machine_id,
    payload.first_run_time,
    payload.trial_expires_at,
    payload.last_success_run_time,
    payload.trial_status
  )
}

fn canonical_activation_request(request: &ActivationRequest) -> String {
  format!(
    "product={}\nsoftware_name={}\nmachine_id={}\napp_version={}\ntrial_status={}\nrequest_time={}\nrequest_id={}",
    request.product,
    request.software_name,
    request.machine_id,
    request.app_version,
    request.trial_status,
    request.request_time,
    request.request_id
  )
}

fn allowed_trial_status(machine_id: String, now: u64, payload: TrialPayload) -> LicenseStatus {
  LicenseStatus {
    allowed: true,
    mode: "trial".to_string(),
    reason_code: "trial_active".to_string(),
    reason: "3 天试用中。".to_string(),
    product: PRODUCT.to_string(),
    software_name: SOFTWARE_NAME.to_string(),
    machine_id,
    now_utc: now,
    trial_expires_at: Some(payload.trial_expires_at),
    trial_remaining_seconds: Some(payload.trial_expires_at.saturating_sub(now)),
    license: None,
    contact: contact_info()
  }
}

fn allowed_license_status(machine_id: String, now: u64, payload: LicensePayload) -> LicenseStatus {
  let remaining_seconds = payload.expires_at.saturating_sub(now);
  LicenseStatus {
    allowed: true,
    mode: "license".to_string(),
    reason_code: "license_active".to_string(),
    reason: "授权有效。".to_string(),
    product: PRODUCT.to_string(),
    software_name: SOFTWARE_NAME.to_string(),
    machine_id,
    now_utc: now,
    trial_expires_at: None,
    trial_remaining_seconds: None,
    license: Some(license_summary(&payload, remaining_seconds)),
    contact: contact_info()
  }
}

fn locked_status(
  machine_id: String,
  now: u64,
  reason_code: &str,
  reason: &str,
  trial_expires_at: Option<u64>,
  license_payload: Option<LicensePayload>
) -> LicenseStatus {
  LicenseStatus {
    allowed: false,
    mode: "locked".to_string(),
    reason_code: reason_code.to_string(),
    reason: reason.to_string(),
    product: PRODUCT.to_string(),
    software_name: SOFTWARE_NAME.to_string(),
    machine_id,
    now_utc: now,
    trial_expires_at,
    trial_remaining_seconds: trial_expires_at.map(|expires_at| expires_at.saturating_sub(now)),
    license: license_payload
      .as_ref()
      .map(|payload| license_summary(payload, payload.expires_at.saturating_sub(now))),
    contact: contact_info()
  }
}

fn license_summary(payload: &LicensePayload, remaining_seconds: u64) -> LicenseSummary {
  LicenseSummary {
    license_id: payload.license_id.clone(),
    edition: payload.edition.clone(),
    features: payload.features.clone(),
    issued_at: payload.issued_at,
    expires_at: payload.expires_at,
    remaining_days: (remaining_seconds + 86_399) / 86_400
  }
}

fn contact_info() -> ContactInfo {
  ContactInfo {
    wechat: "___Skyblue".to_string(),
    phone: "15588261515".to_string(),
    email: "370298218@qq.com".to_string()
  }
}

fn save_license_blob(blob: &str) -> Result<(), String> {
  let path = license_file_path().ok_or_else(|| "无法定位授权保存目录。".to_string())?;
  write_text_file(&path, blob.trim()).map_err(|_| "授权保存失败，请检查当前用户 AppData 写入权限。".to_string())
}

fn read_license_blob() -> Option<String> {
  let path = license_file_path()?;
  read_existing_text_file(&path)
}

fn license_file_path() -> Option<PathBuf> {
  Some(appdata_app_dir()?.join(LICENSE_FILE_NAME))
}

fn trial_file_paths() -> Vec<PathBuf> {
  let mut paths = Vec::new();
  if let Some(path) = programdata_app_dir() {
    paths.push(path.join(TRIAL_FILE_NAME));
  }
  if let Some(path) = appdata_app_dir() {
    paths.push(path.join(TRIAL_FILE_NAME));
  }
  paths
}

fn appdata_app_dir() -> Option<PathBuf> {
  env::var_os("APPDATA").map(|value| PathBuf::from(value).join(APP_DIR_NAME))
}

fn programdata_app_dir() -> Option<PathBuf> {
  env::var_os("PROGRAMDATA").map(|value| PathBuf::from(value).join(APP_DIR_NAME))
}

fn read_existing_text_file(path: &Path) -> Option<String> {
  if !path.exists() {
    return None;
  }
  fs::read_to_string(path).ok()
}

fn write_text_file(path: &Path, text: &str) -> std::io::Result<()> {
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent)?;
  }
  fs::write(path, text)
}

fn read_trial_registry() -> Option<String> {
  let hkcu = RegKey::predef(HKEY_CURRENT_USER);
  let key = hkcu.open_subkey(REGISTRY_PATH).ok()?;
  key.get_value("record").ok()
}

fn write_trial_registry(text: &str) -> Result<(), String> {
  let hkcu = RegKey::predef(HKEY_CURRENT_USER);
  let (key, _) = hkcu.create_subkey(REGISTRY_PATH).map_err(|_| "无法写入试用注册表记录。".to_string())?;
  key.set_value("record", &text).map_err(|_| "无法写入试用注册表记录。".to_string())
}

fn machine_id() -> String {
  let mut factors = Vec::new();
  if let Some(value) = read_machine_guid() {
    push_machine_factor(&mut factors, "machine_guid", &value);
  }
  if let Some(value) = wmic_value(&["csproduct", "get", "uuid", "/value"], "UUID") {
    push_machine_factor(&mut factors, "board_uuid", &value);
  }
  if let Some(value) = wmic_value(&["cpu", "get", "processorid", "/value"], "ProcessorId") {
    push_machine_factor(&mut factors, "cpu", &value);
  }
  if let Some(value) = wmic_value(&["diskdrive", "get", "serialnumber", "/value"], "SerialNumber") {
    push_machine_factor(&mut factors, "disk", &value);
  }
  if let Ok(value) = env::var("COMPUTERNAME") {
    push_machine_factor(&mut factors, "computer", &value);
  }

  if factors.is_empty() {
    factors.push("fallback=unavailable".to_string());
  }
  factors.sort();

  let mut hasher = Sha256::new();
  hasher.update(PRODUCT.as_bytes());
  hasher.update(b"|machine|");
  hasher.update(factors.join("|").as_bytes());
  let digest = hasher.finalize();
  short_code(&digest[..16])
}

fn push_machine_factor(factors: &mut Vec<String>, key: &str, value: &str) {
  let normalized = normalize_factor(value);
  if !normalized.is_empty() {
    factors.push(format!("{key}={normalized}"));
  }
}

fn read_machine_guid() -> Option<String> {
  let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
  let key = hklm.open_subkey("SOFTWARE\\Microsoft\\Cryptography").ok()?;
  key.get_value("MachineGuid").ok()
}

fn wmic_value(args: &[&str], key: &str) -> Option<String> {
  let output = Command::new("wmic")
    .args(args)
    .output()
    .ok()?;
  if !output.status.success() {
    return None;
  }
  let stdout = String::from_utf8_lossy(&output.stdout);
  let prefix = format!("{key}=");
  for line in stdout.lines() {
    let trimmed = line.trim();
    if let Some(value) = trimmed.strip_prefix(&prefix) {
      let normalized = normalize_factor(value);
      if !normalized.is_empty() {
        return Some(normalized);
      }
    }
  }
  None
}

fn normalize_factor(value: &str) -> String {
  value.trim().to_ascii_uppercase().replace([' ', '\t', '\r', '\n'], "")
}

fn short_code(bytes: &[u8]) -> String {
  const ALPHABET: &[u8; 32] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let mut chars = String::with_capacity(16);
  for byte in bytes.iter().take(16) {
    chars.push(ALPHABET[(byte & 31) as usize] as char);
  }
  chars
    .as_bytes()
    .chunks(4)
    .map(|chunk| String::from_utf8_lossy(chunk).to_string())
    .collect::<Vec<_>>()
    .join("-")
}

fn now_utc() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|value| value.as_secs())
    .unwrap_or(0)
}

fn to_upper_hex(bytes: &[u8]) -> String {
  const HEX: &[u8; 16] = b"0123456789ABCDEF";
  let mut output = String::with_capacity(bytes.len() * 2);
  for byte in bytes {
    output.push(HEX[(byte >> 4) as usize] as char);
    output.push(HEX[(byte & 0x0F) as usize] as char);
  }
  output
}

fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
  if left.len() != right.len() {
    return false;
  }
  let mut diff = 0u8;
  for (a, b) in left.iter().zip(right.iter()) {
    diff |= a ^ b;
  }
  diff == 0
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn verifies_license_code_generated_by_admin_tool() {
    let code = "UFC1-eyJ2ZXJzaW9uIjoidWZjLWxpY2Vuc2UtdjEiLCJwYXlsb2FkIjp7ImxpY2Vuc2VfaWQiOiJMSUMtVEVTVCIsInByb2R1Y3QiOiJVTklWRVJTQUxfRk9STUFUX0NPTlZFUlRFUl9PRkZMSU5FX1BSTyIsInNvZnR3YXJlX25hbWUiOiLkuIfog73moLzlvI_ovazmjaLlmajnprvnur_kuJPkuJrniYgiLCJtYWNoaW5lX2lkIjoiVEVTVC1URVNULVRFU1QtVEVTVCIsImlzc3VlZF9hdCI6MTcwMDAwMDAwMCwiZXhwaXJlc19hdCI6NDEwMjQ0NDgwMCwiZWRpdGlvbiI6InBybyIsImZlYXR1cmVzIjpbImJhc2ljIiwiY29udmVydCIsImV4cG9ydCIsImJhdGNoIl19LCJzaWduYXR1cmUiOiJPdjFXODJmS09hMVdIdGY0Q3Vic2ZuZWZUZlJHWThUckZQdFRDNVV1RWtzSV9ZWDV6YV9VOUZoR2UtR2I0UTd2NVFOclBab1k4R2ZaS1habFdNY1pBZyJ9";

    match parse_and_verify_license(code, "TEST-TEST-TEST-TEST", 1_700_000_001) {
      StoredLicense::Valid(payload) => {
        assert_eq!(payload.license_id, "LIC-TEST");
        assert_eq!(payload.product, PRODUCT);
        assert_eq!(payload.machine_id, "TEST-TEST-TEST-TEST");
      }
      _ => panic!("expected the fixed admin-generated license code to verify")
    }
  }

  #[test]
  fn formats_machine_code_as_four_blocks() {
    assert_eq!(short_code(&[0; 16]), "AAAA-AAAA-AAAA-AAAA");
    assert_eq!(short_code(&[31; 16]), "9999-9999-9999-9999");
  }

  #[test]
  fn normalizes_and_skips_empty_machine_factors() {
    let mut factors = Vec::new();

    push_machine_factor(&mut factors, "cpu", " ab cd\t\r\n");
    push_machine_factor(&mut factors, "disk", "  ");

    assert_eq!(factors, vec!["cpu=ABCD"]);
  }

  #[test]
  fn stores_trial_record_without_plaintext_payload() {
    let payload = TrialPayload {
      product: PRODUCT.to_string(),
      machine_id: "TEST-TEST-TEST-TEST".to_string(),
      first_run_time: 1_700_000_000,
      trial_expires_at: 1_700_259_200,
      last_success_run_time: 1_700_000_100,
      trial_status: "active".to_string()
    };
    let record = TrialRecord {
      version: "ufc-trial-v1".to_string(),
      data: encode_trial_payload(&payload),
      hmac: trial_hmac(&payload)
    };

    let text = serde_json::to_string(&record).expect("trial record serializes");

    assert!(!text.contains("first_run_time"));
    assert!(!text.contains("1700000000"));
    assert_eq!(parse_trial_record(&text, &payload.machine_id), Some(payload));
  }
}
