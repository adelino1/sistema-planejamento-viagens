import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AppNotificationsService } from './core/services/app-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Sistema de Planejamento de Viagens';

  httpError: string | null = null;

  private sub?: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly notifications: AppNotificationsService,
  ) {}

  ngOnInit(): void {
    this.auth.tryRestoreSessionFromStorage();
    this.sub = this.notifications.message$.subscribe((msg) => {
      this.httpError = msg;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismissAlert(): void {
    this.notifications.clear();
    this.httpError = null;
  }
}
