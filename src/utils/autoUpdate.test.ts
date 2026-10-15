import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tauri-apps/plugin-updater', () => ({ check: vi.fn() }));
vi.mock('@tauri-apps/plugin-process', () => ({ relaunch: vi.fn() }));

import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { checkAndInstallUpdate, relaunchApp } from './autoUpdate';

type GlobalWithTauri = typeof globalThis & { __TAURI_INTERNALS__?: unknown };

const mockedCheck = vi.mocked(check);
const mockedRelaunch = vi.mocked(relaunch);

function simulateTauri() {
  (globalThis as GlobalWithTauri).__TAURI_INTERNALS__ = {};
}

function updateAvailable(version: string) {
  const downloadAndInstall = vi.fn().mockResolvedValue(undefined);
  mockedCheck.mockResolvedValue({
    version,
    downloadAndInstall,
  } as unknown as Awaited<ReturnType<typeof check>>);
  return downloadAndInstall;
}

describe('checkAndInstallUpdate', () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete (globalThis as GlobalWithTauri).__TAURI_INTERNALS__;
  });

  it('no hace nada fuera de Tauri (build web)', async () => {
    await expect(checkAndInstallUpdate({ allowDev: true })).resolves.toBeNull();
    expect(mockedCheck).not.toHaveBeenCalled();
  });

  it('no busca actualizaciones en modo desarrollo', async () => {
    simulateTauri();
    await expect(checkAndInstallUpdate()).resolves.toBeNull();
    expect(mockedCheck).not.toHaveBeenCalled();
  });

  it('devuelve null cuando no hay versión nueva', async () => {
    simulateTauri();
    mockedCheck.mockResolvedValue(null);
    await expect(checkAndInstallUpdate({ allowDev: true })).resolves.toBeNull();
    expect(mockedCheck).toHaveBeenCalledTimes(1);
  });

  it('instala la actualización y devuelve su versión', async () => {
    simulateTauri();
    const downloadAndInstall = updateAvailable('0.2.0');
    await expect(checkAndInstallUpdate({ allowDev: true })).resolves.toEqual({
      version: '0.2.0',
    });
    expect(downloadAndInstall).toHaveBeenCalledTimes(1);
  });

  it('silencia los errores de red o de release inexistente', async () => {
    simulateTauri();
    mockedCheck.mockRejectedValue(new Error('404 Not Found'));
    await expect(checkAndInstallUpdate({ allowDev: true })).resolves.toBeNull();
  });
});

describe('relaunchApp', () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete (globalThis as GlobalWithTauri).__TAURI_INTERNALS__;
  });

  it('no hace nada fuera de Tauri', async () => {
    await relaunchApp();
    expect(mockedRelaunch).not.toHaveBeenCalled();
  });

  it('reinicia la aplicación dentro de Tauri', async () => {
    simulateTauri();
    await relaunchApp();
    expect(mockedRelaunch).toHaveBeenCalledTimes(1);
  });
});
