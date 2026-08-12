use crate::license;
use serde::{Deserialize, Serialize};
use std::{
  fs,
  path::{Component, Path, PathBuf},
  process::{Command, Stdio},
  time::{SystemTime, UNIX_EPOCH}
};
use tauri::{AppHandle, Manager};

const SUPPORTED_EXTENSIONS: &[&str] = &["docx", "xlsx", "csv"];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibreOfficeCheck {
  configured: bool,
  status: String,
  message: String,
  version: Option<String>
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OfficePdfRequest {
  input_path: String
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OfficePdfResult {
  pdf_path: String,
  backend: String,
  version: String
}

#[tauri::command]
pub fn check_libreoffice(app: AppHandle) -> LibreOfficeCheck {
  let executable = resolve_libreoffice_file(&app, "program/soffice.com");
  let manifest = resolve_libreoffice_file(&app, "manifest.json");
  let version = manifest
    .and_then(|path| fs::read_to_string(path).ok())
    .and_then(|content| serde_json::from_str::<serde_json::Value>(&content).ok())
    .and_then(|value| value.get("version").and_then(|value| value.as_str()).map(str::to_string));
  let configured = executable.is_some() && version.is_some();

  LibreOfficeCheck {
    configured,
    status: if configured { "libreoffice_ready" } else { "libreoffice_missing" }.to_string(),
    message: if configured {
      "LibreOffice 本地组件可用，Word/Excel 将优先使用原生排版转换。".to_string()
    } else {
      "离线版缺少 LibreOffice 组件，不能保证 Word/Excel 原生排版还原。请重新准备安装包。".to_string()
    },
    version
  }
}

#[tauri::command]
pub fn convert_office_to_pdf(app: AppHandle, request: OfficePdfRequest) -> Result<OfficePdfResult, String> {
  license::require_license_allowed(&app)?;
  let input = validate_input_path(&app, &request.input_path)?;
  let executable = resolve_libreoffice_file(&app, "program/soffice.com")
    .ok_or_else(|| "离线版缺少 LibreOffice 组件，请重新安装完整版本。".to_string())?;
  let version = check_libreoffice(app.clone()).version.unwrap_or_else(|| "unknown".to_string());
  let work_dir = create_work_dir()?;
  let profile_dir = work_dir.join("profile");
  fs::create_dir_all(&profile_dir).map_err(|_| "无法创建 LibreOffice 本地工作目录。".to_string())?;
  let user_installation = file_url(&profile_dir);

  let output = Command::new(&executable)
    .args([
      "--headless",
      "--invisible",
      "--nodefault",
      "--nologo",
      "--nolockcheck",
      "--norestore",
      &format!("-env:UserInstallation={user_installation}"),
      "--convert-to",
      "pdf",
      "--outdir",
      &work_dir.to_string_lossy(),
      &input.to_string_lossy()
    ])
    .current_dir(executable.parent().unwrap_or(&work_dir))
    .stdin(Stdio::null())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .output()
    .map_err(|_| "无法启动 LibreOffice 本地转换组件。".to_string())?;

  let output_path = work_dir.join(
    input
      .file_stem()
      .and_then(|value| value.to_str())
      .unwrap_or("document")
      .to_string()
      + ".pdf"
  );
  if !output.status.success() || !output_path.is_file() {
    let _ = fs::remove_dir_all(&work_dir);
    return Err("LibreOffice 无法将当前 Office 文件转换为 PDF，请检查文件是否损坏或受密码保护。".to_string());
  }
  app
    .fs_scope()
    .allow_file(&output_path)
    .map_err(|_| "无法授权读取 LibreOffice 本地转换结果。".to_string())?;

  Ok(OfficePdfResult {
    pdf_path: output_path.to_string_lossy().to_string(),
    backend: "libreoffice".to_string(),
    version
  })
}

#[tauri::command]
pub fn cleanup_office_conversion(app: AppHandle, path: String) -> Result<(), String> {
  let target = PathBuf::from(path.trim());
  if !target.is_absolute() || target.components().any(|item| matches!(item, Component::ParentDir)) {
    return Err("LibreOffice 临时路径无效。".to_string());
  }
  let canonical_target = target.canonicalize().map_err(|_| "LibreOffice 临时文件不存在。".to_string())?;
  let root = office_temp_root();
  fs::create_dir_all(&root).map_err(|_| "无法访问 LibreOffice 临时目录。".to_string())?;
  let canonical_root = root.canonicalize().map_err(|_| "无法访问 LibreOffice 临时目录。".to_string())?;
  let parent = canonical_target.parent().ok_or_else(|| "LibreOffice 临时路径无效。".to_string())?;
  if !canonical_target.starts_with(&canonical_root) || parent.parent() != Some(canonical_root.as_path()) {
    return Err("拒绝清理非 LibreOffice 临时目录中的文件。".to_string());
  }
  let parent = parent.to_path_buf();
  fs::remove_dir_all(&parent).map_err(|_| "无法清理 LibreOffice 临时文件。".to_string())?;
  let _ = app.fs_scope().forbid_file(&target);
  Ok(())
}

fn validate_input_path(app: &AppHandle, value: &str) -> Result<PathBuf, String> {
  let raw = value.trim();
  if raw.is_empty() {
    return Err("缺少 Office 输入文件。".to_string());
  }
  let path = PathBuf::from(raw);
  if !path.is_absolute() || path.components().any(|item| matches!(item, Component::ParentDir)) {
    return Err("Office 输入路径必须是有效的本地绝对路径。".to_string());
  }
  let canonical = fs::canonicalize(&path).map_err(|_| "Office 输入文件不存在，请重新选择。".to_string())?;
  if !canonical.is_file() {
    return Err("Office 输入路径不是文件。".to_string());
  }
  if !app.fs_scope().is_allowed(&canonical) {
    return Err("Office 输入文件未通过本机选择授权，请重新选择。".to_string());
  }
  let extension = canonical.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase();
  if !SUPPORTED_EXTENSIONS.iter().any(|item| *item == extension) {
    return Err("当前 Office 格式不在 LibreOffice 离线转换白名单内。".to_string());
  }
  Ok(canonical)
}

fn create_work_dir() -> Result<PathBuf, String> {
  let root = office_temp_root();
  fs::create_dir_all(&root).map_err(|_| "无法创建 LibreOffice 临时目录。".to_string())?;
  let stamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|value| value.as_nanos())
    .unwrap_or(0);
  let work_dir = root.join(format!("{}-{stamp}", std::process::id()));
  fs::create_dir_all(&work_dir).map_err(|_| "无法创建 LibreOffice 本地工作目录。".to_string())?;
  Ok(work_dir)
}

fn office_temp_root() -> PathBuf {
  std::env::temp_dir().join("mrx-format-converter").join("libreoffice")
}

fn file_url(path: &Path) -> String {
  format!("file:///{}", path.to_string_lossy().replace('\\', "/").replace(' ', "%20"))
}

fn resolve_libreoffice_file(app: &AppHandle, relative: &str) -> Option<PathBuf> {
  let mut candidates = Vec::new();
  if let Some(resource) = app.path_resolver().resolve_resource(&format!("libreoffice/{relative}")) {
    candidates.push(resource);
  }
  candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources").join("libreoffice").join(relative));
  if let Ok(exe) = std::env::current_exe() {
    if let Some(parent) = exe.parent() {
      candidates.push(parent.join("resources").join("libreoffice").join(relative));
      candidates.push(parent.join("libreoffice").join(relative));
    }
  }
  candidates.into_iter().find(|path| path.is_file())
}
