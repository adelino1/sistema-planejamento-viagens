import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TripService } from '../../core/services/trip.service';
import { WeatherService, WeatherData } from '../../core/services/weather.service';
import { Trip, STATUS_LABELS } from '../../core/models/trip.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  tripService = inject(TripService);
  weatherService = inject(WeatherService);

  user = computed(() => this.auth.currentUser());
  loading = signal(true);
  stats = signal({ total: 0, planned: 0, ongoing: 0, completed: 0, cancelled: 0, totalBudget: 0, favorites: 0 });
  recentTrips = signal<Trip[]>([]);
  upcomingTrips = signal<Trip[]>([]);
  weather = signal<WeatherData | null>(null);
  weatherLoading = signal(true);

  statusLabels = STATUS_LABELS;

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  ngOnInit() {
    const userId = this.user()?.id ?? 0;
    const isAdmin = this.auth.isAdmin();
    const trips = isAdmin ? this.tripService.getAll() : this.tripService.getByUser(userId);

    this.stats.set(isAdmin
      ? this.computeAllStats(trips)
      : this.tripService.getStats(userId)
    );

    const sorted = [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    this.recentTrips.set(sorted.slice(0, 6));

    const now = new Date().toISOString().slice(0, 10);
    const upcoming = trips
      .filter(t => t.startDate >= now && t.status === 'planned')
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    this.upcomingTrips.set(upcoming.slice(0, 3));

    this.loading.set(false);

    if (upcoming.length > 0) {
      const next = upcoming[0];
      this.weatherService.getWeather(next.lat, next.lon, next.destination).then(w => {
        this.weather.set(w);
        this.weatherLoading.set(false);
      });
    } else if (trips.length > 0) {
      const t = trips[0];
      this.weatherService.getWeather(t.lat, t.lon, t.destination).then(w => {
        this.weather.set(w);
        this.weatherLoading.set(false);
      });
    } else {
      this.weatherLoading.set(false);
    }
  }

  private computeAllStats(trips: Trip[]) {
    return {
      total: trips.length,
      planned: trips.filter(t => t.status === 'planned').length,
      ongoing: trips.filter(t => t.status === 'ongoing').length,
      completed: trips.filter(t => t.status === 'completed').length,
      cancelled: trips.filter(t => t.status === 'cancelled').length,
      totalBudget: trips.reduce((s, t) => s + t.budget, 0),
      favorites: trips.filter(t => t.isFavorite).length
    };
  }

  getDays(trip: Trip): number {
    return this.tripService.getDays(trip);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getStatusInfo(status: string) {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS];
  }
}
