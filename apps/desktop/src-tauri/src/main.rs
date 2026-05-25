#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sidecar_ffmpeg;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      sidecar_ffmpeg::check_ffmpeg_sidecar,
      sidecar_ffmpeg::get_ffmpeg_sidecar_version,
      sidecar_ffmpeg::run_ffmpeg_sidecar_poc
    ])
    .run(tauri::generate_context!())
    .expect("failed to run desktop app");
}
