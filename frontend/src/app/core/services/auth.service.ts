import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GuestItineraryService } from './guest-itinerary.service';
import { firstValueFrom } from 'rxjs';
import { User, LoginPayload, RegisterPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost/sistema-planejamento-viagens/backend/api';
  
  public currentUser = signal<User | null>(this.loadUser());
  public isAuthenticated = signal<boolean>(!!this.loadUser());

  // Dummy data for users, to support admin panel
  private dummyUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: new Date().toISOString() },
    { id: 2, name: 'Normal User', email: 'user@example.com', role: 'client', isActive: true, createdAt: new Date().toISOString() }
  ];

  constructor(
    private http: HttpClient,
    private guestItinerary: GuestItineraryService
  ) {}

  private loadUser(): User | null {
    const userStr = localStorage.getItem('tripnomad_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private setSession(user: User, token: string) {
    // Add missing mock properties so UI doesn't crash
    if (!user.role) user.role = user.email.includes('admin') ? 'admin' : 'client';
    if (!user.avatar) user.avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
    if (!user.createdAt) user.createdAt = new Date().toISOString();
    if (user.isActive === undefined) user.isActive = true;

    localStorage.setItem('tripnomad_user', JSON.stringify(user));
    localStorage.setItem('tripnomad_token', token);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  public getToken(): string | null {
    return localStorage.getItem('tripnomad_token');
  }

  async login(credentials: LoginPayload): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_URL}/auth/login.php`, credentials)
      );
      
      this.setSession(response.user, response.token);
      await this.syncGuestDraft();
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  }

  async register(credentials: RegisterPayload): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_URL}/auth/register.php`, credentials)
      );
      
      this.setSession(response.user, response.token);
      await this.syncGuestDraft();
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  }

  public logout() {
    localStorage.removeItem('tripnomad_user');
    localStorage.removeItem('tripnomad_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  public isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  public getAllUsers(): User[] {
    // Ideally this would fetch from backend, but mock it for now since the components expect it synchronously
    return this.dummyUsers;
  }

  public async updateProfile(data: Partial<User>): Promise<boolean> {
    const current = this.currentUser();
    if (current) {
      const updated = { ...current, ...data };
      this.setSession(updated, this.getToken() || '');
      return true;
    }
    return false;
  }

  // Critical Logic: Syncing Guest Draft to Cloud
  private async syncGuestDraft() {
    const draft = this.guestItinerary.getDraftData();
    const token = this.getToken();
    
    if (draft && draft.days.length > 0 && token) {
      try {
        console.log('Syncing guest draft to cloud...', draft);
        await firstValueFrom(
          this.http.post<any>(`${this.API_URL}/itinerary/sync.php`, draft, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );
        // Clean up guest mode after successful sync
        this.guestItinerary.clearDraft();
        console.log('Draft synced and cleared.');
      } catch (error) {
        console.error('Failed to sync guest draft', error);
      }
    }
  }
}
