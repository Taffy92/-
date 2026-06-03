#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sidecar_ffmpeg;
mod license;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      license::get_license_status,
      license::activate_license_code,
      license::activate_license_file_content,
      license::create_activation_request,
      sidecar_ffmpeg::check_ffmpeg_sidecar,
      sidecar_ffmpeg::get_ffmpeg_sidecar_version,
      sidecar_ffmpeg::run_ffmpeg_sidecar_poc
    ])
    .run(tauri::generate_context!())
    .expect("failed to run desktop app");
}
