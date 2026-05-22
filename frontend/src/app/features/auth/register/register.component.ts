import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  auth = inject(AuthService);
  ns = inject(NotificationService);
  themeService = inject(ThemeService);
  router = inject(Router);

  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPass = signal(false);
  showConfirm = signal(false);
  loading = signal(false);
  error = signal('');

  passwordStrength = computed(() => {
    const p = this.password();
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  });

  strengthLabel = computed(() => {
    const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    return labels[this.passwordStrength()];
  });

  strengthColor = computed(() => {
    const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
    return colors[this.passwordStrength()];
  });

  async register() {
    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.error.set('Por favor, preencha todos os campos.');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.error.set('As senhas não coincidem.');
      return;
    }
    if (this.password().length < 6) {
      this.error.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.register({
        name: this.name(), email: this.email(),
        password: this.password(), confirmPassword: this.confirmPassword()
      });
      this.ns.success('Conta criada!', 'Bem-vindo ao TravelPlan.');
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  toggleTheme() { this.themeService.toggle(); }
}
