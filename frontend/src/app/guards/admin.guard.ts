import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    const user = this.auth.getCurrentUser();
    if (this.auth.isLoggedIn() && user?.role === 'admin') {
      return true;
    }

    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}
