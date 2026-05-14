import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TripListComponent } from './trip-list/trip-list.component';
import { TripFormComponent } from './trip-form/trip-form.component';
import { TripDetailComponent } from './trip-detail/trip-detail.component';

const routes: Routes = [
  { path: '', component: TripListComponent },
  { path: 'new', component: TripFormComponent },
  { path: ':id/edit', component: TripFormComponent },
  { path: ':id', component: TripDetailComponent },
];

@NgModule({
  declarations: [TripListComponent, TripFormComponent, TripDetailComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class TripsModule {}
