import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trip {
  id?: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_aoa: number;
  cover_image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  // URL local para a API PHP no XAMPP
  private apiUrl = 'http://localhost/sistema-planejamento-viagens/backend/api/trips';

  constructor(private http: HttpClient) { }

  getTrips(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getTrip(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTrip(trip: Trip): Observable<any> {
    return this.http.post<any>(this.apiUrl, trip);
  }
}
