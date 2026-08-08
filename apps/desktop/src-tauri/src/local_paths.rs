use std::{
  env,
  fs,
  path::{Component, Path, PathBuf},
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

#[tauri::command]
pub fn finalize_task_output(
  output_root: String,
  temporary_path: String,
  final_name: String
) -> Result<String, String> {
  let root = checked_output_root(&output_root)?;
  let temporary = checked_task_temporary_file(&root, &temporary_path)?;
  let final_name = checked_final_name(&final_name)?;
  let destination = unique_output_path(&root, &final_name);

  fs::rename(&temporary, &destination)
    .map_err(|_| "无法完成结果文件写入，请检查输出目录权限。".to_string())?;
  Ok(destination.to_string_lossy().to_string())
}

#[tauri::command]
pub fn cleanup_task_temporary_file(
  output_root: String,
  temporary_path: String
) -> Result<(), String> {
  let root = checked_output_root(&output_root)?;
  let requested = PathBuf::from(temporary_path.trim());
  reject_parent_components(&requested)?;
  if !requested.exists() {
    return Ok(());
  }

  let temporary = checked_task_temporary_file(&root, &temporary_path)?;
  fs::remove_file(temporary)
    .map_err(|_| "无法清理任务临时文件。".to_string())
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

fn checked_output_root(path_text: &str) -> Result<PathBuf, String> {
  let root = checked_existing_path(path_text)?;
  if !root.is_dir() {
    return Err("输出根路径必须是文件夹。".to_string());
  }
  Ok(root)
}

fn checked_task_temporary_file(root: &Path, path_text: &str) -> Result<PathBuf, String> {
  let requested = PathBuf::from(path_text.trim());
  reject_parent_components(&requested)?;
  if !requested.is_absolute() {
    return Err("任务临时路径必须是绝对路径。".to_string());
  }

  let temporary = requested
    .canonicalize()
    .map_err(|_| "任务临时文件不存在。".to_string())?;
  if !temporary.is_file() || !is_same_or_child(&temporary, root) {
    return Err("任务临时文件不在所选输出目录内。".to_string());
  }

  let name = temporary.file_name().and_then(|value| value.to_str()).unwrap_or("");
  if !name.starts_with(".mrx-task-") || !name.ends_with(".tmp") {
    return Err("拒绝操作非任务临时文件。".to_string());
  }
  Ok(temporary)
}

fn checked_final_name(value: &str) -> Result<String, String> {
  let value = value.trim();
  let path = Path::new(value);
  let mut components = path.components();
  let single_name = matches!(components.next(), Some(Component::Normal(_)))
    && components.next().is_none();
  let invalid_character = value.chars().any(|ch| {
    ch.is_control() || matches!(ch, '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*')
  });
  if value.is_empty()
    || !single_name
    || invalid_character
    || value.ends_with('.')
    || value.ends_with(' ')
  {
    return Err("结果文件名无效。".to_string());
  }
  Ok(value.to_string())
}

fn reject_parent_components(path: &Path) -> Result<(), String> {
  if path.components().any(|component| matches!(component, Component::ParentDir)) {
    return Err("路径不能包含上级目录跳转。".to_string());
  }
  Ok(())
}

fn unique_output_path(root: &Path, requested_name: &str) -> PathBuf {
  let requested = Path::new(requested_name);
  let stem = requested.file_stem().and_then(|value| value.to_str()).unwrap_or("result");
  let extension = requested.extension().and_then(|value| value.to_str());
  let initial = root.join(requested_name);
  if !initial.exists() {
    return initial;
  }

  let mut suffix = 2;
  loop {
    let candidate_name = match extension {
      Some(extension) => format!("{stem} ({suffix}).{extension}"),
      None => format!("{stem} ({suffix})")
    };
    let candidate = root.join(candidate_name);
    if !candidate.exists() {
      return candidate;
    }
    suffix += 1;
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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn final_name_rejects_paths_and_windows_reserved_characters() {
    assert!(checked_final_name("report.pdf").is_ok());
    assert!(checked_final_name("../report.pdf").is_err());
    assert!(checked_final_name("folder/report.pdf").is_err());
    assert!(checked_final_name("report?.pdf").is_err());
  }

  #[test]
  fn output_path_never_reuses_an_existing_name() {
    let root = std::env::temp_dir().join(format!("mrx-output-test-{}", std::process::id()));
    let first = root.join("report.pdf");
    fs::create_dir(&root).expect("create isolated test directory");
    fs::write(&first, b"existing").expect("create existing result");

    assert_eq!(unique_output_path(&root, "report.pdf"), root.join("report (2).pdf"));

    fs::remove_file(first).expect("remove isolated test file");
    fs::remove_dir(root).expect("remove isolated test directory");
  }
}
