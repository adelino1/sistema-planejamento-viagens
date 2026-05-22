import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TripStateService } from './trip-state.service';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'; // PHP Backend base URL
  
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal<boolean>(false);
  public showAuthModal = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private tripState: TripStateService
  ) {}

  public openModal() {
    this.showAuthModal.set(true);
  }

  public closeModal() {
    this.showAuthModal.set(false);
  }

  public async login(email: string, password: string) {
    try {
      const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/login`, { email, password }));
      if (res && res.token && res.user) {
        this.currentUser.set(res.user);
        this.isAuthenticated.set(true);
        localStorage.setItem('auth_token', res.token);
        
        await this.syncGuestDraft(res.user.id);
        
        this.closeModal();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  }

  public async register(name: string, email: string, password: string) {
    try {
      const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/register`, { name, email, password }));
      if (res && res.token && res.user) {
        this.currentUser.set(res.user);
        this.isAuthenticated.set(true);
        localStorage.setItem('auth_token', res.token);
        
        await this.syncGuestDraft(res.user.id);
        
        this.closeModal();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Register error', e);
      return false;
    }
  }

  private async syncGuestDraft(userId: string) {
    const draft = this.tripState.tripDraft();
    if (draft && (draft.activities.length > 0 || draft.destination)) {
      console.log('Migrating draft to cloud for user', userId, draft);
      try {
        const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/trips/sync`, { userId, draft }));
        console.log('Draft synced successfully', res);
        // Em um app real, o draft local seria substituído por um roteiro referenciado pelo ID real do banco
      } catch (e) {
        console.error('Failed to sync draft', e);
      }
    }
  }

  public logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.tripState.clearDraft(); // Limpa rascunhos ao sair
  }
}
