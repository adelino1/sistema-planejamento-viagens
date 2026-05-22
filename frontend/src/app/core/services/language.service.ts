import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  
  public currentLang = signal<string>('pt');

  public supportedLanguages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' }
  ];

  constructor() {
    this.translate.addLangs(this.supportedLanguages.map(l => l.code));
    this.translate.setDefaultLang('pt');
    this.loadSavedLanguage();
  }

  private loadSavedLanguage() {
    const saved = localStorage.getItem('user_language');
    if (saved && this.translate.getLangs().includes(saved)) {
      this.setLanguage(saved);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const langToUse = browserLang?.match(/en|pt|es|fr|de|zh/) ? browserLang : 'pt';
      this.setLanguage(langToUse);
    }
  }

  setLanguage(langCode: string) {
    this.translate.use(langCode);
    this.currentLang.set(langCode);
    localStorage.setItem('user_language', langCode);
  }
}
