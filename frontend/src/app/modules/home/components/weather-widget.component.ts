import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface GeocodingResult {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
  }>;
}

interface WeatherData {
  current: {
    temperature: number;
    relative_humidity: number;
    weather_code: number;
  };
}

interface WeatherState {
  loading: boolean;
  error: string | null;
  city: string | null;
  temperature: number | null;
  humidity: number | null;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="weather-widget">
      <div class="widget-header">
        <h3>Clima do Destino</h3>
        <p>Verifique o clima do seu destino em tempo real</p>
      </div>

      <div class="search-box">
        <input
          type="text"
          placeholder="Digite uma cidade..."
          [(ngModel)]="searchInput"
          (ngModelChange)="onSearchChange($event)"
          class="search-input"
          [disabled]="state.loading"
        />
      </div>

      <!-- Loading state -->
      <div *ngIf="state.loading" class="state-message">
        <span class="spinner"></span> Carregando dados...
      </div>

      <!-- Error state -->
      <div *ngIf="state.error && !state.loading" class="state-message error">
        {{ state.error }}
      </div>

      <!-- Weather data state -->
      <div *ngIf="state.city && !state.loading && !state.error" class="weather-display">
        <div class="weather-main">
          <div class="icon-large">{{ state.icon }}</div>
          <div class="temp-box">
            <span class="temperature">{{ state.temperature }}°C</span>
            <span class="description">{{ state.description }}</span>
          </div>
        </div>

        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-label">Cidade</span>
            <span class="detail-value">{{ state.city }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Humidade</span>
            <span class="detail-value">{{ state.humidity }}%</span>
          </div>
        </div>
      </div>

      <!-- Initial state -->
      <div *ngIf="!state.city && !state.loading && !state.error" class="initial-state">
        <p>🌍 Digite o nome de uma cidade para ver o clima atual</p>
      </div>
    </div>
  `,
  styles: [`
    .weather-widget {
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      max-width: 500px;
      margin: 3rem auto;
    }

    .widget-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .widget-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .widget-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .search-box {
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      box-sizing: border-box;
    }

    .search-input::placeholder {
      color: #999;
    }

    .search-input:focus {
      outline: 2px solid #fbbf24;
      outline-offset: 0;
    }

    .search-input:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .state-message {
      text-align: center;
      padding: 2rem 1rem;
      font-size: 1rem;
      opacity: 0.95;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .state-message.error {
      background: rgba(255, 0, 0, 0.2);
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 0, 0, 0.3);
      color: #ffcccc;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .initial-state {
      text-align: center;
      padding: 2rem 1rem;
      opacity: 0.85;
      font-size: 1rem;
    }

    .weather-display {
      background: rgba(255, 255, 255, 0.15);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .weather-main {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .icon-large {
      font-size: 4rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .temp-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .temperature {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .description {
      font-size: 1rem;
      opacity: 0.9;
      text-transform: capitalize;
    }

    .weather-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.85rem;
      opacity: 0.75;
    }

    .detail-value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .weather-widget {
        padding: 1.5rem;
        margin: 2rem 1rem;
      }

      .widget-header h3 {
        font-size: 1.25rem;
      }

      .weather-main {
        flex-direction: column;
        text-align: center;
      }

      .temperature {
        font-size: 2rem;
      }
    }
  `],
})
export class WeatherWidgetComponent implements OnDestroy {
  searchInput = '';
  state: WeatherState = {
    loading: false,
    error: null,
    city: null,
    temperature: null,
    humidity: null,
    icon: '🌤️',
    description: 'Desconhecido',
  };

  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  private readonly weatherCodeToEmoji: { [key: number]: { icon: string; description: string } } = {
    0: { icon: '☀️', description: 'Céu claro' },
    1: { icon: '🌤️', description: 'Maioritariamente claro' },
    2: { icon: '⛅', description: 'Parcialmente nublado' },
    3: { icon: '☁️', description: 'Nublado' },
    45: { icon: '🌫️', description: 'Névoa' },
    48: { icon: '🌫️', description: 'Névoa com geada' },
    51: { icon: '🌦️', description: 'Chuvisco leve' },
    53: { icon: '🌦️', description: 'Chuvisco moderado' },
    55: { icon: '🌧️', description: 'Chuvisco forte' },
    61: { icon: '🌧️', description: 'Chuva leve' },
    63: { icon: '🌧️', description: 'Chuva moderada' },
    65: { icon: '⛈️', description: 'Chuva forte' },
    71: { icon: '🌨️', description: 'Neve leve' },
    73: { icon: '🌨️', description: 'Neve moderada' },
    75: { icon: '🌨️', description: 'Neve forte' },
    77: { icon: '🌨️', description: 'Grãos de neve' },
    80: { icon: '🌧️', description: 'Aguaceiros leves' },
    81: { icon: '⛈️', description: 'Aguaceiros moderados' },
    82: { icon: '⛈️', description: 'Aguaceiros violentos' },
    85: { icon: '🌨️', description: 'Aguaceiros de neve leve' },
    86: { icon: '🌨️', description: 'Aguaceiros de neve forte' },
    95: { icon: '⛈️', description: 'Trovoada' },
    96: { icon: '⛈️', description: 'Trovoada com granizo leve' },
    99: { icon: '⛈️', description: 'Trovoada com granizo forte' },
  };

  constructor(private readonly http: HttpClient) {
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.search$.next(value);
  }

  private setupSearch(): void {
    this.search$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((query) => {
        if (query.trim().length < 2) {
          this.resetState();
          return;
        }
        this.searchCity(query);
      });
  }

  private searchCity(query: string): void {
    this.state = { ...this.state, loading: true, error: null };

    this.http
      .get<GeocodingResult>('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: query,
          count: '1',
          language: 'pt',
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (geoData) => {
          if (!geoData.results || geoData.results.length === 0) {
            this.state = {
              ...this.state,
              loading: false,
              error: 'Cidade não encontrada. Tente novamente.',
            };
            return;
          }

          const result = geoData.results[0];
          this.fetchWeather(result.latitude, result.longitude, result.name);
        },
        error: () => {
          this.state = {
            ...this.state,
            loading: false,
            error: 'Erro ao procurar a cidade. Tente novamente.',
          };
        },
      });
  }

  private fetchWeather(lat: number, lon: number, cityName: string): void {
    this.http
      .get<WeatherData>('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat.toString(),
          longitude: lon.toString(),
          current: 'temperature_2m,relative_humidity_2m,weather_code',
          timezone: 'auto',
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (weatherData) => {
          const temp = weatherData.current.temperature;
          const humidity = weatherData.current.relative_humidity;
          const code = weatherData.current.weather_code;

          const weatherInfo = this.weatherCodeToEmoji[code] || {
            icon: '🌤️',
            description: 'Desconhecido',
          };

          this.state = {
            loading: false,
            error: null,
            city: cityName,
            temperature: Math.round(temp),
            humidity,
            icon: weatherInfo.icon,
            description: weatherInfo.description,
          };
        },
        error: () => {
          this.state = {
            ...this.state,
            loading: false,
            error: 'Erro ao carregar dados do clima.',
          };
        },
      });
  }

  private resetState(): void {
    this.state = {
      loading: false,
      error: null,
      city: null,
      temperature: null,
      humidity: null,
      icon: '🌤️',
      description: 'Desconhecido',
    };
  }
}
