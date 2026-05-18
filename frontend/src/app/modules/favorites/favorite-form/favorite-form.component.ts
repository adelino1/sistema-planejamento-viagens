import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CreateFavoriteDto, Favorite } from '../../../services/favorite.service';

@Component({
  selector: 'app-favorite-form',
  templateUrl: './favorite-form.component.html',
  styleUrls: ['./favorite-form.component.scss'],
})
export class FavoriteFormComponent {
  @Input() favorite: Favorite | null = null;
  @Input() loading = false;
  @Output() submit = new EventEmitter<CreateFavoriteDto>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    favorite_type: ['place', Validators.required],
    label: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    country: [''],
    city: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
  });

  readonly types = [
    { value: 'destination', label: 'Destino' },
    { value: 'place', label: 'Local' },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(): void {
    if (this.favorite) {
      this.form.patchValue({
        favorite_type: this.favorite.favorite_type,
        label: this.favorite.label,
        country: this.favorite.country || '',
        city: this.favorite.city || '',
        latitude: this.favorite.latitude || null,
        longitude: this.favorite.longitude || null,
      });
    } else {
      this.form.reset({
        favorite_type: 'place',
        label: '',
        country: '',
        city: '',
        latitude: null,
        longitude: null,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submit.emit({
      ...value,
      favorite_type: value.favorite_type as 'place' | 'destination',
      latitude: value.latitude ?? undefined,
      longitude: value.longitude ?? undefined,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
