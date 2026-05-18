import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { ExpenseCardComponent } from './expense-card/expense-card.component';

@NgModule({
  declarations: [
    ExpenseListComponent,
    ExpenseFormComponent,
    ExpenseCardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [
    ExpenseListComponent,
    ExpenseFormComponent,
    ExpenseCardComponent,
  ],
})
export class ExpensesModule {}
