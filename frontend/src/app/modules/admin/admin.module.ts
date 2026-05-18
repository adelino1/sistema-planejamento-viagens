import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminGuard } from '../../guards/admin.guard';
import { AdminHomeComponent } from './admin-home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminHomeComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminHomeComponent,
    DashboardComponent,
    UserManagementComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule { }
