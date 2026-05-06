import type { Theme } from '../types';

const DEFAULT_THEME_ID = 'dark';

class ThemeManager {
  private currentTheme: Theme | null = null;

  async loadThemes(): Promise<Theme[]> {
    try {
      const response = await fetch('/themes/index.json');
      if (!response.ok) throw new Error('Failed to load themes index');
      const data = await response.json();
      return data.themes || [];
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
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = 'theme-css';
    link.rel = 'stylesheet';
    link.href = theme.file;
    document.head.appendChild(link);

    this.currentTheme = theme;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();