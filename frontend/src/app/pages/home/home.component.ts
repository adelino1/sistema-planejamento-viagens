import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService } from '../../core/services/currency.service';
import { LanguageService } from '../../core/services/language.service';
import { ExploreBuilderComponent } from '../../features/explore/explore-builder/explore-builder.component';
import { environment } from '../../../environments/environment';

export interface Destination {
  id: number;
  name: string;
  country: string;
  continent: string;
  img: string;
  price: number;
  description: string;
  language: string;
  currency: string;
  bestTime: string;
  tips: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ExploreBuilderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  currencyService = inject(CurrencyService);
  langService = inject(LanguageService);

  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isDark = computed(() => this.themeService.isDark());
  currentCurrency = computed(() => this.currencyService.getCurrency());
  currentLang = computed(() => this.langService.currentLang());

  // Continents: 1=Africa, 2=Europe, 3=Asia, 4=N. America, 5=S. America, 6=Oceania
  africaDestinations = signal<Destination[]>([]);
  europeDestinations = signal<Destination[]>([]);
  asiaDestinations = signal<Destination[]>([]);
  americasDestinations = signal<Destination[]>([]);
  oceaniaDestinations = signal<Destination[]>([]);

  features = [
    { icon: 'route', title: 'Roteiros Automáticos', desc: 'Gerados instantaneamente com base nas suas preferências.' },
    { icon: 'cloud', title: 'Clima em Tempo Real', desc: 'Previsões meteorológicas para qualquer destino.' },
    { icon: 'currency_exchange', title: 'Câmbio Dinâmico', desc: 'Conversão automática de moedas.' },
    { icon: 'translate', title: 'Multilíngue', desc: 'Disponível em mais de 10 idiomas diferentes.' }
  ];
  
  selectedDestination: Destination | null = null;
  searchQuery = signal('');

  ngOnInit() {
    this.loadDestinations(1, this.africaDestinations);
    this.loadDestinations(2, this.europeDestinations);
    this.loadDestinations(3, this.asiaDestinations);
    this.loadDestinations(4, this.americasDestinations);
    this.loadDestinations(6, this.oceaniaDestinations);
  }

  loadDestinations(continentId: number, targetSignal: any) {
    this.http.get<{status: string, data: Destination[]}>(`${environment.apiUrl}/destinations.php?continent=${continentId}`)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') targetSignal.set(res.data);
        },
        error: (err) => console.error('Failed to load continent', continentId, err)
      });
  }

  toggleTheme() { this.themeService.toggle(); }

  setCurrency(code: string) { this.currencyService.setCurrency(code); }
  
  setLanguage(code: string) { this.langService.setLanguage(code); }

  openExplore(dest: Destination) {
    this.selectedDestination = dest;
  }

  formatPrice(price: number): string {
    return this.currencyService.format(price);
  }

  get availableLanguages() {
    return this.langService.supportedLanguages;
  }
}
