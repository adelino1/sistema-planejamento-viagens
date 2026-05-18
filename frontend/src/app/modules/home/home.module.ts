import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { BudgetSimulatorComponent } from './components/budget-simulator.component';
import { FeaturedDestinationsComponent } from './components/featured-destinations.component';
import { FaqAccordionComponent } from './components/faq-accordion.component';
import { WeatherWidgetComponent } from './components/weather-widget.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BudgetSimulatorComponent,
    FeaturedDestinationsComponent,
    FaqAccordionComponent,
    WeatherWidgetComponent,
  ],
})
export class HomeModule {}
