import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * OpenWeatherMap API Free Tier
 * Documentação: https://openweathermap.org/api
 * 
 * Para usar com chave real:
 * 1. Criar conta gratuita em https://openweathermap.org/api
 * 2. Gerar chave de API em https://openweathermap.org/api/one-call-3
 * 3. Copiar a chave para a variável apiKey abaixo
 * 
 * Free tier permite: 1000 chamadas/dia, atualizado a cada 10 minutos
 */

export interface WeatherResponse {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number };
  clouds: { all: number };
  dt: number;
  name: string;
  cod: number;
}

export interface WeatherWidget {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  /**
   * ⚠️ IMPORTANTE: Substituir pela sua chave de API
   * Chave gratuita em: https://openweathermap.org/api
   * 
   * Exemplo: private readonly apiKey = 'YOUR_API_KEY_HERE';
   * 
   * Se nenhuma chave for fornecida, o serviço retorna dados mockados
   */
  private readonly apiKey = 'DEMO_KEY'; // Substituir com chave real
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  /**
   * Mapeamento de weather codes para emojis descritivos
   * Baseado em: https://openweathermap.org/weather-conditions
   */
  private readonly weatherIcons: { [key: string]: string } = {
    '01d': '☀️', // Clear sky (day)
    '01n': '🌙', // Clear sky (night)
    '02d': '🌤️', // Few clouds (day)
    '02n': '🌙', // Few clouds (night)
    '03d': '☁️', // Scattered clouds
    '03n': '☁️',
    '04d': '☁️', // Broken clouds
    '04n': '☁️',
    '09d': '🌧️', // Shower rain
    '09n': '🌧️',
    '10d': '🌦️', // Rain (day)
    '10n': '🌧️', // Rain (night)
    '11d': '⛈️', // Thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // Snow
    '13n': '❄️',
    '50d': '🌫️', // Mist
    '50n': '🌫️',
  };

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtém informações de clima para uma cidade
   * @param city Nome da cidade (ex: "Paris", "Rio de Janeiro")
   * @param country Código do país ISO (ex: "PT", "BR") - opcional
   * @returns Observable com dados formatados do clima
   */
  getWeatherByCity(city: string, country?: string): Observable<WeatherWidget | null> {
    if (!city || city.trim().length === 0) {
      return of(null);
    }

    // Se usar chave demo ou não configurada, retorna dados mockados
    if (this.apiKey === 'DEMO_KEY') {
      return of(this.generateMockWeather(city));
    }

    const query = country ? `${city},${country}` : city;

    return this.http
      .get<WeatherResponse>(this.apiUrl, {
        params: {
          q: query,
          appid: this.apiKey,
          units: 'metric', // Temperatura em Celsius
          lang: 'pt', // Descrição em Português
        },
      })
      .pipe(
        map((response) => this.parseWeatherResponse(response)),
        catchError(() => {
          // Se falhar, retorna mock data como fallback
          return of(this.generateMockWeather(city));
        }),
      );
  }

  /**
   * Faz parsing da resposta da API e formata para o widget
   */
  private parseWeatherResponse(response: WeatherResponse): WeatherWidget {
    const weatherData = response.weather[0];
    const icon = this.weatherIcons[weatherData.icon] || '🌤️';

    return {
      city: response.name,
      temperature: Math.round(response.main.temp),
      description: this.capitalizeFirstLetter(weatherData.description),
      icon,
      humidity: response.main.humidity,
      windSpeed: Math.round(response.wind.speed * 10) / 10, // 1 decimal
      lastUpdated: new Date(),
    };
  }

  /**
   * Gera dados mockados realistas para testes/fallback
   * Simula diferentes condições de tempo por padrão
   */
  private generateMockWeather(city: string): WeatherWidget {
    const conditions = [
      { temp: 22, desc: 'Céu claro', icon: '☀️', humidity: 45 },
      { temp: 18, desc: 'Nublado', icon: '☁️', humidity: 65 },
      { temp: 25, desc: 'Ensolarado e agradável', icon: '🌤️', humidity: 40 },
      { temp: 16, desc: 'Chuva ligeira', icon: '🌧️', humidity: 80 },
      { temp: 20, desc: 'Parcialmente nublado', icon: '🌦️', humidity: 55 },
    ];

    // Seleciona aleatoriamente uma condição baseada na hash da cidade
    const hashCode = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const condition = conditions[hashCode % conditions.length];

    return {
      city,
      temperature: condition.temp,
      description: condition.desc,
      icon: condition.icon,
      humidity: condition.humidity,
      windSpeed: 8 + Math.random() * 10,
      lastUpdated: new Date(),
    };
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
