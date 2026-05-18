import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id: number;
  trip_id: number;
  type: string;
  provider: string;
  confirmation_code?: string;
  booking_date: string;
  check_in_date?: string;
  check_out_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingDto {
  type: string;
  provider: string;
  confirmation_code?: string;
  booking_date?: string;
  check_in_date?: string;
  check_out_date?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getBookingsByTrip(tripId: number): Observable<{ data: Booking[]; count: number }> {
    return this.http.get<{ data: Booking[]; count: number }>(
      `${this.apiUrl}/trips/${tripId}/bookings`
    );
  }

  createBooking(tripId: number, dto: CreateBookingDto): Observable<{ data: Booking }> {
    return this.http.post<{ data: Booking }>(`${this.apiUrl}/trips/${tripId}/bookings`, dto);
  }

  getBooking(id: number): Observable<{ data: Booking }> {
    return this.http.get<{ data: Booking }>(`${this.apiUrl}/bookings/${id}`);
  }

  updateBooking(id: number, dto: Partial<CreateBookingDto>): Observable<{ data: Booking }> {
    return this.http.put<{ data: Booking }>(`${this.apiUrl}/bookings/${id}`, dto);
  }

  deleteBooking(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/bookings/${id}`);
  }

  /**
   * Agrupa reservas por tipo.
   */
  groupByType(bookings: Booking[]): { [key: string]: Booking[] } {
    return bookings.reduce(
      (acc, booking) => {
        if (!acc[booking.type]) {
          acc[booking.type] = [];
        }
        acc[booking.type].push(booking);
        return acc;
      },
      {} as { [key: string]: Booking[] }
    );
  }
}
