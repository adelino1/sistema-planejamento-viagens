import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Favorite {
  id: number;
  user_id: number;
  favorite_type: 'destination' | 'place';
  label: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  metadata_json?: any;
  created_at: string;
}

export interface CreateFavoriteDto {
  favorite_type: 'destination' | 'place';
  label: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  metadata?: any;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<{ data: Favorite[]; count: number }> {
    return this.http.get<{ data: Favorite[]; count: number }>(`${this.apiUrl}/favorites`);
  }

  getFavorite(id: number): Observable<{ data: Favorite }> {
    return this.http.get<{ data: Favorite }>(`${this.apiUrl}/favorites/${id}`);
  }

  createFavorite(dto: CreateFavoriteDto): Observable<{ data: Favorite }> {
    return this.http.post<{ data: Favorite }>(`${this.apiUrl}/favorites`, dto);
  }

  updateFavorite(id: number, dto: Partial<CreateFavoriteDto>): Observable<{ data: Favorite }> {
    return this.http.put<{ data: Favorite }>(`${this.apiUrl}/favorites/${id}`, dto);
  }

  deleteFavorite(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/favorites/${id}`);
  }
}
