/** True when the app runs inside a Tauri webview (desktop shell). */
export function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in globalThis;
}
