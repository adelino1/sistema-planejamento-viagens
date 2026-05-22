import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CurrencyRates {
  base: string;
  rates: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private http = inject(HttpClient);
  
  // Base is always USD according to our mock
  private currentCurrency = signal<string>('USD');
  private rates = signal<{ [key: string]: number }>({});

  constructor() {
    this.loadSavedCurrency();
    this.fetchRates();
  }

  private loadSavedCurrency() {
    const saved = localStorage.getItem('user_currency');
    if (saved) {
      this.currentCurrency.set(saved);
    }
  }

  fetchRates() {
    this.http.get<any>(`${environment.apiUrl}/currency.php`).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.rates.set(res.rates);
        }
      },
      error: (err) => console.error('Failed to load exchange rates', err)
    });
  }

  setCurrency(currencyCode: string) {
    this.currentCurrency.set(currencyCode);
    localStorage.setItem('user_currency', currencyCode);
  }

  getCurrency() {
    return this.currentCurrency();
  }

  // Convert USD value to current currency
  convert(valueInUSD: number): number {
    const rate = this.rates()[this.currentCurrency()] || 1;
    return valueInUSD * rate;
  }

  // Format value to string with currency symbol
  format(valueInUSD: number): string {
    const converted = this.convert(valueInUSD);
    return new Intl.NumberFormat(undefined, { 
      style: 'currency', 
      currency: this.currentCurrency() 
    }).format(converted);
  }
}
