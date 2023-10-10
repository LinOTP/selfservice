import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = new BehaviorSubject<Theme>('light');
  theme$ = this._theme.asObservable();
  get theme() {
    return this._theme.value;
  }

  themes = getThemes();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this._initTheme();
  }

  selectTheme(theme: Theme) {
    this.document.body.classList.replace(
      'theme-' + this._theme.value,
      'theme-' + theme
    );
    localStorage.setItem('theme', theme);
    this._theme.next(theme);
  }

  private _initTheme() {
    const theme =
      this._getSelectedTheme() || this._getThemeForPreferredColorScheme();
    this._theme.next(theme);
    this.document.body.classList.add('theme-' + this._theme.value);
  }

  private _getSelectedTheme(): Theme | null {
    const selectedTheme = localStorage.getItem('theme');
    if (isTheme(selectedTheme)) {
      return selectedTheme;
    }
    return null;
  }

  private _getThemeForPreferredColorScheme() {
    return this.isDarkModePreferred() ? 'dark' : 'light';
  }

  protected isDarkModePreferred() {
    const result =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return result;
  }
}

export type Theme = ReturnType<typeof getThemes>[number];

export function getThemes() {
  const themes = ['dark', 'light'] as const;
  return themes;
}

function isTheme(theme: string): theme is Theme {
  return theme === 'dark' || theme === 'light';
}
