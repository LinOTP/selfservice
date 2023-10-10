import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let doc: Document;
  function getThemeService(isDarkModePreferred: boolean = false) {
    class MockService extends ThemeService {
      protected override isDarkModePreferred(): boolean {
        return isDarkModePreferred;
      }
    }
    return new MockService(doc);
  }

  beforeEach(() => {
    doc = TestBed.inject(DOCUMENT);
    localStorage.clear();
  });

  afterEach(() => {
    doc.body.className = '';
  });

  it('should be created', () => {
    const service = new ThemeService(doc);

    expect(service).toBeTruthy();
  });

  it('should set dark theme on init if dark mode is preferred', () => {
    const service = getThemeService(true);

    expect(service.theme).toBe('dark');
  });

  it('should set light theme on init if light mode is preferred', () => {
    const service = getThemeService();

    expect(doc.body.classList).toContain('theme-light');
    expect(service.theme).toBe('light');
  });

  it('should set dark theme if it was previously selected, even if light mode preferred', () => {
    localStorage.setItem('theme', 'dark');
    const service = getThemeService();

    expect(doc.body.classList).toContain('theme-dark');
    expect(service.theme).toBe('dark');
  });

  it('should set light theme if it was previously selected, even if dark mode preferred', () => {
    localStorage.setItem('theme', 'light');
    const service = getThemeService(true);

    expect(service.theme).toBe('light');
  });

  it('it should fallback to preferred theme if theme name is not correct', () => {
    localStorage.setItem('theme', 'bright');
    const service = getThemeService(true);

    expect(service.theme).toBe('dark');
  });

  it('it should allow to change theme', () => {
    const service = getThemeService();
    expect(service.theme).toBe('light');
    service.selectTheme('dark');

    expect(service.theme).toBe('dark');
    expect(doc.body.classList).toContain('theme-dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
