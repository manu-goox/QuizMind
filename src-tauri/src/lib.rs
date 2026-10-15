/// Removes the webview caches that could serve a stale frontend after an update.
///
/// Desktop builds bundle the frontend inside the executable, so the PWA
/// service worker is disabled there (see `vite.config.ts`). This purge cleans
/// profiles left behind by older versions that did register a service worker.
fn purge_webview_caches(identifier: &str) {
    #[cfg(target_os = "windows")]
    {
        use std::path::PathBuf;

        if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
            let default_dir = PathBuf::from(local_app_data)
                .join(identifier)
                .join("EBWebView")
                .join("Default");
            for dir in ["Service Worker", "Cache", "Code Cache"] {
                let path = default_dir.join(dir);
                if path.exists() {
                    let _ = std::fs::remove_dir_all(path);
                }
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    let _ = identifier;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();
    purge_webview_caches(&context.config().identifier);

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(context)
        .expect("error while building tauri application");
}
