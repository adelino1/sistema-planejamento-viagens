import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TripService } from '../../core/services/trip.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  auth = inject(AuthService);
  tripService = inject(TripService);
  themeService = inject(ThemeService);
  ns = inject(NotificationService);

  user = computed(() => this.auth.currentUser()!);
  isDark = computed(() => this.themeService.isDark());

  tab = signal<'info' | 'security' | 'trips' | 'prefs'>('info');

  form = signal({
    name: this.auth.currentUser()?.name ?? '',
    email: this.auth.currentUser()?.email ?? '',
    phone: this.auth.currentUser()?.phone ?? '',
    country: this.auth.currentUser()?.country ?? '',
    bio: this.auth.currentUser()?.bio ?? ''
  });

  passForm = signal({ current: '', newPass: '', confirm: '' });
  showPass = signal({ current: false, newPass: false, confirm: false });
  saving = signal(false);
  savingPass = signal(false);

  userTrips = computed(() => {
    const uid = this.user().id;
    return this.tripService.getByUser(uid);
  });

  stats = computed(() => this.tripService.getStats(this.user().id));

  initials = computed(() => {
    return this.user().name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  });

  updateForm(field: string, val: string) {
    this.form.update(f => ({ ...f, [field]: val }));
  }

  async saveProfile() {
    this.saving.set(true);
    try {
      await this.auth.updateProfile({
        name: this.form().name,
        phone: this.form().phone,
        country: this.form().country,
        bio: this.form().bio
      });
      this.ns.success('Perfil actualizado!');
    } catch (e: any) {
      this.ns.error('Erro ao guardar', e.message);
    } finally {
      this.saving.set(false);
    }
  }

  async savePassword() {
    const f = this.passForm();
    if (!f.newPass || !f.confirm) {
      this.ns.error('Campos obrigatórios', 'Preencha a nova senha e confirmação.');
      return;
    }
    if (f.newPass !== f.confirm) {
      this.ns.error('Senhas diferentes', 'A nova senha e a confirmação não coincidem.');
      return;
    }
    if (f.newPass.length < 6) {
      this.ns.error('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    this.savingPass.set(true);
    await new Promise(r => setTimeout(r, 800));
    this.passForm.set({ current: '', newPass: '', confirm: '' });
    this.savingPass.set(false);
    this.ns.success('Senha alterada com sucesso!');
  }

  toggleTheme() { this.themeService.toggle(); }

  setPassField(field: 'current' | 'newPass' | 'confirm', val: string) {
    this.passForm.update(f => ({ ...f, [field]: val }));
  }

  toggleShowField(field: 'current' | 'newPass' | 'confirm') {
    this.showPass.update(p => ({ ...p, [field]: !p[field] }));
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getDays(t: any): number { return this.tripService.getDays(t); }
}
