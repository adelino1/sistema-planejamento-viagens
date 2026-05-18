import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  description: string;
  humidity: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly apiUrl = '/api/v1/weather';

  constructor(private http: HttpClient) {}

  /**
   * Obtém o clima atual para uma localidade.
   * @param city Nome da cidade
   * @param country Código do país (opcional)
   */
  getCurrentWeather(city: string, country?: string): Observable<WeatherData> {
    const params: any = { city };
    if (country) params.country = country;
    return this.http.get<WeatherData>(`${this.apiUrl}/current`, { params });
  }

  /**
   * Obtém a previsão do tempo para os próximos dias.
   * @param city Nome da cidade
   * @param days Número de dias a prever (padrão 7)
   */
  getForecast(city: string, days: number = 7): Observable<WeatherForecast[]> {
    return this.http.get<WeatherForecast[]>(`${this.apiUrl}/forecast`, {
      params: { city, days: days.toString() },
    });
  }

  /**
   * Obtém o clima para múltiplas cidades (batch).
   */
  getMultipleCities(cities: string[]): Observable<WeatherData[]> {
    return this.http.post<WeatherData[]>(`${this.apiUrl}/batch`, { cities });
  }
}
