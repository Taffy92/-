use std::{
  env,
  path::{Path, PathBuf},
  process::Command
};

#[tauri::command]
pub fn open_output_path(path: String) -> Result<(), String> {
  let path = checked_existing_path(&path)?;
  let mut command = Command::new("explorer.exe");

  if path.is_file() {
    command.arg(format!("/select,{}", path.display()));
  } else {
    command.arg(&path);
  }

  command
    .spawn()
    .map(|_| ())
    .map_err(|_| "failed to open output path with Explorer".to_string())
}

fn checked_existing_path(path_text: &str) -> Result<PathBuf, String> {
  let path_text = path_text.trim();
  if path_text.is_empty() {
    return Err("output path is empty".to_string());
  }

  let path = PathBuf::from(path_text);
  if !path.is_absolute() {
    return Err("output path must be absolute".to_string());
  }

  let canonical = path
    .canonicalize()
    .map_err(|_| "output path does not exist".to_string())?;

  if is_allowed_output_path(&canonical) {
    Ok(canonical)
  } else {
    Err("output path is outside the allowed local output scope".to_string())
  }
}

fn is_allowed_output_path(path: &Path) -> bool {
  allowed_roots()
    .into_iter()
    .any(|root| is_same_or_child(path, &root))
}

fn allowed_roots() -> Vec<PathBuf> {
  let mut roots = Vec::new();

  if let Some(home) = env::var_os("USERPROFILE").map(PathBuf::from) {
    roots.push(home);
  }
  if let (Some(drive), Some(path)) = (env::var_os("HOMEDRIVE"), env::var_os("HOMEPATH")) {
    roots.push(PathBuf::from(format!("{}{}", drive.to_string_lossy(), path.to_string_lossy())));
  }

  roots.push(PathBuf::from("D:\\"));

  roots
    .into_iter()
    .filter_map(|root| root.canonicalize().ok())
    .collect()
}

fn is_same_or_child(path: &Path, root: &Path) -> bool {
  let path_text = normalize_for_compare(path);
  let root_text = normalize_for_compare(root);
  path_text == root_text || path_text.starts_with(&format!("{root_text}\\"))
}

fn normalize_for_compare(path: &Path) -> String {
  path
    .to_string_lossy()
    .replace('/', "\\")
    .trim_end_matches('\\')
    .to_ascii_lowercase()
}
