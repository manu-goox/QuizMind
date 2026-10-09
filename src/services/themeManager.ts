import type { Theme } from '../types';

const DEFAULT_THEME_ID = 'dark';

const THEME_COLORS: Record<string, string> = {
  dark: '#0a0a18',
  light: '#e8edf3',
  catppuccin: '#1e1e2e',
};

class ThemeManager {
  private currentTheme: Theme | null = null;

  async loadThemes(): Promise<Theme[]> {
    try {
      const response = await fetch('/themes/index.json');
      if (!response.ok) throw new Error('Failed to load themes index');
      const data = await response.json();
      const themes: Theme[] = Array.isArray(data.themes)
        ? data.themes.filter(
            (theme: unknown): theme is Theme =>
              !!theme &&
              typeof theme === 'object' &&
              typeof (theme as Theme).id === 'string' &&
              typeof (theme as Theme).name === 'string' &&
              typeof (theme as Theme).file === 'string',
          )
        : [];
      if (themes.length === 0) {
        return [this.getDefaultTheme()];
      }
      return themes;
    } catch {
      return [this.getDefaultTheme()];
    }
  }

  getDefaultTheme(): Theme {
    return {
      id: DEFAULT_THEME_ID,
      name: 'Dark',
      file: '/themes/dark.css',
    };
  }

  async applyTheme(theme: Theme) {
    const existing = document.getElementById('theme-css');

    if (existing?.getAttribute('href') === theme.file) {
      this.currentTheme = theme;
      this.updateThemeColor(theme.id);
      return;
    }

    const link = document.createElement('link');
    link.id = 'theme-css';
    link.rel = 'stylesheet';
    link.href = theme.file;
    link.onload = () => {
      document.querySelectorAll('#theme-css').forEach((el) => {
        if (el !== link) el.remove();
      });
      this.currentTheme = theme;
      this.updateThemeColor(theme.id);
    };
    link.onerror = () => {
      link.remove();
    };
    document.head.appendChild(link);
  }

  private updateThemeColor(themeId: string) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[themeId] ?? '#0a0a18');
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();
