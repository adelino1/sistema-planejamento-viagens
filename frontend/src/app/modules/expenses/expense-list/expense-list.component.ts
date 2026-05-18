import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ExpenseService, Expense, CreateExpenseDto } from '../../../services/expense.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
})
export class ExpenseListComponent implements OnInit, OnDestroy {
  protected readonly Object = Object;
  @Input() tripId!: number;
  @Input() currencySymbol = '€';

  expenses: Expense[] = [];
  loading = true;
  error: string | null = null;
  showForm = false;
  editingExpense: Expense | null = null;
  submitting = false;
  exporting = false;

  totals = {
    totalEstimated: 0,
    totalActual: 0,
    byCategory: {} as Record<string, number>,
  };

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly exportService: ExportService,
  ) {}

  ngOnInit(): void {
    if (this.tripId) {
      this.loadExpenses();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadExpenses(): void {
    this.loading = true;
    this.error = null;
    this.expenseService.getExpensesByTrip(this.tripId).subscribe({
      next: (res) => {
        this.expenses = res.data;
        this.totals = this.expenseService.calculateTotals(this.expenses);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Erro ao carregar despesas';
        this.loading = false;
      },
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.editingExpense = null;
  }

  onEditExpense(expense: Expense): void {
    this.editingExpense = expense;
    this.showForm = true;
  }

  onSubmitExpense(dto: CreateExpenseDto): void {
    this.submitting = true;

    const request = this.editingExpense
      ? this.expenseService.updateExpense(this.editingExpense.id, dto)
      : this.expenseService.createExpense(this.tripId, dto);

    request.subscribe({
      next: () => {
        this.showForm = false;
        this.editingExpense = null;
        this.submitting = false;
        this.loadExpenses();
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'Erro ao guardar despesa');
        this.submitting = false;
      },
    });
  }

  onCancelExpense(): void {
    this.showForm = false;
    this.editingExpense = null;
  }

  onDeleteExpense(id: number): void {
    this.expenseService.deleteExpense(id).subscribe({
      next: () => {
        this.loadExpenses();
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'Erro ao eliminar despesa');
      },
    });
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

  get sortedExpenses(): Expense[] {
    return [...this.expenses].sort((a, b) =>
      new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );
  }

  exportToCSV(): void {
    if (this.expenses.length === 0) {
      alert('Não há despesas para exportar');
      return;
    }

    this.exporting = true;
    try {
      this.exportService.exportToCSV(this.expenses, {
        currencySymbol: this.currencySymbol,
        tripName: 'Despesas-Viagem',
      });
    } finally {
      this.exporting = false;
    }
  }

  async exportToPDF(): Promise<void> {
    if (this.expenses.length === 0) {
      alert('Não há despesas para exportar');
      return;
    }

    this.exporting = true;
    try {
      await this.exportService.exportToPDF(this.expenses, {
        currencySymbol: this.currencySymbol,
        tripName: 'Despesas-Viagem',
      });
    } finally {
      this.exporting = false;
    }
  }
}
