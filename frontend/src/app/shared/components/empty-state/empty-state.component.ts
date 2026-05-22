import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <div class="empty__icon">{{ icon }}</div>
      <h3 class="empty__title">{{ title }}</h3>
      <p class="empty__desc">{{ description }}</p>
      @if (actionLabel) {
        <button class="btn btn--primary btn--lg" (click)="action.emit()">
          @if (actionIcon) { <span class="material-icons">{{ actionIcon }}</span> }
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty { display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 24px; text-align: center; gap: 12px; }
    .empty__icon { font-size: 4rem; line-height: 1; margin-bottom: 8px; }
    .empty__title { font-size: 1.25rem; font-weight: 700; color: var(--text); }
    .empty__desc { color: var(--text-2); font-size: 0.9rem; max-width: 380px; line-height: 1.6; margin-bottom: 8px; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'Nenhum resultado';
  @Input() description = 'Não há dados para mostrar.';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  @Output() action = new EventEmitter<void>();
}
