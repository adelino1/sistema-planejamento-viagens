import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
import { AuthUser } from '../../models/user.model';
import { Trip } from '../../models/trip.model';
import { coverImageForTrip } from '../../core/utils/travel-visuals';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: AuthUser | null = null;
  error: string | null = null;

  trips: Trip[] = [];
  tripsLoading = true;

  /** Alturas relativas para mini “gráfico” decorativo (CSS). */
  readonly sparkHeights = [35, 55, 40, 70, 50, 80, 60, 90, 45, 75];

  constructor(
    private readonly auth: AuthService,
    private readonly tripsApi: TripService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (res) => {
        if (res.success) {
          this.user = res.data.user;
        }
        this.loadTrips();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message ?? 'Sessão inválida.';
        this.auth.clearSession();
        void this.router.navigate(['/auth/login']);
      },
    });
  }

  private loadTrips(): void {
    this.tripsApi.list().subscribe({
      next: (res) => {
        if (res.success) {
          this.trips = res.data.trips;
        }
        this.tripsLoading = false;
      },
      error: () => {
        this.tripsLoading = false;
      },
    });
  }

  get tripCount(): number {
    return this.trips.length;
  }

  get plannedCount(): number {
    return this.trips.filter((t) => t.status === 'planned' || t.status === 'ongoing').length;
  }

  get spotlightTrip(): Trip | null {
    if (!this.trips.length) {
      return null;
    }
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = this.trips
      .filter((t) => t.end_date >= today)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
    return upcoming[0] ?? this.trips[0] ?? null;
  }

  get previewTrips(): Trip[] {
    return this.trips.slice(0, 4);
  }

  coverUrl(t: Trip): string {
    return coverImageForTrip(t);
  }
}
