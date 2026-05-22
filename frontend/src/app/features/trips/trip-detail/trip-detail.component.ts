import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../core/services/trip.service';
import { WeatherService, WeatherData } from '../../../core/services/weather.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Trip, Expense, EXPENSE_CATEGORIES, STATUS_LABELS } from '../../../core/models/trip.model';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss'
})
export class TripDetailComponent implements OnInit {
  Math = Math;
  route = inject(ActivatedRoute);
  router = inject(Router);
  tripService = inject(TripService);
  weatherService = inject(WeatherService);
  ns = inject(NotificationService);

  trip = signal<Trip | null>(null);
  expenses = signal<Expense[]>([]);
  weather = signal<WeatherData | null>(null);
  weatherLoading = signal(true);
  loading = signal(true);

  showExpenseModal = signal(false);
  savingExpense = signal(false);
  showConfirm = signal(false);
  deleting = signal(false);

  expenseForm = signal({
    description: '', amount: 0, currency: 'USD',
    category: 'transport' as Expense['category'],
    date: new Date().toISOString().slice(0, 10),
    paidBy: '', participants: ''
  });

  categories = EXPENSE_CATEGORIES;
  statusLabels = STATUS_LABELS;

  totalExpenses = computed(() => this.expenses().reduce((s, e) => s + e.amount, 0));

  expensesByCat = computed(() => {
    const cats: Record<string, number> = {};
    for (const e of this.expenses()) {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    }
    return cats;
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const trip = this.tripService.getById(id);
    if (!trip) { this.router.navigate(['/trips']); return; }
    this.trip.set(trip);
    this.expenses.set(this.tripService.getExpenses(id));
    this.loading.set(false);
    this.weatherService.getWeather(trip.lat, trip.lon, trip.destination).then(w => {
      this.weather.set(w);
      this.weatherLoading.set(false);
    });
  }

  getDays(): number {
    const t = this.trip();
    return t ? this.tripService.getDays(t) : 0;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  toggleFav() {
    const t = this.trip();
    if (!t) return;
    this.tripService.toggleFavorite(t.id);
    this.trip.update(tr => tr ? { ...tr, isFavorite: !tr.isFavorite } : null);
  }

  openExpenseModal() {
    this.expenseForm.set({
      description: '', amount: 0, currency: this.trip()?.currency || 'USD',
      category: 'transport', date: new Date().toISOString().slice(0, 10),
      paidBy: '', participants: ''
    });
    this.showExpenseModal.set(true);
  }

  updateExpForm(field: string, value: any) {
    this.expenseForm.update(f => ({ ...f, [field]: value }));
  }

  async saveExpense() {
    const f = this.expenseForm();
    if (!f.description || !f.amount) {
      this.ns.error('Campos obrigatórios', 'Preencha a descrição e o valor.');
      return;
    }
    this.savingExpense.set(true);
    try {
      const e = await this.tripService.addExpense({
        tripId: this.trip()!.id,
        description: f.description,
        amount: Number(f.amount),
        currency: f.currency,
        category: f.category,
        date: f.date,
        paidBy: f.paidBy || 'Eu',
        participants: f.participants.split(',').map(p => p.trim()).filter(Boolean)
      });
      this.expenses.update(ex => [...ex, e]);
      this.showExpenseModal.set(false);
      this.ns.success('Despesa adicionada!');
    } catch (err: any) {
      this.ns.error('Erro', err.message);
    } finally {
      this.savingExpense.set(false);
    }
  }

  async deleteExpense(id: number) {
    await this.tripService.deleteExpense(id);
    this.expenses.update(ex => ex.filter(e => e.id !== id));
    this.ns.success('Despesa eliminada.');
  }

  confirmDeleteTrip() { this.showConfirm.set(true); }

  async doDeleteTrip() {
    this.deleting.set(true);
    try {
      await this.tripService.delete(this.trip()!.id);
      this.ns.success('Viagem eliminada.');
      this.router.navigate(['/trips']);
    } finally {
      this.deleting.set(false);
    }
  }

  getCategoryIcon(cat: string): string {
    return this.categories.find(c => c.value === cat)?.icon ?? 'receipt';
  }

  getCategoryLabel(cat: string): string {
    return this.categories.find(c => c.value === cat)?.label ?? cat;
  }

  openMaps() {
    const t = this.trip();
    if (!t) return;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(t.destination + ', ' + t.country)}`, '_blank');
  }
}
