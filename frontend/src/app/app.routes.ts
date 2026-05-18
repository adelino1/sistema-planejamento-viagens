import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TripDetailsComponent } from './pages/trip-details/trip-details.component';
import { AiPlannerComponent } from './pages/ai-planner/ai-planner.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'trip/:id', component: TripDetailsComponent },
    { path: 'ai-planner', component: AiPlannerComponent },
    { path: '**', redirectTo: '' }
];
