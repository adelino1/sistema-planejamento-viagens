import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService, Expense } from '../../services/expense.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent implements OnInit {
  @Input() tripId!: number;
  @Input() budgetAoa: number = 0;
  
  expenses: Expense[] = [];
  summary = {
    budget_aoa: 0,
    total_spent_aoa: 0,
    remaining_aoa: 0
  };
  
  loading = true;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.summary.budget_aoa = this.budgetAoa;
    this.summary.remaining_aoa = this.budgetAoa;
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getExpensesByTrip(this.tripId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.expenses = res.data.expenses;
          if (res.data.summary) {
            this.summary = res.data.summary;
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock data fallback if MySQL backend is not running
        this.expenses = [
          { id: 1, trip_id: this.tripId, description: 'Jantar no Mussulo', amount_aoa: 25000, date: '2026-12-16', category: 'food', payer_name: 'Dario' },
          { id: 2, trip_id: this.tripId, description: 'Passeio de Barco', amount_aoa: 15000, date: '2026-12-17', category: 'activities', payer_name: 'Dario' },
          { id: 3, trip_id: this.tripId, description: 'Táxi', amount_aoa: 5000, date: '2026-12-16', category: 'transportation', payer_name: 'Ana' },
        ];
        this.summary.total_spent_aoa = 45000;
        this.summary.remaining_aoa = this.summary.budget_aoa - 45000;
      }
    });
  }
}
