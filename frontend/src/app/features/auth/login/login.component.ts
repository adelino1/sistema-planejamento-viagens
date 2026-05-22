import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  auth = inject(AuthService);
  ns = inject(NotificationService);
  themeService = inject(ThemeService);
  router = inject(Router);

  email = signal('admin@travelplan.ao');
  password = signal('password');
  showPass = signal(false);
  loading = signal(false);
  error = signal('');

  async login() {
    if (!this.email() || !this.password()) {
      this.error.set('Por favor, preencha todos os campos.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login({ email: this.email(), password: this.password() });
      this.ns.success('Bem-vindo de volta!', 'Login realizado com sucesso.');
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  toggleTheme() { this.themeService.toggle(); }
}
