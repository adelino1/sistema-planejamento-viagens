import { Routes } from '@angular/router';
import { ExploreComponent } from './pages/explore/explore.component';

export const routes: Routes = [
  { path: '', component: ExploreComponent },
  { path: '**', redirectTo: '' }
];
