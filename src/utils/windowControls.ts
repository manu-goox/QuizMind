/**
 * Controles de la ventana nativa (solo escritorio).
 * En la web no existen: cada función falla en silencio.
 */

async function withWindow<T>(
  action: (
    window: Awaited<
      ReturnType<typeof import('@tauri-apps/api/window').getCurrentWindow>
    >,
  ) => Promise<T> | T,
): Promise<T | undefined> {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return await action(getCurrentWindow());
  } catch {
    return undefined;
  }
}

export async function minimizeWindow(): Promise<void> {
  await withWindow((window) => window.minimize());
}

export async function toggleMaximizeWindow(): Promise<void> {
  await withWindow((window) => window.toggleMaximize());
}

export async function closeWindow(): Promise<void> {
  await withWindow((window) => window.close());
}

export async function isWindowMaximized(): Promise<boolean> {
  const result = await withWindow((window) => window.isMaximized());
  return result ?? false;
}

export async function onWindowResized(
  handler: () => void,
): Promise<() => void> {
  const unlisten = await withWindow(async (window) => {
    const stop = await window.onResized(() => handler());
    return stop;
  });
  return unlisten ?? (() => {});
}
