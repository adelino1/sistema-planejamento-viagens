import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id: number;
  trip_id: number;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  expense_date: string;
  is_estimated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseDto {
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  expense_date?: string;
  is_estimated?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getExpensesByTrip(tripId: number): Observable<{ data: Expense[]; count: number }> {
    return this.http.get<{ data: Expense[]; count: number }>(
      `${this.apiUrl}/trips/${tripId}/expenses`
    );
  }

  createExpense(tripId: number, dto: CreateExpenseDto): Observable<{ data: Expense }> {
    return this.http.post<{ data: Expense }>(
      `${this.apiUrl}/trips/${tripId}/expenses`,
      dto
    );
  }

  getExpense(id: number): Observable<{ data: Expense }> {
    return this.http.get<{ data: Expense }>(`${this.apiUrl}/expenses/${id}`);
  }

  updateExpense(id: number, dto: Partial<CreateExpenseDto>): Observable<{ data: Expense }> {
    return this.http.put<{ data: Expense }>(`${this.apiUrl}/expenses/${id}`, dto);
  }

  deleteExpense(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/expenses/${id}`);
  }

  /**
   * Calcula totais de despesas por trip.
   */
  calculateTotals(expenses: Expense[]): {
    totalEstimated: number;
    totalActual: number;
    byCategory: { [key: string]: number };
  } {
    return {
      totalEstimated: expenses
        .filter((e) => e.is_estimated)
        .reduce((sum, e) => sum + e.amount, 0),
      totalActual: expenses
        .filter((e) => !e.is_estimated)
        .reduce((sum, e) => sum + e.amount, 0),
      byCategory: expenses.reduce(
        (acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        },
        {} as { [key: string]: number }
      ),
    };
  }
}
