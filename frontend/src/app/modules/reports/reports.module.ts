import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

import { ReportsDashboardComponent } from './reports-dashboard/reports-dashboard.component';
import { ExpenseChartComponent } from './expense-chart/expense-chart.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsDashboardComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [
    ReportsDashboardComponent,
    ExpenseChartComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    ReportsDashboardComponent,
  ],
})
export class ReportsModule {}
