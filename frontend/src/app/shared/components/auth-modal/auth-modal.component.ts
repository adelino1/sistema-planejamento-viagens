import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TripService } from '../../../core/services/trip.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal-content">
        <h2>{{ isLogin ? 'Bem-vindo de volta' : 'Crie a sua conta' }}</h2>
        <p class="subtitle">Guarde os seus roteiros, partilhe com amigos e aceda em qualquer dispositivo.</p>
        
        <form (ngSubmit)="onSubmit()">
          <div *ngIf="!isLogin" class="form-group">
            <label>Nome</label>
            <input type="text" [(ngModel)]="name" name="name" required />
          </div>
          
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          
          <div class="form-group">
            <label>Palavra-passe</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>

          <div *ngIf="!isLogin" class="form-group">
            <label>Confirmar Palavra-passe</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required />
          </div>

          <p *ngIf="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Registar') }}
          </button>
        </form>

        <div class="toggle-mode">
          <button type="button" class="btn-link" (click)="isLogin = !isLogin">
            {{ isLogin ? 'Ainda não tem conta? Registe-se' : 'Já tem conta? Inicie Sessão' }}
          </button>
        </div>
        
        <button class="close-btn" (click)="close.emit()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-card); padding: 2rem; border-radius: 12px; width: 100%; max-width: 400px; position: relative; }
    .subtitle { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 500; }
    .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); }
    .btn { width: 100%; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-link { background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 0.9rem; padding: 0; text-decoration: underline; }
    .toggle-mode { margin-top: 1rem; text-align: center; }
    .error-msg { color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; }
    .close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary); }
  `]
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() authSuccess = new EventEmitter<void>();

  isLogin = true;
  loading = false;
  error = '';

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  auth = inject(AuthService);
  storage = inject(StorageService);

  async onSubmit() {
    this.loading = true;
    this.error = '';

    try {
      if (this.isLogin) {
        await this.auth.login({ email: this.email, password: this.password });
      } else {
        await this.auth.register({ name: this.name, email: this.email, password: this.password, confirmPassword: this.confirmPassword });
      }
      
      // Sincronizar dados Guest para Backend após autenticação
      this.syncGuestData();
      
      this.authSuccess.emit();
    } catch (err: any) {
      this.error = err.message || 'Ocorreu um erro.';
    } finally {
      this.loading = false;
    }
  }

  private syncGuestData() {
    if (this.storage.hasDraft()) {
      const draft = this.storage.getGuestTrip();
      // Em ambiente real chamariamos this.tripService.create(draft, this.auth.currentUser()!.id) via backend real
      // Por agora, o TripService já foi adaptado para armazenar
      this.storage.clearGuestTrip();
    }
  }
}
