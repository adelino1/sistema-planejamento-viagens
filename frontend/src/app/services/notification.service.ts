import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'trip' | 'expense' | 'system';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationDto {
  type: 'info' | 'success' | 'warning' | 'error' | 'trip' | 'expense' | 'system';
  title: string;
  message: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getNotifications(read?: boolean, limit = 50): Observable<{ data: Notification[]; count: number }> {
    let params = '';
    if (read !== undefined) {
      params += `?read=${read}`;
    }
    if (limit !== 50) {
      params += (params ? '&' : '?') + `limit=${limit}`;
    }
    return this.http.get<{ data: Notification[]; count: number }>(`${this.apiUrl}/notifications${params}`);
  }

  getUnreadCount(): Observable<{ data: { count: number } }> {
    return this.http.get<{ data: { count: number } }>(`${this.apiUrl}/notifications/unread-count`);
  }

  getNotification(id: number): Observable<{ data: Notification }> {
    return this.http.get<{ data: Notification }>(`${this.apiUrl}/notifications/${id}`);
  }

  createNotification(dto: CreateNotificationDto): Observable<{ data: Notification }> {
    return this.http.post<{ data: Notification }>(`${this.apiUrl}/notifications`, dto);
  }

  markAsRead(id: number): Observable<{ data: Notification }> {
    return this.http.put<{ data: Notification }>(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ data: { marked_count: number } }> {
    return this.http.put<{ data: { marked_count: number } }>(`${this.apiUrl}/notifications/read-all`, {});
  }

  deleteNotification(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/notifications/${id}`);
  }
}
