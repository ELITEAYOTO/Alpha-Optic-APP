//! Minimal Tauri bootstrap. No Bridge process, no shell and no privileged commands.
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("unable to start Optic desktop");
}
