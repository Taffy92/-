use crate::license;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
  fs::{self, File},
  io::Read,
  path::{Component, Path, PathBuf},
  process::{Command, Stdio},
  time::{Instant, SystemTime, UNIX_EPOCH}
};
use tauri::AppHandle;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SidecarCheck {
  configured: bool,
  status: String,
  message: String,
  ffmpeg_configured: bool,
  ffprobe_configured: bool,
  sha256_verified: bool,
  verified_files: usize,
  checksum_failures: Vec<String>,
  ffmpeg_path: Option<String>,
  ffprobe_path: Option<String>,
  ffmpeg_sha256: Option<String>,
  ffprobe_sha256: Option<String>
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SidecarPocRequest {
  mode: String,
  input_path: Option<String>,
  output_dir: Option<String>,
  output_name: Option<String>
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SidecarCommandResult {
  status: String,
  mode: String,
  message: String,
  output_path: Option<String>,
  sanitized_output_path: Option<String>,
  stdout_preview: String,
  stderr_preview: String,
  duration_ms: u64
}

struct HashVerification {
  ok: bool,
  verified_files: usize,
  failures: Vec<String>,
  ffmpeg_sha256: Option<String>,
  ffprobe_sha256: Option<String>
}

#[tauri::command]
pub fn check_ffmpeg_sidecar(app: AppHandle) -> SidecarCheck {
  let ffmpeg = resolve_sidecar_file(&app, "ffmpeg.exe");
  let ffprobe = resolve_sidecar_file(&app, "ffprobe.exe");
  let hashes = verify_sidecar_hashes(&app);
  let binaries_ready = ffmpeg.is_some() && ffprobe.is_some();
  let configured = binaries_ready && hashes.ok;
  let status = if !binaries_ready {
    "sidecar_missing"
  } else if !hashes.ok {
    "sidecar_checksum_failed"
  } else {
    "sidecar_ready"
  };

  SidecarCheck {
    configured,
    status: status.to_string(),
    message: match status {
      "sidecar_ready" => "sidecar 可用，当前为实验功能。".to_string(),
      "sidecar_checksum_failed" => "sidecar 校验失败：请检查 ffmpeg 资源来源和 SHA256SUMS.txt。".to_string(),
      _ => "sidecar 未配置：未找到可信 ffmpeg.exe / ffprobe.exe，现有功能仍继续使用 FFmpeg WASM。".to_string()
    },
    ffmpeg_configured: ffmpeg.is_some(),
    ffprobe_configured: ffprobe.is_some(),
    sha256_verified: hashes.ok,
    verified_files: hashes.verified_files,
    checksum_failures: hashes.failures,
    ffmpeg_path: ffmpeg.as_ref().map(|path| sanitize_path(path)),
    ffprobe_path: ffprobe.as_ref().map(|path| sanitize_path(path)),
    ffmpeg_sha256: hashes.ffmpeg_sha256,
    ffprobe_sha256: hashes.ffprobe_sha256
  }
}

#[tauri::command]
pub fn get_ffmpeg_sidecar_version(app: AppHandle) -> SidecarCommandResult {
  execute_poc(app, SidecarPocRequest {
    mode: "version-check".to_string(),
    input_path: None,
    output_dir: None,
    output_name: None
  })
}

#[tauri::command]
pub fn run_ffmpeg_sidecar_poc(app: AppHandle, request: SidecarPocRequest) -> SidecarCommandResult {
  if let Err(message) = license::require_license_allowed(&app) {
    return failure(&request.mode, message, Instant::now());
  }
  execute_poc(app, request)
}

fn execute_poc(app: AppHandle, request: SidecarPocRequest) -> SidecarCommandResult {
  let start = Instant::now();
  let mode = match PocMode::parse(&request.mode) {
    Ok(mode) => mode,
    Err(message) => return failure(&request.mode, message, start)
  };

  let check = check_ffmpeg_sidecar(app.clone());
  if !check.configured {
    return SidecarCommandResult {
      status: check.status,
      mode: mode.as_str().to_string(),
      message: check.message,
      output_path: None,
      sanitized_output_path: None,
      stdout_preview: String::new(),
      stderr_preview: String::new(),
      duration_ms: elapsed_ms(start)
    };
  }

  let ffmpeg = resolve_sidecar_file(&app, "ffmpeg.exe").expect("checked above");
  let ffprobe = resolve_sidecar_file(&app, "ffprobe.exe");

  let built = match build_whitelisted_command(&app, mode, request, ffmpeg, ffprobe) {
    Ok(command) => command,
    Err(message) => return failure(mode.as_str(), message, start)
  };

  let output = Command::new(&built.program)
    .args(&built.args)
    .stdin(Stdio::null())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .output();

  match output {
    Ok(output) if output.status.success() => SidecarCommandResult {
      status: "ok".to_string(),
      mode: mode.as_str().to_string(),
      message: "FFmpeg sidecar POC 执行完成。".to_string(),
      output_path: built.output_path.as_ref().map(|path| path.to_string_lossy().to_string()),
      sanitized_output_path: built.output_path.as_ref().map(|path| sanitize_path(path)),
      stdout_preview: preview_bytes(&output.stdout),
      stderr_preview: preview_bytes(&output.stderr),
      duration_ms: elapsed_ms(start)
    },
    Ok(output) => SidecarCommandResult {
      status: "failed".to_string(),
      mode: mode.as_str().to_string(),
      message: friendly_process_error(&output.stderr),
      output_path: None,
      sanitized_output_path: built.output_path.as_ref().map(|path| sanitize_path(path)),
      stdout_preview: preview_bytes(&output.stdout),
      stderr_preview: preview_bytes(&output.stderr),
      duration_ms: elapsed_ms(start)
    },
    Err(_) => failure(mode.as_str(), "无法启动 FFmpeg sidecar，请确认二进制来源、权限和安装包资源。".to_string(), start)
  }
}

#[derive(Clone, Copy)]
enum PocMode {
  VersionCheck,
  BuildconfCheck,
  ProbeDuration,
  ConvertMp4ToWebm,
  ConvertWavToFlac
}

impl PocMode {
  fn parse(value: &str) -> Result<Self, String> {
    match value {
      "version-check" => Ok(Self::VersionCheck),
      "buildconf-check" => Ok(Self::BuildconfCheck),
      "probe-duration" => Ok(Self::ProbeDuration),
      "convert-mp4-to-webm-poc" => Ok(Self::ConvertMp4ToWebm),
      "convert-wav-to-flac-poc" => Ok(Self::ConvertWavToFlac),
      _ => Err("不支持的 sidecar POC 模式。".to_string())
    }
  }

  fn as_str(self) -> &'static str {
    match self {
      Self::VersionCheck => "version-check",
      Self::BuildconfCheck => "buildconf-check",
      Self::ProbeDuration => "probe-duration",
      Self::ConvertMp4ToWebm => "convert-mp4-to-webm-poc",
      Self::ConvertWavToFlac => "convert-wav-to-flac-poc"
    }
  }
}

struct BuiltCommand {
  program: PathBuf,
  args: Vec<String>,
  output_path: Option<PathBuf>
}

fn build_whitelisted_command(
  app: &AppHandle,
  mode: PocMode,
  request: SidecarPocRequest,
  ffmpeg: PathBuf,
  ffprobe: Option<PathBuf>
) -> Result<BuiltCommand, String> {
  match mode {
    PocMode::VersionCheck => Ok(BuiltCommand {
      program: ffmpeg,
      args: vec!["-hide_banner".into(), "-version".into()],
      output_path: None
    }),
    PocMode::BuildconfCheck => Ok(BuiltCommand {
      program: ffmpeg,
      args: vec!["-hide_banner".into(), "-buildconf".into()],
      output_path: None
    }),
    PocMode::ProbeDuration => {
      let probe = ffprobe.ok_or_else(|| "sidecar 未配置：未找到 ffprobe.exe，无法读取媒体信息。".to_string())?;
      let input = validate_input_path(request.input_path.as_deref(), &["mp4", "mov", "avi", "mkv", "webm", "mp3", "wav", "aac", "m4a", "flac"])?;
      Ok(BuiltCommand {
        program: probe,
        args: vec![
          "-v".into(),
          "error".into(),
          "-show_entries".into(),
          "format=duration".into(),
          "-of".into(),
          "default=noprint_wrappers=1:nokey=1".into(),
          input.to_string_lossy().to_string()
        ],
        output_path: None
      })
    },
    PocMode::ConvertMp4ToWebm => {
      let input = validate_input_path(request.input_path.as_deref(), &["mp4"])?;
      let output = validate_output_path(app, request.output_dir.as_deref(), request.output_name.as_deref(), &input, "webm")?;
      Ok(BuiltCommand {
        program: ffmpeg,
        args: vec![
          "-hide_banner".into(),
          "-nostdin".into(),
          "-n".into(),
          "-i".into(),
          input.to_string_lossy().to_string(),
          "-map".into(),
          "0:v:0".into(),
          "-map".into(),
          "0:a?".into(),
          "-c:v".into(),
          "libvpx-vp9".into(),
          "-b:v".into(),
          "1200k".into(),
          "-deadline".into(),
          "realtime".into(),
          "-cpu-used".into(),
          "5".into(),
          "-c:a".into(),
          "libopus".into(),
          "-b:a".into(),
          "128k".into(),
          output.to_string_lossy().to_string()
        ],
        output_path: Some(output)
      })
    },
    PocMode::ConvertWavToFlac => {
      let input = validate_input_path(request.input_path.as_deref(), &["wav"])?;
      let output = validate_output_path(app, request.output_dir.as_deref(), request.output_name.as_deref(), &input, "flac")?;
      Ok(BuiltCommand {
        program: ffmpeg,
        args: vec![
          "-hide_banner".into(),
          "-nostdin".into(),
          "-n".into(),
          "-i".into(),
          input.to_string_lossy().to_string(),
          "-vn".into(),
          "-c:a".into(),
          "flac".into(),
          "-compression_level".into(),
          "5".into(),
          output.to_string_lossy().to_string()
        ],
        output_path: Some(output)
      })
    }
  }
}

fn validate_input_path(value: Option<&str>, allowed_extensions: &[&str]) -> Result<PathBuf, String> {
  let raw = value.ok_or_else(|| "缺少输入文件，请使用用户主动选择的本地文件。".to_string())?;
  let path = PathBuf::from(raw);
  reject_parent_components(&path)?;
  let canonical = fs::canonicalize(&path).map_err(|_| "输入文件不存在，请重新选择文件。".to_string())?;
  if !canonical.is_file() {
    return Err("输入路径不是文件，请重新选择文件。".to_string());
  }
  let extension = canonical.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase();
  if !allowed_extensions.iter().any(|item| *item == extension) {
    return Err("输入文件格式不在 sidecar 实验白名单内。".to_string());
  }
  Ok(canonical)
}

fn validate_output_path(
  app: &AppHandle,
  output_dir: Option<&str>,
  output_name: Option<&str>,
  input: &Path,
  extension: &str
) -> Result<PathBuf, String> {
  let raw_dir = output_dir.ok_or_else(|| "缺少输出目录，请选择本地输出目录。".to_string())?;
  let dir = PathBuf::from(raw_dir);
  reject_parent_components(&dir)?;
  let canonical_dir = fs::canonicalize(&dir).map_err(|_| "输出目录不存在，请重新选择输出目录。".to_string())?;
  if !canonical_dir.is_dir() {
    return Err("输出路径不是目录，请重新选择输出目录。".to_string());
  }
  reject_install_or_system_dir(app, &canonical_dir)?;
  let stem = output_name
    .map(sanitize_file_stem)
    .filter(|value| !value.is_empty())
    .unwrap_or_else(|| {
      let fallback = input.file_stem().and_then(|value| value.to_str()).unwrap_or("sidecar-poc");
      sanitize_file_stem(fallback)
    });
  let output = unique_output_path(&canonical_dir, &format!("{stem}_sidecar"), extension);
  Ok(output)
}

fn reject_parent_components(path: &Path) -> Result<(), String> {
  if path.components().any(|item| matches!(item, Component::ParentDir)) {
    return Err("路径不能包含上级目录跳转。".to_string());
  }
  Ok(())
}

fn reject_install_or_system_dir(app: &AppHandle, dir: &Path) -> Result<(), String> {
  let canonical = fs::canonicalize(dir).map_err(|_| "输出目录不存在，请重新选择输出目录。".to_string())?;
  if let Ok(exe) = std::env::current_exe() {
    if let Some(parent) = exe.parent() {
      if canonical.starts_with(parent) {
        return Err("不能把结果输出到程序安装目录，请选择文档、下载或 D 盘项目目录。".to_string());
      }
    }
  }
  if let Some(resource) = app.path_resolver().resolve_resource("ffmpeg") {
    if let Ok(resource) = fs::canonicalize(resource) {
      if canonical.starts_with(resource) {
        return Err("不能把结果输出到程序资源目录，请重新选择输出目录。".to_string());
      }
    }
  }
  if let Ok(windir) = std::env::var("WINDIR") {
    if canonical.starts_with(PathBuf::from(windir)) {
      return Err("不能把结果输出到 Windows 系统目录，请重新选择输出目录。".to_string());
    }
  }
  Ok(())
}

fn unique_output_path(dir: &Path, stem: &str, extension: &str) -> PathBuf {
  let mut output = dir.join(format!("{stem}.{extension}"));
  if !output.exists() {
    return output;
  }
  let suffix = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|value| value.as_secs())
    .unwrap_or(0);
  output = dir.join(format!("{stem}_{suffix}.{extension}"));
  output
}

