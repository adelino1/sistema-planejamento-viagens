import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Impede utilizadores autenticados de acederem a páginas públicas (login/registo).
 */
@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return true;
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}
