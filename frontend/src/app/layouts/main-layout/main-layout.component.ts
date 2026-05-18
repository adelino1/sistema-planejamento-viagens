import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  menuOpen = false;

  constructor(
    readonly auth: AuthService,
    readonly theme: ThemeService,
    private readonly router: Router,
  ) {}

  get user() {
    return this.auth.getCurrentUser();
  }

  logout(): void {
    this.auth
      .logout()
      .pipe(finalize(() => void this.router.navigate(['/home'])))
      .subscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
