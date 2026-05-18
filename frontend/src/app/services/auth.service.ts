import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { ApiEnvelope } from '../models/api-response.model';
import { AuthUser } from '../models/user.model';

export interface AuthTokenPayload {
  token: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'tp_access_token';
  private readonly userKey = 'tp_user';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readUserFromStorage());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  register(payload: { full_name: string; email: string; password: string }): Observable<ApiEnvelope<AuthTokenPayload>> {
    return this.http.post<ApiEnvelope<AuthTokenPayload>>('/api/v1/auth/register', payload).pipe(
      tap((res) => {
        if (res.success) {
          this.persistSession(res.data.token, res.data.user);
        }
      }),
    );
  }

  login(payload: { email: string; password: string }): Observable<ApiEnvelope<AuthTokenPayload>> {
    return this.http.post<ApiEnvelope<AuthTokenPayload>>('/api/v1/auth/login', payload).pipe(
      tap((res) => {
        if (res.success) {
          this.persistSession(res.data.token, res.data.user);
        }
      }),
    );
  }

  logout(): Observable<ApiEnvelope<Record<string, never>>> {
    return this.http.post<ApiEnvelope<Record<string, never>>>('/api/v1/auth/logout', {}).pipe(
      finalize(() => {
        this.clearSession();
      }),
    );
  }

  me(): Observable<ApiEnvelope<{ user: AuthUser }>> {
    return this.http.get<ApiEnvelope<{ user: AuthUser }>>('/api/v1/auth/me').pipe(
      tap((res) => {
        if (res.success) {
          this.setUser(res.data.user);
        }
      }),
    );
  }

  forgotPassword(email: string): Observable<ApiEnvelope<Record<string, never>>> {
    return this.http.post<ApiEnvelope<Record<string, never>>>('/api/v1/auth/forgot-password', { email });
  }

  resetPassword(payload: { token: string; password: string }): Observable<ApiEnvelope<Record<string, never>>> {
    return this.http.post<ApiEnvelope<Record<string, never>>>('/api/v1/auth/reset-password', payload);
  }

  tryRestoreSessionFromStorage(): void {
    const user = this.readUserFromStorage();
    if (user && this.getAccessToken()) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * ⚠️  LOGIN ADMIN TEMPORÁRIO PARA DESENVOLVIMENTO
   * 
   * Chama o endpoint de login admin temporário (login_admin_dev.php).
   * Este método deve ser removido em produção.
   * 
   * Credenciais hardcoded:
   * - Email: admin@viagens.com
   * - Senha: admin123
   */
  loginDev(payload: { email: string; password: string }): Observable<ApiEnvelope<AuthTokenPayload>> {
    return this.http.post<ApiEnvelope<AuthTokenPayload>>('/login_admin_dev.php', payload).pipe(
      tap((res) => {
        if (res.success) {
          this.persistSession(res.data.token, res.data.user);
        }
      }),
    );
  }

  private persistSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private readUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
