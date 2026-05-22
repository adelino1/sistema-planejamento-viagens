import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <!-- Close button -->
        <button (click)="close.emit()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              {{ isLogin ? 'Bem-vindo de volta' : 'Crie sua conta' }}
            </h2>
            <p class="text-sm text-gray-500">
              Crie uma conta para salvar seu roteiro e acessar de qualquer lugar. É grátis!
            </p>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 mb-6">
            <button 
              class="w-1/2 py-2 font-medium text-sm border-b-2 transition-colors"
              [class.border-blue-600]="isLogin"
              [class.text-blue-600]="isLogin"
              [class.border-transparent]="!isLogin"
              [class.text-gray-500]="!isLogin"
              (click)="isLogin = true">
              Entrar
            </button>
            <button 
              class="w-1/2 py-2 font-medium text-sm border-b-2 transition-colors"
              [class.border-blue-600]="!isLogin"
              [class.text-blue-600]="!isLogin"
              [class.border-transparent]="isLogin"
              [class.text-gray-500]="isLogin"
              (click)="isLogin = false">
              Cadastrar
            </button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div *ngIf="!isLogin">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" [(ngModel)]="name" name="name" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" [(ngModel)]="password" name="password" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            </div>

            <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="isLoading"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center">
              <span *ngIf="isLoading" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </span>
              {{ isLogin ? 'Entrar' : 'Criar Conta e Salvar Roteiro' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  isLogin = true;
  isLoading = false;
  errorMessage = '';

  name = '';
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    let result = false;
    
    if (this.isLogin) {
      result = await this.authService.login({email: this.email, password: this.password});
    } else {
      result = await this.authService.register({name: this.name, email: this.email, password: this.password, confirmPassword: this.password});
    }
    
    this.isLoading = false;
    
    if (result) {
      this.success.emit();
      this.close.emit();
    } else {
      this.errorMessage = 'Credenciais inválidas ou erro no servidor.';
    }
  }
}
