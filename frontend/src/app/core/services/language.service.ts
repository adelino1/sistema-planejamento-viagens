import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type LanguageCode = 'pt' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'spv-lang';
  private readonly supportedLanguages: LanguageCode[] = ['pt', 'en'];

  readonly currentLang$ = new BehaviorSubject<LanguageCode>('pt');

  constructor(private translate: TranslateService) {}

  /**
   * Inicializa o serviço de idioma (chamado no bootstrap).
   */
  init(): void {
    const stored = localStorage.getItem(this.storageKey) as LanguageCode | null;
    const lang: LanguageCode = stored ?? this.getBrowserLanguage() ?? 'pt';

    this.translate.addLangs(this.supportedLanguages);
    this.translate.setDefaultLang('pt');
    this.setLanguage(lang, false);
  }

  /**
   * Alterna para o próximo idioma suportado.
   */
  toggle(): void {
    const current = this.currentLang$.value;
    const next = current === 'pt' ? 'en' : 'pt';
    this.setLanguage(next);
  }

  /**
   * Define o idioma ativo.
   */
  setLanguage(lang: LanguageCode, persist: boolean = true): void {
    if (!this.supportedLanguages.includes(lang)) {
      console.warn(`Language ${lang} not supported. Using default.`);
      lang = 'pt';
    }
    this.translate.use(lang);
    if (persist) {
      localStorage.setItem(this.storageKey, lang);
    }
    this.currentLang$.next(lang);
  }

  /**
   * Retorna o idioma do navegador (se suportado).
   */
  private getBrowserLanguage(): LanguageCode | null {
    const browserLang = this.translate.getBrowserLang() as string | null;
    if (!browserLang) return null;
    const lang = browserLang.substring(0, 2) as LanguageCode;
    return this.supportedLanguages.includes(lang) ? lang : null;
  }

  /**
   * Retorna a lista de idiomas suportados.
   */
  getSupportedLanguages(): Array<{ code: LanguageCode; label: string }> {
    return [
      { code: 'pt', label: 'Português' },
      { code: 'en', label: 'English' },
    ];
  }

  /**
   * Traduz uma chave imediatamente (síncrono).
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Traduz uma chave de forma assíncrona.
   */
  get(key: string, params?: any): Observable<string> {
    return this.translate.get(key, params);
  }
}
