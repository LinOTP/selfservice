import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilKeyChanged } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themes = getThemes();
  private _theme = new BehaviorSubject<Theme>(this.themes[0]);
  theme$ = this._theme.asObservable().pipe(distinctUntilKeyChanged('id'));
  get theme() {
    return this._theme.value;
  }


  constructor(@Inject(DOCUMENT) private document: Document) {
    this._initTheme();

    // listen for system color scheme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      // reinitialize theme on changes changes
      this._initTheme();
    })
  }

  selectTheme(themeId: ThemeId) {
    if (themeId === this._theme.value.id) return;
    const theme = this.themes.find((theme) => theme.id === themeId);
    if (!theme) throw new Error('Theme not found');

    this.document.body.classList.replace(
      'theme-' + this._theme.value.id,
      'theme-' + theme.id
    );
    localStorage.setItem('theme', theme.id);
    this._theme.next(theme);
  }

  private _initTheme() {
    const theme =
      this._getSelectedTheme() || this._getThemeForPreferredColorScheme();
    this._theme.next(theme);

    // there could potentially exist theme class when theme is reintialized
    const classes = this.document.body.classList;
    classes.forEach((className) => {
      if (className.startsWith('theme-')) {
        classes.remove(className);
      }
    })
    this.document.body.classList.add('theme-' + this._theme.value.id);
  }

  private _getSelectedTheme(): Theme | null {
    const selectedThemeId = localStorage.getItem('theme');
    const selectedTheme = this.themes.find((theme) => theme.id === selectedThemeId);
    return selectedTheme || null;
  }

  private _getThemeForPreferredColorScheme() {
    if (this.isDarkModePreferred()) {
      return this.themes[1] as typeof darkTheme
    } else {
      return this.themes[0] as typeof lightTheme
    }
  }

  protected isDarkModePreferred() {
    const result =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return result;
  }
}


export type ThemeDefinition<T extends string> = Readonly<{
  id: T
  prettyName: string
  prettyNameShort: string
  icon: string
  linotpLogo: string
}>;

const lightTheme: ThemeDefinition<'light'> = {
  id: "light",
  prettyName: $localize`Light Theme`,
  prettyNameShort: $localize`Light`,
  icon: "light_mode",
  linotpLogo: "assets/logo.png",
}

const darkTheme: ThemeDefinition<'dark'> = {
  id: "dark",
  prettyName: $localize`Dark Theme`,
  prettyNameShort: $localize`Dark`,
  icon: "dark_mode",
  linotpLogo: "assets/logo-dark.png",
}

// first theme from the list is the default theme
export function getThemes() {
  const themes = [
    lightTheme, darkTheme
  ] as const
  return themes
}

export type Theme = ReturnType<typeof getThemes>[number]
export type ThemeId = ReturnType<typeof getThemes>[number]['id']