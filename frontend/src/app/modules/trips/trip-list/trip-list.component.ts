import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripService } from '../../../services/trip.service';
import { Trip } from '../../../models/trip.model';
import { coverImageForTrip } from '../../../core/utils/travel-visuals';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private readonly tripsApi: TripService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.tripsApi.list().subscribe({
      next: (res) => {
        if (res.success) {
          this.trips = res.data.trips;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar as viagens.';
        this.loading = false;
      },
    });
  }

  goNew(): void {
    void this.router.navigate(['/trips/new']);
  }

  coverUrl(t: Trip): string {
    return coverImageForTrip(t);
  }
}
