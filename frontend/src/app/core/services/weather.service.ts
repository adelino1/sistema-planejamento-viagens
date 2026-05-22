import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

const WEATHER_ICONS: Record<number, { icon: string; desc: string }> = {
  0: { icon: '☀️', desc: 'Céu limpo' },
  1: { icon: '🌤️', desc: 'Maioritariamente limpo' },
  2: { icon: '⛅', desc: 'Parcialmente nublado' },
  3: { icon: '☁️', desc: 'Nublado' },
  45: { icon: '🌫️', desc: 'Nevoeiro' },
  48: { icon: '🌫️', desc: 'Nevoeiro gelado' },
  51: { icon: '🌦️', desc: 'Chuvisco leve' },
  53: { icon: '🌦️', desc: 'Chuvisco moderado' },
  55: { icon: '🌧️', desc: 'Chuvisco intenso' },
  61: { icon: '🌧️', desc: 'Chuva leve' },
  63: { icon: '🌧️', desc: 'Chuva moderada' },
  65: { icon: '🌧️', desc: 'Chuva intensa' },
  71: { icon: '🌨️', desc: 'Neve leve' },
  73: { icon: '🌨️', desc: 'Neve moderada' },
  80: { icon: '🌦️', desc: 'Aguaceiros' },
  85: { icon: '🌨️', desc: 'Neve com aguaceiros' },
  95: { icon: '⛈️', desc: 'Trovoada' },
  99: { icon: '⛈️', desc: 'Trovoada com granizo' }
};

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private cache = new Map<string, { data: WeatherData; ts: number }>();
  private readonly TTL = 10 * 60 * 1000;

  constructor(private http: HttpClient) {}

  async getWeather(lat: number, lon: number, city: string): Promise<WeatherData> {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.ts < this.TTL) return cached.data;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh`;
      const res: any = await firstValueFrom(this.http.get(url));
      const c = res.current;
      const wc = c.weather_code as number;
      const wi = WEATHER_ICONS[wc] ?? WEATHER_ICONS[0];
      const data: WeatherData = {
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        description: wi.desc,
        icon: wi.icon,
        city
      };
      this.cache.set(key, { data, ts: Date.now() });
      return data;
    } catch {
      return {
        temp: 24, feelsLike: 23, humidity: 65, windSpeed: 18,
        description: 'Céu limpo', icon: '☀️', city
      };
    }
  }
}
