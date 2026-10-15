import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tauri-apps/plugin-updater', () => ({ check: vi.fn() }));
vi.mock('@tauri-apps/plugin-process', () => ({ relaunch: vi.fn() }));

import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import {
  checkAndInstallUpdate,
  relaunchApp,
  type UpdateStatus,
} from './autoUpdate';

type GlobalWithTauri = typeof globalThis & { __TAURI_INTERNALS__?: unknown };

type FakeDownloadEvent =
  | { event: 'Started'; data: { contentLength?: number } }
  | { event: 'Progress'; data: { chunkLength: number } }
  | { event: 'Finished' };

const mockedCheck = vi.mocked(check);
const mockedRelaunch = vi.mocked(relaunch);

function simulateTauri() {
  (globalThis as GlobalWithTauri).__TAURI_INTERNALS__ = {};
}

function updateAvailable(
  version: string,
  simulate?: (emit: (event: FakeDownloadEvent) => void) => void,
) {
  const downloadAndInstall = vi.fn(
    async (onEvent?: (event: FakeDownloadEvent) => void) => {
      if (simulate && onEvent) simulate(onEvent);
    },
  );
  mockedCheck.mockResolvedValue({
    version,
    downloadAndInstall,
  } as unknown as Awaited<ReturnType<typeof check>>);
  return downloadAndInstall;
}

function collectStatuses() {
  const statuses: UpdateStatus[] = [];
  return {
    statuses,
    onStatus: (status: UpdateStatus) => statuses.push(status),
  };
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

  it('informa del progreso de descarga y del paso a instalación', async () => {
    simulateTauri();
    updateAvailable('0.2.0', (emit) => {
      emit({ event: 'Started', data: { contentLength: 400 } });
      emit({ event: 'Progress', data: { chunkLength: 100 } });
      emit({ event: 'Progress', data: { chunkLength: 300 } });
      emit({ event: 'Finished' });
    });
    const { statuses, onStatus } = collectStatuses();
    await checkAndInstallUpdate({ allowDev: true, onStatus });
    expect(statuses).toEqual([
      { phase: 'downloading', version: '0.2.0', percent: null },
      { phase: 'downloading', version: '0.2.0', percent: 0 },
      { phase: 'downloading', version: '0.2.0', percent: 25 },
      { phase: 'downloading', version: '0.2.0', percent: 100 },
      { phase: 'installing', version: '0.2.0' },
    ]);
  });

  it('mantiene el porcentaje en null si la release no indica tamaño', async () => {
    simulateTauri();
    updateAvailable('0.2.0', (emit) => {
      emit({ event: 'Started', data: {} });
      emit({ event: 'Progress', data: { chunkLength: 100 } });
    });
    const { statuses, onStatus } = collectStatuses();
    await checkAndInstallUpdate({ allowDev: true, onStatus });
    expect(statuses).toEqual([
      { phase: 'downloading', version: '0.2.0', percent: null },
      { phase: 'downloading', version: '0.2.0', percent: null },
      { phase: 'downloading', version: '0.2.0', percent: null },
    ]);
  });

  it('un listener roto no impide la actualización', async () => {
    simulateTauri();
    const downloadAndInstall = updateAvailable('0.2.0');
    await expect(
      checkAndInstallUpdate({
        allowDev: true,
        onStatus: () => {
          throw new Error('boom');
        },
      }),
    ).resolves.toEqual({ version: '0.2.0' });
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
