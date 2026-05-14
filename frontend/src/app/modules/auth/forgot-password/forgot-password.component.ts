import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  message: string | null = null;
  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message = null;
    this.error = null;

    const { email } = this.form.getRawValue();

    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.message = res.message;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message ?? 'Pedido inválido.';
      },
    });
  }
}
