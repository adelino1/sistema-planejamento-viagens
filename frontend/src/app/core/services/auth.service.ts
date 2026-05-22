import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginPayload, RegisterPayload } from '../models/user.model';

const DEMO_USERS: User[] = [
  {
    id: 1, name: 'Admin TravelPlan', email: 'admin@travelplan.ao',
    role: 'admin', createdAt: '2024-01-01T00:00:00Z', isActive: true,
    phone: '+244 923 456 789', country: 'Angola', bio: 'Administrador do sistema.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&crop=face',
    preferences: { theme: 'light', language: 'pt', currency: 'AOA', notifications: true }
  },
  {
    id: 2, name: 'João Silva', email: 'joao@email.com',
    role: 'client', createdAt: '2024-03-15T00:00:00Z', isActive: true,
    phone: '+244 912 345 678', country: 'Angola', bio: 'Apaixonado por viagens e cultura.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&crop=face',
    preferences: { theme: 'light', language: 'pt', currency: 'USD', notifications: true }
  },
  {
    id: 3, name: 'Ana Pereira', email: 'ana@email.com',
    role: 'client', createdAt: '2024-05-20T00:00:00Z', isActive: true,
    phone: '+244 934 567 890', country: 'Angola', bio: 'Viajante e fotógrafa.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&crop=face',
    preferences: { theme: 'dark', language: 'en', currency: 'EUR', notifications: false }
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('tp_user');
      if (stored) {
        const user = JSON.parse(stored) as User;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }
    } catch { /* ignore */ }
  }

  login(payload: LoginPayload): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = DEMO_USERS.find(
          u => u.email === payload.email && u.isActive
        );
        if (user && (payload.password === 'password' || payload.password.length >= 6)) {
          this.setUser(user);
          resolve(user);
        } else {
          reject(new Error('Email ou senha incorretos. Use: admin@travelplan.ao / password'));
        }
      }, 800);
    });
  }

  register(payload: RegisterPayload): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.password !== payload.confirmPassword) {
          reject(new Error('As senhas não coincidem'));
          return;
        }
        const existing = DEMO_USERS.find(u => u.email === payload.email);
        if (existing) {
          reject(new Error('Este email já está registado'));
          return;
        }
        const newUser: User = {
          id: Date.now(),
          name: payload.name,
          email: payload.email,
          role: 'client',
          createdAt: new Date().toISOString(),
          isActive: true,
          preferences: { theme: 'light', language: 'pt', currency: 'AOA', notifications: true }
        };
        DEMO_USERS.push(newUser);
        this.setUser(newUser);
        resolve(newUser);
      }, 900);
    });
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('tp_user');
    localStorage.removeItem('tp_token');
    this.router.navigate(['/login']);
  }

  updateProfile(updates: Partial<User>): Promise<User> {
    return new Promise(resolve => {
      setTimeout(() => {
        const updated = { ...this.currentUser()!, ...updates };
        this.setUser(updated);
        resolve(updated);
      }, 600);
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('tp_token');
  }

  getAllUsers(): User[] {
    return DEMO_USERS;
  }

  private setUser(user: User) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('tp_user', JSON.stringify(user));
    localStorage.setItem('tp_token', `demo.token.${user.id}.${Date.now()}`);
  }
}
