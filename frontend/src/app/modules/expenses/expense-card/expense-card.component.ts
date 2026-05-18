import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Expense } from '../../../services/expense.service';

@Component({
  selector: 'app-expense-card',
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
})
export class ExpenseCardComponent {
  @Input() expense!: Expense;
  @Input() currencySymbol = '€';
  @Output() edit = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<number>();

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      accommodation: '🏨',
      food: '🍽️',
      transport: '🚗',
      activities: '🎯',
      other: '📦',
    };
    return icons[category] || '📦';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      accommodation: 'Alojamento',
      food: 'Alimentação',
      transport: 'Transporte',
      activities: 'Atividades',
      other: 'Outro',
    };
    return labels[category] || category;
  }

  onEdit(): void {
    this.edit.emit(this.expense);
  }

  onDelete(): void {
    if (confirm('Tem a certeza de que deseja eliminar esta despesa?')) {
      this.delete.emit(this.expense.id);
    }
  }
}
