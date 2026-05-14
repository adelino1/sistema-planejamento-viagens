import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Notificações globais simples (substituível por toast library nas fases seguintes).
 */
@Injectable({ providedIn: 'root' })
export class AppNotificationsService {
  private readonly messageSubject = new BehaviorSubject<string | null>(null);

  readonly message$ = this.messageSubject.asObservable();

  publishHttpError(message: string): void {
    this.messageSubject.next(message);
  }

  clear(): void {
    this.messageSubject.next(null);
  }
}
