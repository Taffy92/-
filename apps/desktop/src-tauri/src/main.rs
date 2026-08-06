#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sidecar_ffmpeg;
mod license;
mod local_paths;
mod libreoffice;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      license::get_license_status,
      license::activate_license_code,
      license::activate_license_file_content,
      license::create_activation_request,
      local_paths::open_output_path,
      libreoffice::check_libreoffice,
      libreoffice::convert_office_to_pdf,
      libreoffice::cleanup_office_conversion,
      sidecar_ffmpeg::check_ffmpeg_sidecar,
      sidecar_ffmpeg::get_ffmpeg_sidecar_version,
      sidecar_ffmpeg::run_ffmpeg_sidecar_poc
    ])
    .run(tauri::generate_context!())
    .expect("failed to run desktop app");
}
