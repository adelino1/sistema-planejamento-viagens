import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TripService } from '../../../services/trip.service';
import { TripStatus } from '../../../models/trip.model';
import { TRAVEL_HERO_AUTH } from '../../../core/utils/travel-visuals';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
  readonly statuses: TripStatus[] = ['draft', 'planned', 'ongoing', 'completed', 'cancelled'];
  readonly formHero = TRAVEL_HERO_AUTH;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    budget_amount: [0, [Validators.required, Validators.min(0)]],
    budget_currency: ['EUR', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    description: [''],
    status: ['draft' as TripStatus, Validators.required],
  });

  isEdit = false;
  tripId: number | null = null;
  error: string | null = null;
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tripsApi: TripService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const url = this.router.url;
    if (idParam && url.includes('/edit')) {
      this.isEdit = true;
      this.tripId = Number(idParam);
      this.loading = true;
      this.tripsApi.getOne(this.tripId).subscribe({
        next: (res) => {
          if (res.success) {
            const t = res.data.trip;
            this.form.patchValue({
              name: t.name,
              country: t.country,
              city: t.city,
              start_date: t.start_date,
              end_date: t.end_date,
              budget_amount: Number(t.budget_amount),
              budget_currency: t.budget_currency,
              description: t.description ?? '',
              status: t.status,
            });
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Viagem não encontrada.';
          this.loading = false;
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = null;
    const raw = this.form.getRawValue();
    const body = {
      ...raw,
      budget_amount: raw.budget_amount,
      description: raw.description.trim() === '' ? null : raw.description,
    };

    if (this.isEdit && this.tripId !== null) {
      this.tripsApi.update(this.tripId, body).subscribe({
        next: () => void this.router.navigate(['/trips', this.tripId]),
        error: (e: HttpErrorResponse) => (this.error = e.error?.message ?? 'Erro ao guardar.'),
      });
    } else {
      this.tripsApi.create(body).subscribe({
        next: (res) => {
          if (res.success) {
            void this.router.navigate(['/trips', res.data.trip.id]);
          }
        },
        error: (e: HttpErrorResponse) => (this.error = e.error?.message ?? 'Erro ao criar.'),
      });
    }
  }

  cancel(): void {
    if (this.isEdit && this.tripId !== null) {
      void this.router.navigate(['/trips', this.tripId]);
    } else {
      void this.router.navigate(['/trips']);
    }
  }
}
