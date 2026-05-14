import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: AuthUser | null = null;
  error: string | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (res) => {
        if (res.success) {
          this.user = res.data.user;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message ?? 'Sessão inválida.';
        this.auth.clearSession();
        void this.router.navigate(['/auth/login']);
      },
    });
  }
}
