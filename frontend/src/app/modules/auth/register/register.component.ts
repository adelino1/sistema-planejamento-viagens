import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { TRAVEL_HERO_AUTH } from '../../../core/utils/travel-visuals';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  readonly visualBg = TRAVEL_HERO_AUTH;

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = null;
    const payload = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: () => {
        void this.router.navigateByUrl('/dashboard');
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message ?? 'Não foi possível criar a conta.';
      },
    });
  }
}
