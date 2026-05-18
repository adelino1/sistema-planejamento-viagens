import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CreateExpenseDto, Expense } from '../../../services/expense.service';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent {
  @Input() expense: Expense | null = null;
  @Input() loading = false;
  @Output() submit = new EventEmitter<CreateExpenseDto>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    category: ['accommodation', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    currency: ['EUR', Validators.required],
    description: [''],
    expense_date: ['', Validators.required],
    is_estimated: [true],
  });

  readonly categories = [
    { value: 'accommodation', label: 'Alojamento' },
    { value: 'food', label: 'Alimentação' },
    { value: 'transport', label: 'Transporte' },
    { value: 'activities', label: 'Atividades' },
    { value: 'other', label: 'Outro' },
  ];

  readonly currencies = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'BRL', label: 'BRL (R$)' },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(): void {
    if (this.expense) {
      this.form.patchValue({
        category: this.expense.category,
        amount: this.expense.amount,
        currency: this.expense.currency,
        description: this.expense.description || '',
        expense_date: this.expense.expense_date,
        is_estimated: this.expense.is_estimated,
      });
    } else {
      this.form.reset({
        category: 'accommodation',
        amount: 0,
        currency: 'EUR',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        is_estimated: true,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submit.emit(value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
