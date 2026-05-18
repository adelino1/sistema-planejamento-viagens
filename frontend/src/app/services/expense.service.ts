import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id?: number;
  trip_id: number;
  payer_user_id?: number;
  payer_name?: string;
  description: string;
  amount_aoa: number;
  original_amount?: number;
  original_currency?: string;
  date: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost/sistema-planejamento-viagens/backend/api/expenses';

  constructor(private http: HttpClient) { }

  getExpensesByTrip(tripId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?trip_id=${tripId}`);
  }

  addExpense(expense: Expense): Observable<any> {
    return this.http.post<any>(this.apiUrl, expense);
  }
}
