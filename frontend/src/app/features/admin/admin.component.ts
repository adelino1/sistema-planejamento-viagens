import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TripService } from '../../core/services/trip.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { Trip, STATUS_LABELS } from '../../core/models/trip.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  auth = inject(AuthService);
  tripService = inject(TripService);
  ns = inject(NotificationService);

  tab = signal<'overview' | 'users' | 'trips' | 'logs'>('overview');
  userSearch = signal('');
  tripSearch = signal('');
  statusLabels = STATUS_LABELS;

  users = computed(() => {
    const q = this.userSearch().toLowerCase();
    return this.auth.getAllUsers().filter(u =>
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  allTrips = computed(() => {
    const q = this.tripSearch().toLowerCase();
    return this.tripService.getAll().filter(t =>
      !q || t.destination.toLowerCase().includes(q) || t.country.toLowerCase().includes(q)
    );
  });

  globalStats = computed(() => {
    const trips = this.tripService.getAll();
    const users = this.auth.getAllUsers();
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalTrips: trips.length,
      planned: trips.filter(t => t.status === 'planned').length,
      completed: trips.filter(t => t.status === 'completed').length,
      totalBudget: trips.reduce((s, t) => s + t.budget, 0),
      adminCount: users.filter(u => u.role === 'admin').length
    };
  });

  systemLogs = [
    { id: 1, action: 'LOGIN', user: 'admin@travelplan.ao', details: 'Login bem-sucedido', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), type: 'info' },
    { id: 2, action: 'TRIP_CREATED', user: 'joao@email.com', details: 'Criou viagem: Paris', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), type: 'success' },
    { id: 3, action: 'TRIP_DELETED', user: 'joao@email.com', details: 'Eliminou viagem ID 12', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), type: 'warning' },
    { id: 4, action: 'REGISTER', user: 'ana@email.com', details: 'Nova conta criada', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), type: 'success' },
    { id: 5, action: 'EXPENSE_ADDED', user: 'joao@email.com', details: 'Despesa: Voo AOA 150.000', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), type: 'info' },
    { id: 6, action: 'PROFILE_UPDATED', user: 'ana@email.com', details: 'Perfil actualizado', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), type: 'info' },
    { id: 7, action: 'LOGIN_FAILED', user: 'unknown@email.com', details: 'Tentativa de login falhada', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), type: 'danger' },
    { id: 8, action: 'TRIP_UPDATED', user: 'joao@email.com', details: 'Actualizou viagem: Bali', timestamp: new Date(Date.now() - 240 * 60000).toISOString(), type: 'info' }
  ];

  formatTime(ts: string): string {
    return new Date(ts).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  toggleUserStatus(user: User) {
    this.ns.info(`Utilizador ${user.isActive ? 'desactivado' : 'activado'}`, user.name);
  }

  getDays(t: Trip): number { return this.tripService.getDays(t); }
}