fn sanitize_file_stem(value: &str) -> String {
  let cleaned: String = value
    .chars()
    .map(|ch| match ch {
      '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
      ch if ch.is_control() => '_',
      ch => ch
    })
    .collect();
  let trimmed = cleaned.trim().trim_matches('.').to_string();
  trimmed.chars().take(120).collect()
}

fn verify_sidecar_hashes(app: &AppHandle) -> HashVerification {
  let Some(sum_path) = resolve_sidecar_resource(app, "SHA256SUMS.txt") else {
    return HashVerification {
      ok: false,
      verified_files: 0,
      failures: vec!["缺少 SHA256SUMS.txt。".to_string()],
      ffmpeg_sha256: None,
      ffprobe_sha256: None
    };
  };

  let base_dir = sum_path.parent().map(Path::to_path_buf).unwrap_or_else(PathBuf::new);
  let content = match fs::read_to_string(&sum_path) {
    Ok(value) => value,
    Err(_) => {
      return HashVerification {
        ok: false,
        verified_files: 0,
        failures: vec!["无法读取 SHA256SUMS.txt。".to_string()],
        ffmpeg_sha256: None,
        ffprobe_sha256: None
      };
    }
  };

  let mut verified_files = 0;
  let mut failures = Vec::new();
  let mut ffmpeg_sha256 = None;
  let mut ffprobe_sha256 = None;

  for line in content.lines() {
    let trimmed = line.trim().trim_start_matches('\u{feff}');
    if trimmed.is_empty() || trimmed.starts_with('#') {
      continue;
    }
    let mut parts = trimmed.split_whitespace();
    let expected = parts.next().unwrap_or("").to_ascii_uppercase();
    let relative = parts.next().unwrap_or("").replace('\\', "/");
    if expected.len() != 64 || relative.is_empty() || relative.contains("..") || Path::new(&relative).is_absolute() {
      failures.push(format!("SHA256SUMS.txt 存在无效记录：{trimmed}"));
      continue;
    }

    let target = base_dir.join(PathBuf::from(&relative));
    let actual = match sha256_file(&target) {
      Ok(value) => value,
      Err(message) => {
        failures.push(message);
        continue;
      }
    };

    if actual != expected {
      failures.push(format!("SHA256 不匹配：{}。", sanitize_path(&target)));
      continue;
    }

    verified_files += 1;
    if relative.eq_ignore_ascii_case("bin/ffmpeg.exe") {
      ffmpeg_sha256 = Some(actual.clone());
    }
    if relative.eq_ignore_ascii_case("bin/ffprobe.exe") {
      ffprobe_sha256 = Some(actual);
    }
  }

  HashVerification {
    ok: failures.is_empty() && verified_files > 0 && ffmpeg_sha256.is_some() && ffprobe_sha256.is_some(),
    verified_files,
    failures,
    ffmpeg_sha256,
    ffprobe_sha256
  }
}

