import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Theme } from '../types';
import { themeManager } from './themeManager';

interface FakeLink {
  id: string;
  rel: string;
  href: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  remove: () => void;
  getAttribute: (name: string) => string | null;
}

const links: FakeLink[] = [];

vi.stubGlobal('document', {
  getElementById: (id: string) => links.find((link) => link.id === id) ?? null,
  querySelectorAll: (selector: string) =>
    selector === '#theme-css'
      ? links.filter((link) => link.id === 'theme-css')
      : [],
  querySelector: () => null,
  createElement: () => {
    const link: FakeLink = {
      id: '',
      rel: '',
      href: '',
      onload: null,
      onerror: null,
      getAttribute: (name: string) => (name === 'href' ? link.href : null),
      remove: () => {
        const index = links.indexOf(link);
        if (index >= 0) links.splice(index, 1);
      },
    };
    return link;
  },
  head: {
    appendChild: (link: FakeLink) => {
      links.push(link);
    },
  },
});

const darkTheme: Theme = { id: 'dark', name: 'Dark', file: '/themes/dark.css' };
const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  file: '/themes/light.css',
};

function stubFetch(data: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      json: async () => data,
    })),
  );
}

beforeEach(() => {
  links.length = 0;
});

describe('themeManager', () => {
  it('loads themes from the index', async () => {
    stubFetch({ themes: [darkTheme, lightTheme] });
    const themes = await themeManager.loadThemes();
    expect(themes).toEqual([darkTheme, lightTheme]);
  });

  it('falls back to the default theme when the request fails', async () => {
    stubFetch({}, false);
    const themes = await themeManager.loadThemes();
    expect(themes).toHaveLength(1);
    expect(themes[0].id).toBe('dark');
  });

  it('falls back to the default theme on network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    const themes = await themeManager.loadThemes();
    expect(themes).toHaveLength(1);
    expect(themes[0].id).toBe('dark');
  });

  it('falls back to the default theme when the list is empty or missing', async () => {
    stubFetch({ themes: [] });
    expect((await themeManager.loadThemes())[0].id).toBe('dark');

    stubFetch({});
    expect((await themeManager.loadThemes())[0].id).toBe('dark');
  });

  it('applies a theme by inserting a link element', async () => {
    await themeManager.applyTheme(lightTheme);

    expect(links).toHaveLength(1);
    expect(links[0].id).toBe('theme-css');
    expect(links[0].rel).toBe('stylesheet');
    expect(links[0].href).toBe('/themes/light.css');

    links[links.length - 1].onload?.();
    expect(themeManager.getCurrentTheme()?.id).toBe('light');
  });

  it('replaces the previous theme link once the new one has loaded', async () => {
    await themeManager.applyTheme(darkTheme);
    links[links.length - 1].onload?.();
    await themeManager.applyTheme(lightTheme);

    expect(links).toHaveLength(2);
    links[links.length - 1].onload?.();
    expect(links).toHaveLength(1);
    expect(links[0].href).toBe('/themes/light.css');
  });

  it('keeps the previous theme when the new stylesheet fails to load', async () => {
    await themeManager.applyTheme(darkTheme);
    links[links.length - 1].onload?.();
    await themeManager.applyTheme(lightTheme);
    links[links.length - 1].onerror?.();

    expect(links).toHaveLength(1);
    expect(links[0].href).toBe('/themes/dark.css');
    expect(themeManager.getCurrentTheme()?.id).toBe('dark');
  });
});
