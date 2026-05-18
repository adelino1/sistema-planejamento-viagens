import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { TripService, Trip } from '../../services/trip.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;
  error = '';

  constructor(private tripService: TripService) {}

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.tripService.getTrips().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.trips = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar as viagens. Certifique-se de que o servidor XAMPP está a correr o MySQL e Apache.';
        this.loading = false;
        
        // Mock data fallback se o banco de dados não estiver rodando no XAMPP do usuário
        this.trips = [
          {
            id: 1,
            title: 'Férias de Verão no Mussulo',
            destination: 'Luanda, Angola',
            start_date: '2026-12-15',
            end_date: '2026-12-25',
            budget_aoa: 350000,
            cover_image: 'https://images.unsplash.com/photo-1574007623916-24879b2fa955?auto=format&fit=crop&q=80&w=600'
          },
          {
            id: 2,
            title: 'Aventura na Natureza',
            destination: 'Malanje, Angola',
            start_date: '2027-02-10',
            end_date: '2027-02-15',
            budget_aoa: 150000,
            cover_image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=600'
          }
        ];
      }
    });
  }
}
