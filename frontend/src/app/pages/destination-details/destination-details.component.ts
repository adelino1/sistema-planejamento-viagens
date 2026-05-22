import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CurrencyService } from '../../../core/services/currency.service';
import { ExploreBuilderComponent } from '../../../features/explore/explore-builder/explore-builder.component';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-destination-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ExploreBuilderComponent, MapComponent],
  templateUrl: './destination-details.component.html',
  styleUrl: './destination-details.component.scss'
})
export class DestinationDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  public currencyService = inject(CurrencyService);

  destination = signal<any>(null);
  hotels = signal<any[]>([]);
  restaurants = signal<any[]>([]);
  isLoading = signal(true);
  
  activeTab = signal<'info' | 'visual' | 'places'>('info');
  showPlanner = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadDestination(id);
      }
    });
  }

  loadDestination(id: string) {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/destination_detail.php?id=${id}`).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.destination.set(res.data.info);
          this.hotels.set(res.data.hotels);
          this.restaurants.set(res.data.restaurants);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  formatPrice(price: number): string {
    return this.currencyService.format(price);
  }
}
