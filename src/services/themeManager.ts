import type { Theme } from '../types';

const DEFAULT_THEME_ID = 'dark';

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

    const link = document.createElement('link');
    link.id = 'theme-css';
    link.rel = 'stylesheet';
    link.href = theme.file;
    link.onload = () => {
      existing?.remove();
      this.currentTheme = theme;
    };
    link.onerror = () => {
      link.remove();
    };
    document.head.appendChild(link);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();
