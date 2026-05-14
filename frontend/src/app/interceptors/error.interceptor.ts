import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppNotificationsService } from '../core/services/app-notifications.service';

/**
 * Erros HTTP globais. Pedidos a /api/v1/auth/* ficam a cargo dos ecrãs de autenticação (mensagens inline).
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly notifications: AppNotificationsService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          const url = err.url ?? req.url;
          if (!url.includes('/api/v1/auth/')) {
            const msg =
              (typeof err.error === 'object' && err.error !== null && 'message' in err.error
                ? String((err.error as { message?: string }).message)
                : null) ?? err.message ?? 'Erro de rede ou servidor.';
            this.notifications.publishHttpError(msg);
          }
        }
        return throwError(() => err);
      }),
    );
  }
}
