import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of ns.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="ns.remove(toast.id)">
          <span class="toast__icon material-icons">{{ getIcon(toast.type) }}</span>
          <div class="toast__body">
            <div class="toast__title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast__msg">{{ toast.message }}</div>
            }
          </div>
          <button class="toast__close material-icons" (click)="ns.remove(toast.id)">close</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 24px; right: 24px;
      z-index: 9999; display: flex; flex-direction: column; gap: 10px;
      max-width: 380px; width: calc(100vw - 48px);
    }
    .toast {
      display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border: 1px solid transparent; cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.4,0,0.2,1);
      &__icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
      &__body { flex: 1; min-width: 0; }
      &__title { font-size: 0.875rem; font-weight: 700; line-height: 1.3; }
      &__msg { font-size: 0.8rem; opacity: 0.85; margin-top: 2px; }
      &__close { font-size: 16px; flex-shrink: 0; opacity: 0.7; background: none; border: none;
        cursor: pointer; padding: 0; color: inherit; &:hover { opacity: 1; } }
      &--success { background: #ECFDF5; color: #065F46; border-color: #A7F3D0; .toast__icon { color: #10B981; } }
      &--error { background: #FEF2F2; color: #991B1B; border-color: #FECACA; .toast__icon { color: #EF4444; } }
      &--warning { background: #FFFBEB; color: #92400E; border-color: #FDE68A; .toast__icon { color: #F59E0B; } }
      &--info { background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE; .toast__icon { color: #3B82F6; } }
    }
    [data-theme="dark"] .toast {
      &--success { background: #064E3B; color: #A7F3D0; border-color: #065F46; }
      &--error { background: #7F1D1D; color: #FECACA; border-color: #991B1B; }
      &--warning { background: #78350F; color: #FDE68A; border-color: #92400E; }
      &--info { background: #1E3A8A; color: #BFDBFE; border-color: #1D4ED8; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @media (max-width: 480px) {
      .toast-container { bottom: 16px; right: 16px; width: calc(100vw - 32px); }
    }
  `]
})
export class ToastComponent {
  ns = inject(NotificationService);
  getIcon(type: Toast['type']): string {
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    return icons[type];
  }
}
