import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { TripService } from '../../../services/trip.service';
import { ItineraryActivity, ItineraryDay, Trip, TripDetailPayload } from '../../../models/trip.model';
import {
  coverImageForTrip,
  galleryImagesForTrip,
  mapIllustrationUrl,
  openStreetMapSearchUrl,
} from '../../../core/utils/travel-visuals';
import { ExpenseListComponent } from '../../expenses/expense-list/expense-list.component';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss'],
})
export class TripDetailComponent implements OnInit {
  trip: Trip | null = null;
  itinerary: TripDetailPayload['itinerary_days'] = [];
  loading = true;
  error: string | null = null;

  heroImage = '';
  galleryUrls: string[] = [];
  mapPreviewUrl = '';
  mapSearchUrl = '';

  readonly dayForm = this.fb.nonNullable.group({
    day_date: ['', Validators.required],
    notes: [''],
  });

  readonly activityForms: Record<number, ReturnType<FormBuilder['group']>> = {};

  tripId = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    readonly router: Router,
    private readonly tripsApi: TripService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.tripId = id ? Number(id) : 0;
    if (!this.tripId) {
      this.error = 'ID inválido';
      this.loading = false;
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.tripsApi.getOne(this.tripId).subscribe({
      next: (res) => {
        if (res.success) {
          this.trip = res.data.trip;
          this.itinerary = res.data.itinerary_days;
          this.heroImage = coverImageForTrip(this.trip);
          this.galleryUrls = galleryImagesForTrip(this.trip);
          this.mapPreviewUrl = mapIllustrationUrl();
          this.mapSearchUrl = openStreetMapSearchUrl(this.trip.city, this.trip.country);
          this.ensureActivityForms();
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar a viagem.';
        this.loading = false;
      },
    });
  }

  private ensureActivityForms(): void {
    for (const block of this.itinerary) {
      const id = block.day.id;
      if (!this.activityForms[id]) {
        this.activityForms[id] = this.fb.nonNullable.group({
          title: ['', Validators.required],
          location_name: [''],
          start_time: [''],
        });
      }
    }
  }

  addDay(): void {
    if (this.dayForm.invalid) {
      this.dayForm.markAllAsTouched();
      return;
    }
    const { day_date, notes } = this.dayForm.getRawValue();
    this.tripsApi
      .createDay(this.tripId, {
        day_date,
        notes: notes.trim() === '' ? null : notes,
      })
      .subscribe({
        next: () => {
          this.dayForm.reset({ day_date: '', notes: '' });
          this.load();
        },
        error: (e: HttpErrorResponse) => alert(e.error?.message ?? 'Erro ao adicionar dia'),
      });
  }

  removeDay(day: ItineraryDay): void {
    if (!confirm('Eliminar este dia e todas as atividades?')) {
      return;
    }
    this.tripsApi.deleteDay(day.id).subscribe({
      next: () => this.load(),
      error: () => alert('Erro ao eliminar dia'),
    });
  }

  addActivity(day: ItineraryDay): void {
    const g = this.activityForms[day.id];
    if (!g || g.invalid) {
      g?.markAllAsTouched();
      return;
    }
    const v = g.getRawValue();
    this.tripsApi
      .createActivity(day.id, {
        title: v.title,
        location_name: v.location_name?.trim() || null,
        start_time: v.start_time?.trim() || null,
        end_time: null,
      })
      .subscribe({
        next: () => {
          g.reset({ title: '', location_name: '', start_time: '' });
          this.load();
        },
        error: (e: HttpErrorResponse) => alert(e.error?.message ?? 'Erro'),
      });
  }

  removeActivity(a: ItineraryActivity): void {
    this.tripsApi.deleteActivity(a.id).subscribe({
      next: () => this.load(),
      error: () => alert('Erro'),
    });
  }

  deleteTrip(): void {
    if (!this.trip || !confirm('Eliminar esta viagem?')) {
      return;
    }
    this.tripsApi.delete(this.trip.id).subscribe({
      next: () => void this.router.navigate(['/trips']),
      error: () => alert('Erro ao eliminar'),
    });
  }
}
