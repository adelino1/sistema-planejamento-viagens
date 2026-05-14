import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEnvelope } from '../models/api-response.model';
import { ItineraryActivity, ItineraryDay, Trip, TripDetailPayload } from '../models/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<ApiEnvelope<{ trips: Trip[] }>> {
    return this.http.get<ApiEnvelope<{ trips: Trip[] }>>('/api/v1/trips');
  }

  getOne(id: number): Observable<ApiEnvelope<TripDetailPayload>> {
    return this.http.get<ApiEnvelope<TripDetailPayload>>(`/api/v1/trips/${id}`);
  }

  create(body: Partial<Trip> & Record<string, unknown>): Observable<ApiEnvelope<{ trip: Trip }>> {
    return this.http.post<ApiEnvelope<{ trip: Trip }>>('/api/v1/trips', body);
  }

  update(id: number, body: Partial<Trip> & Record<string, unknown>): Observable<ApiEnvelope<{ trip: Trip }>> {
    return this.http.put<ApiEnvelope<{ trip: Trip }>>(`/api/v1/trips/${id}`, body);
  }

  delete(id: number): Observable<ApiEnvelope<Record<string, never>>> {
    return this.http.delete<ApiEnvelope<Record<string, never>>>(`/api/v1/trips/${id}`);
  }

  listDays(tripId: number): Observable<ApiEnvelope<{ itinerary_days: ItineraryDay[] }>> {
    return this.http.get<ApiEnvelope<{ itinerary_days: ItineraryDay[] }>>(`/api/v1/trips/${tripId}/itinerary-days`);
  }

  createDay(tripId: number, body: { day_date: string; sort_order?: number; notes?: string | null }): Observable<ApiEnvelope<{ itinerary_day: ItineraryDay }>> {
    return this.http.post<ApiEnvelope<{ itinerary_day: ItineraryDay }>>(`/api/v1/trips/${tripId}/itinerary-days`, body);
  }

  deleteDay(dayId: number): Observable<ApiEnvelope<Record<string, never>>> {
    return this.http.delete<ApiEnvelope<Record<string, never>>>(`/api/v1/itinerary-days/${dayId}`);
  }

  listActivities(dayId: number): Observable<ApiEnvelope<{ activities: ItineraryActivity[] }>> {
    return this.http.get<ApiEnvelope<{ activities: ItineraryActivity[] }>>(`/api/v1/itinerary-days/${dayId}/activities`);
  }

  createActivity(
    dayId: number,
    body: { title: string; location_name?: string | null; start_time?: string | null; end_time?: string | null; sort_order?: number; notes?: string | null },
  ): Observable<ApiEnvelope<{ activity: ItineraryActivity }>> {
    return this.http.post<ApiEnvelope<{ activity: ItineraryActivity }>>(`/api/v1/itinerary-days/${dayId}/activities`, body);
  }

  deleteActivity(activityId: number): Observable<ApiEnvelope<Record<string, never>>> {
    return this.http.delete<ApiEnvelope<Record<string, never>>>(`/api/v1/itinerary-activities/${activityId}`);
  }
}
