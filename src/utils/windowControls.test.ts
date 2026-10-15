import { afterEach, describe, expect, it, vi } from 'vitest';

const windowMocks = vi.hoisted(() => ({
  minimize: vi.fn<() => Promise<void>>(),
  toggleMaximize: vi.fn<() => Promise<void>>(),
  close: vi.fn<() => Promise<void>>(),
  isMaximized: vi.fn<() => Promise<boolean>>(),
  onResized: vi.fn<(handler: () => void) => Promise<() => void>>(),
}));

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => windowMocks,
}));

import {
  closeWindow,
  isWindowMaximized,
  minimizeWindow,
  onWindowResized,
  toggleMaximizeWindow,
} from './windowControls';

afterEach(() => {
  vi.clearAllMocks();
});

describe('windowControls', () => {
  it('minimiza la ventana actual', async () => {
    windowMocks.minimize.mockResolvedValue();
    await minimizeWindow();
    expect(windowMocks.minimize).toHaveBeenCalledOnce();
  });

  it('alterna el estado maximizado de la ventana', async () => {
    windowMocks.toggleMaximize.mockResolvedValue();
    await toggleMaximizeWindow();
    expect(windowMocks.toggleMaximize).toHaveBeenCalledOnce();
  });

  it('cierra la ventana actual', async () => {
    windowMocks.close.mockResolvedValue();
    await closeWindow();
    expect(windowMocks.close).toHaveBeenCalledOnce();
  });

  it('informa de si la ventana está maximizada', async () => {
    windowMocks.isMaximized.mockResolvedValue(true);
    await expect(isWindowMaximized()).resolves.toBe(true);
    windowMocks.isMaximized.mockResolvedValue(false);
    await expect(isWindowMaximized()).resolves.toBe(false);
  });

  it('devuelve false si no se puede consultar el estado', async () => {
    windowMocks.isMaximized.mockRejectedValue(new Error('sin ventana'));
    await expect(isWindowMaximized()).resolves.toBe(false);
  });

  it('silencia los errores de los controles', async () => {
    windowMocks.minimize.mockRejectedValue(new Error('sin ventana'));
    await expect(minimizeWindow()).resolves.toBeUndefined();
    windowMocks.close.mockRejectedValue(new Error('sin ventana'));
    await expect(closeWindow()).resolves.toBeUndefined();
  });

  it('registra el listener de redimensionado y lo puede quitar', async () => {
    const unlisten = vi.fn();
    windowMocks.onResized.mockResolvedValue(unlisten);
    const handler = vi.fn();

    const unsubscribe = await onWindowResized(handler);
    expect(windowMocks.onResized).toHaveBeenCalledOnce();

    const listener = windowMocks.onResized.mock.calls[0]?.[0];
    listener?.();
    expect(handler).toHaveBeenCalledOnce();

    unsubscribe();
    expect(unlisten).toHaveBeenCalledOnce();
  });

  it('devuelve una función vacía si no se puede escuchar el evento', async () => {
    windowMocks.onResized.mockRejectedValue(new Error('sin ventana'));
    const unsubscribe = await onWindowResized(vi.fn());
    expect(() => unsubscribe()).not.toThrow();
  });
});
