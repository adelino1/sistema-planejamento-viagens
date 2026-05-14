import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({
    token: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  message: string | null = null;
  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.patchValue({ token });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message = null;
    this.error = null;
    const { token, password } = this.form.getRawValue();

    this.auth.resetPassword({ token, password }).subscribe({
      next: (res) => {
        this.message = res.message;
        setTimeout(() => {
          void this.router.navigateByUrl('/auth/login');
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message ?? 'Não foi possível redefinir a palavra-passe.';
      },
    });
  }
}
