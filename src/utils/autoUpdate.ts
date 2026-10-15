import { isTauri } from './desktop';

export interface InstalledUpdate {
  version: string;
}

interface CheckOptions {
  /**
   * Also run on Vite dev builds. Off by default so `tauri dev` never tries to
   * install a release over the development build; tests opt in explicitly.
   */
  allowDev?: boolean;
}

/**
 * Looks for a newer desktop build on the GitHub Releases feed and installs it
 * in the background. Resolves with the new version when an update was
 * downloaded and applied — the app must be restarted to use it — or null when
 * there is nothing to do. Never throws: update problems must not break the app.
 */
export async function checkAndInstallUpdate({
  allowDev = false,
}: CheckOptions = {}): Promise<InstalledUpdate | null> {
  if (!isTauri()) return null;
  if (import.meta.env.DEV && !allowDev) return null;

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();
    if (!update) return null;
    await update.downloadAndInstall();
    return { version: update.version };
  } catch {
    return null;
  }
}

/** Restarts the app so an already installed update takes effect. */
export async function relaunchApp(): Promise<void> {
  if (!isTauri()) return;
  const { relaunch } = await import('@tauri-apps/plugin-process');
  await relaunch();
}
