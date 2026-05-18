import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'spv-theme';

  readonly mode$ = new BehaviorSubject<ThemeMode>('system');
  readonly resolved$ = new BehaviorSubject<ResolvedTheme>('light');

  private mediaQuery: MediaQueryList | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  /** Chamado no arranque (APP_INITIALIZER) para evitar flash de tema. */
  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
    const mode: ThemeMode = stored ?? 'system';
    this.setMode(mode, false);

    // Listener para mudanças de preferência do sistema
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.mode$.value === 'system') {
        this.applyResolved(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  toggle(): void {
    const current = this.mode$.value;
    const next: ThemeMode = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    this.setMode(next, true);
  }

  setMode(mode: ThemeMode, persist: boolean = true): void {
    if (isPlatformBrowser(this.platformId)) {
      this.mode$.next(mode);
      const resolved = this.resolveMode(mode);
      this.applyResolved(resolved, persist);
    }
  }

  private resolveMode(mode: ThemeMode): ResolvedTheme {
    if (mode !== 'system') {
      return mode;
    }
    const prefersDark = this.mediaQuery?.matches ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private applyResolved(resolved: ResolvedTheme, persist: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.style.colorScheme = resolved;
      if (persist) {
        localStorage.setItem(this.storageKey, this.mode$.value);
      }
    }
    this.resolved$.next(resolved);
  }
}
