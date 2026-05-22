import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal modal--sm" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">{{ title }}</h3>
          </div>
          <div class="modal__body">
            <div class="confirm-icon confirm-icon--{{ type }}">
              <span class="material-icons">{{ getIcon() }}</span>
            </div>
            <p class="confirm-msg">{{ message }}</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" (click)="onCancel()">{{ cancelLabel }}</button>
            <button class="btn btn--{{ type === 'danger' ? 'danger' : 'primary' }}"
              [disabled]="loading" (click)="onConfirm()">
              @if (loading) { <span class="spinner spinner--sm"></span> }
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-icon { width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      .material-icons { font-size: 32px; }
      &--danger { background: #FEE2E2; color: #DC2626; }
      &--warning { background: #FEF3C7; color: #D97706; }
      &--info { background: #DBEAFE; color: #2563EB; }
    }
    [data-theme="dark"] {
      .confirm-icon--danger { background: rgba(239,68,68,0.15); }
      .confirm-icon--warning { background: rgba(245,158,11,0.15); }
      .confirm-icon--info { background: rgba(37,99,235,0.15); }
    }
    .confirm-msg { text-align: center; color: var(--text-2); font-size: 0.9rem; line-height: 1.6; }
  `]
})
export class ConfirmDialogComponent {
  @Input() show = false;
  @Input() title = 'Confirmar acção';
  @Input() message = 'Tem a certeza que deseja continuar?';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() loading = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  getIcon(): string {
    return { danger: 'delete_forever', warning: 'warning', info: 'help_outline' }[this.type];
  }
  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}
