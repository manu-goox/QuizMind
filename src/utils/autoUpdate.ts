import { isTauri } from './desktop';

export interface InstalledUpdate {
  version: string;
}

/** Live update progress, used to paint the on-screen notice. */
export type UpdateStatus =
  | { phase: 'downloading'; version: string; percent: number | null }
  | { phase: 'installing'; version: string };

interface CheckOptions {
  /**
   * Also run on Vite dev builds. Off by default so `tauri dev` never tries to
   * install a release over the development build; tests opt in explicitly.
   */
  allowDev?: boolean;
  /** Receives every state change so the UI can show what is happening. */
  onStatus?: (status: UpdateStatus) => void;
}

/**
 * Looks for a newer desktop build on the GitHub Releases feed and installs it
 * in the background, reporting progress through `onStatus` (download
 * percentage, then installation). Resolves with the new version when an update
 * was downloaded and applied — the app must be restarted to use it — or null
 * when there is nothing to do. Never throws: update problems must not break
 * the app.
 */
export async function checkAndInstallUpdate({
  allowDev = false,
  onStatus,
}: CheckOptions = {}): Promise<InstalledUpdate | null> {
  if (!isTauri()) return null;
  if (import.meta.env.DEV && !allowDev) return null;

  const emit = (status: UpdateStatus) => {
    try {
      onStatus?.(status);
    } catch {
      // A broken listener must never break the update itself.
    }
  };

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();
    if (!update) return null;

    const version = update.version;
    let downloaded = 0;
    let total: number | null = null;
    const percent = () =>
      total === null || total === 0
        ? null
        : Math.min(100, Math.round((downloaded / total) * 100));

    emit({ phase: 'downloading', version, percent: null });
    await update.downloadAndInstall((event) => {
      if (event.event === 'Started') {
        total = event.data.contentLength ?? null;
      } else if (event.event === 'Progress') {
        downloaded += event.data.chunkLength;
      } else {
        emit({ phase: 'installing', version });
        return;
      }
      emit({ phase: 'downloading', version, percent: percent() });
    });
    return { version };
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
