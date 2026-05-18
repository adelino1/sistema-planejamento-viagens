import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  totalExpenses: string;
  averageTripsPerUser: number;
}

export interface AdminUsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = '/api/v1/admin';

  constructor(private http: HttpClient) {}

  /**
   * Obtém estatísticas do dashboard.
   */
  getStats(): Observable<{ data: AdminDashboardStats }> {
    return this.http.get<{ data: AdminDashboardStats }>(`${this.apiUrl}/dashboard/stats`);
  }

  /**
   * Obtém utilizadores recentes.
   */
  getRecentUsers(limit: number = 10): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(`${this.apiUrl}/dashboard/recent-users`, {
      params: { limit: limit.toString() },
    });
  }

  /**
   * Obtém viagens recentes.
   */
  getRecentTrips(limit: number = 10): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/dashboard/recent-trips`, {
      params: { limit: limit.toString() },
    });
  }

  /**
   * Lista todos os utilizadores (paginado).
   */
  listUsers(page: number = 1, limit: number = 20): Observable<AdminUsersResponse> {
    return this.http.get<AdminUsersResponse>(`${this.apiUrl}/users`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }

  /**
   * Obtém um utilizador.
   */
  getUser(id: number): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Atualiza um utilizador.
   */
  updateUser(id: number, data: Partial<User>): Observable<{ data: User }> {
    return this.http.put<{ data: User }>(`${this.apiUrl}/users/${id}`, data);
  }

  /**
   * Elimina um utilizador.
   */
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Desativa um utilizador.
   */
  deactivateUser(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  /**
   * Ativa um utilizador.
   */
  activateUser(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/users/${id}/activate`, {});
  }
}
