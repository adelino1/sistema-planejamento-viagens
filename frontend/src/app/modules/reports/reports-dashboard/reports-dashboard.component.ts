import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { TripService } from '../../../services/trip.service';
import { ExpenseService, Expense } from '../../../services/expense.service';
import { Trip } from '../../../models/trip.model';

interface TripReport {
  tripId: number;
  tripName: string;
  expenses: Expense[];
  currencySymbol: string;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss'],
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  readonly Object = Object;

  reports: TripReport[] = [];
  loading = true;
  error: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly tripService: TripService,
    private readonly expenseService: ExpenseService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReports(): void {
    this.loading = true;
    this.error = null;

    // Get trips for the user
    this.tripService.list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const trips: Trip[] = response.data?.trips || [];
          this.reports = trips.map(trip => ({
            tripId: trip.id,
            tripName: trip.name,
            expenses: [],
            currencySymbol: trip.budget_currency || '€',
            loading: true,
            error: null,
          }));

          // Load expenses for each trip
          this.reports.forEach((report, index) => {
            this.expenseService.getExpensesByTrip(report.tripId)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (res) => {
                  this.reports[index].expenses = res.data || [];
                  this.reports[index].loading = false;
                },
                error: (err: HttpErrorResponse) => {
                  this.reports[index].error = err.error?.message || 'Erro ao carregar despesas';
                  this.reports[index].loading = false;
                },
              });
          });

          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Erro ao carregar viagens';
          this.loading = false;
        },
      });
  }

  retry(): void {
    this.loadReports();
  }

  getTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + (!expense.is_estimated ? expense.amount : 0), 0);
  }

  getExpensesByCategory(expenses: Expense[]): Record<string, number> {
    const categories: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      categories[category] = (categories[category] || 0) + (!expense.is_estimated ? expense.amount : 0);
    });
    return categories;
  }
}
