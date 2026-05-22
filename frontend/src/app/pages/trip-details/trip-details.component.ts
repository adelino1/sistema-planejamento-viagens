import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MapComponent } from '../../components/map/map.component';
import { ExpenseListComponent } from '../../components/expense-list/expense-list.component';
import { TripService, Trip } from '../../services/trip.service';
import { TranslateModule } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, MapComponent, ExpenseListComponent, TranslateModule],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss'
})
export class TripDetailsComponent implements OnInit {
  trip: Trip | null = null;
  loading = true;
  error = '';
  activeTab = 'itinerary'; // itinerary, expenses, documents

  mapCenter: google.maps.LatLngLiteral = { lat: -8.839988, lng: 13.289437 }; // Luanda
  mapZoom = 12;
  mapMarkers = [
    { position: { lat: -8.8147, lng: 13.2305 }, title: 'Epic Sana Luanda' },
    { position: { lat: -8.9666, lng: 13.1333 }, title: 'Ilha do Mussulo' },
    { position: { lat: -8.8093, lng: 13.2291 }, title: 'Fortaleza de São Miguel' }
  ];

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTrip(id);
      }
    });
  }

  loadTrip(id: string) {
    this.tripService.getTrip(id).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.trip = res.data;
        } else {
          this.error = res.message || 'Viagem não encontrada';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // Mock data fallback if database isn't running
        this.trip = {
          id: parseInt(id),
          title: 'Férias de Verão no Mussulo',
          destination: 'Luanda, Angola',
          start_date: '2026-12-15',
          end_date: '2026-12-25',
          budget_aoa: 350000,
          cover_image: 'https://images.unsplash.com/photo-1574007623916-24879b2fa955?auto=format&fit=crop&q=80&w=1200'
        };
      }
    });
  }

  exportPDF() {
    if (!this.trip) return;
    const doc = new jsPDF();
    doc.text(`Roteiro da Viagem: ${this.trip.title}`, 14, 20);
    doc.text(`Destino: ${this.trip.destination}`, 14, 30);
    doc.text(`Período: ${this.trip.start_date} a ${this.trip.end_date}`, 14, 40);
    
    autoTable(doc, {
      startY: 50,
      head: [['Dia', 'Atividades', 'Notas']],
      body: [
        ['Dia 1', 'Chegada e Check-in no hotel', 'Confirmar transfer'],
        ['Dia 2', 'City Tour', 'Reservar com antecedência']
      ],
    });

    doc.save(`roteiro_${this.trip.id}.pdf`);
  }

  exportCSV() {
    if (!this.trip) return;
    const headers = ['Categoria', 'Descricao', 'Valor (AOA)', 'Data'];
    // Mock de despesas
    const expenses = [
      ['Alojamento', 'Hotel Epic Sana', '150000', '2026-12-15'],
      ['Alimentação', 'Restaurante Ilha', '25000', '2026-12-16']
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + expenses.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `despesas_${this.trip.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