fn sha256_file(path: &Path) -> Result<String, String> {
  let mut file = File::open(path).map_err(|_| format!("无法读取 sidecar 文件：{}。", sanitize_path(path)))?;
  let mut hasher = Sha256::new();
  let mut buffer = [0_u8; 64 * 1024];
  loop {
    let read = file.read(&mut buffer).map_err(|_| format!("读取 sidecar 文件失败：{}。", sanitize_path(path)))?;
    if read == 0 {
      break;
    }
    hasher.update(&buffer[..read]);
  }
  let digest = hasher.finalize();
  Ok(to_upper_hex(digest.as_slice()))
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

fn resolve_sidecar_file(app: &AppHandle, file_name: &str) -> Option<PathBuf> {
  resolve_sidecar_resource(app, &format!("bin/{file_name}")).filter(|path| path.is_file())
}

fn resolve_sidecar_resource(app: &AppHandle, relative: &str) -> Option<PathBuf> {
  let rel = format!("ffmpeg/{relative}");
  let mut candidates = Vec::new();
  if let Some(resource) = app.path_resolver().resolve_resource(&rel) {
    candidates.push(resource);
  }
  candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources").join("ffmpeg").join(relative));
  if let Ok(exe) = std::env::current_exe() {
    if let Some(parent) = exe.parent() {
      candidates.push(parent.join("resources").join("ffmpeg").join(relative));
      candidates.push(parent.join("ffmpeg").join(relative));
    }
  }
  candidates.into_iter().find(|path| path.exists())
}

fn sanitize_path(path: &Path) -> String {
  let text = path.to_string_lossy().replace('\\', "/");
  let parts: Vec<&str> = text.split('/').filter(|part| !part.is_empty()).collect();
  let last = parts.last().copied().unwrap_or("");
  let drive = if text.len() >= 2 && text.as_bytes().get(1) == Some(&b':') {
    &text[..2]
  } else {
    ""
  };
  if drive.is_empty() {
    format!(".../{last}")
  } else {
    format!("{drive}/.../{last}")
  }
}

fn preview_bytes(bytes: &[u8]) -> String {
  let value = String::from_utf8_lossy(bytes).replace('\r', "");
  sanitize_text_preview(&value).chars().take(600).collect()
}

fn sanitize_text_preview(value: &str) -> String {
  value
    .lines()
    .take(12)
    .map(|line| {
      line
        .split_whitespace()
        .map(redact_path_token)
        .collect::<Vec<_>>()
        .join(" ")
    })
    .collect::<Vec<_>>()
    .join("\n")
}

fn redact_path_token(token: &str) -> String {
  let trimmed = token.trim_matches(|ch| matches!(ch, '"' | '\'' | '`' | ',' | ';'));
  if is_probable_path(trimmed) {
    token.replace(trimmed, &sanitize_path(Path::new(trimmed)))
  } else {
    token.to_string()
  }
}

fn is_probable_path(value: &str) -> bool {
  let normalized = value.replace('\\', "/");
  (normalized.len() > 3 && normalized.as_bytes().get(1) == Some(&b':') && normalized.contains('/'))
    || normalized.starts_with("//")
}

fn friendly_process_error(stderr: &[u8]) -> String {
  let stderr = String::from_utf8_lossy(stderr);
  if stderr.contains("No such file") || stderr.contains("cannot find") {
    return "输入文件不存在或无法访问，请重新选择文件。".to_string();
  }
  if stderr.contains("Permission denied") || stderr.contains("Access is denied") {
    return "无法读取输入文件或写入输出目录，请检查文件权限后重试。".to_string();
  }
  if stderr.contains("Invalid data") || stderr.contains("could not find codec") {
    return "文件可能已损坏或编码不受支持。".to_string();
  }
  if stderr.contains("matches no streams") || stderr.contains("does not contain any stream") {
    return "该文件没有可处理的音频或视频轨道。".to_string();
  }
  "FFmpeg sidecar POC 执行失败，请检查二进制来源、构建参数和输入文件格式。".to_string()
}

fn failure(mode: &str, message: String, start: Instant) -> SidecarCommandResult {
  SidecarCommandResult {
    status: "failed".to_string(),
    mode: mode.to_string(),
    message,
    output_path: None,
    sanitized_output_path: None,
    stdout_preview: String::new(),
    stderr_preview: String::new(),
    duration_ms: elapsed_ms(start)
  }
}

fn elapsed_ms(start: Instant) -> u64 {
  start.elapsed().as_millis().min(u64::MAX as u128) as u64
}
