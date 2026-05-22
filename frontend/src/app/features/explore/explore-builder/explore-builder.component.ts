import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GuestItineraryService, TripItem } from '../../../core/services/guest-itinerary.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { AuthModalComponent } from '../../auth/auth-modal/auth-modal.component';

@Component({
  selector: 'app-explore-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent, AuthModalComponent],
  template: `
    <div class="fixed inset-0 bg-white z-40 overflow-y-auto flex flex-col md:flex-row">
      <!-- Close button -->
      <button (click)="close.emit()" class="absolute top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-black">
        <span class="material-icons">arrow_back</span>
      </button>

      <!-- Sidebar Builder -->
      <div class="w-full md:w-1/3 p-6 flex flex-col border-r border-gray-200 mt-12 md:mt-0 h-full overflow-y-auto">
        <h2 class="text-3xl font-bold mb-1">{{ destination?.name }}</h2>
        <p class="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <span class="material-icons text-sm">location_on</span> {{ destination?.country || destination?.continent }}
        </p>

        <!-- Wizard Step -->
        @if (!isGenerated) {
          <div class="wizard fade-in">
            <h3 class="text-xl font-bold mb-4">Planear Viagem Inteligente</h3>
            
            <div class="form-group mb-4">
              <label>Datas da Viagem</label>
              <div class="flex gap-2">
                <input type="date" class="form-control" [(ngModel)]="wizardData.startDate">
                <input type="date" class="form-control" [(ngModel)]="wizardData.endDate">
              </div>
            </div>

            <div class="form-group mb-4">
              <label>Tipo de Viagem</label>
              <select class="form-control" [(ngModel)]="wizardData.tripType">
                <option value="luxo">Luxo</option>
                <option value="economica">Económica</option>
                <option value="aventura">Aventura</option>
                <option value="romantica">Romântica</option>
                <option value="familiar">Familiar</option>
                <option value="mochilao">Mochilão</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label>Interesses (Separados por vírgula)</label>
              <input type="text" class="form-control" placeholder="ex: praias, museus, gastronomia" [(ngModel)]="wizardData.interests">
            </div>

            <button class="btn btn--primary btn--full mt-4" (click)="generateItinerary()">
              <span class="material-icons">auto_awesome</span> Gerar Itinerário com IA
            </button>
          </div>
        } @else {
          <!-- Generated Itinerary -->
          <div class="flex-1 fade-in">
             <div class="flex justify-between items-center mb-4">
               <h3 class="font-bold text-xl flex items-center gap-2">
                  <span class="material-icons text-primary">edit_calendar</span> Seu Roteiro Inteligente
               </h3>
               <button class="btn btn--icon btn--ghost" (click)="isGenerated = false"><span class="material-icons">refresh</span></button>
             </div>
             
             <!-- Weather Widget -->
             <div *ngIf="weather" class="bg-gradient-to-r from-sky-100 to-blue-50 border border-sky-200 text-sky-900 p-4 rounded-xl mb-6 flex items-center justify-between">
               <div>
                 <div class="text-sm font-bold">Clima Atual ({{ weather.main.temp }}°C)</div>
                 <div class="text-xs opacity-80">{{ weather.weather[0].description | titlecase }}</div>
               </div>
               <img [src]="'http://openweathermap.org/img/wn/' + weather.weather[0].icon + '.png'" alt="weather icon">
             </div>

             <div *ngFor="let day of draft()?.days; let dIndex = index" class="mb-6">
                <div class="font-semibold text-gray-800 mb-2 border-b pb-1">Dia {{ dIndex + 1 }} - {{ day.date }}</div>
                
                <div *ngFor="let item of day.items" class="bg-white border border-gray-200 p-3 rounded-lg mb-2 shadow-sm flex items-center gap-3">
                   <span class="material-icons text-blue-500 text-sm bg-blue-50 p-2 rounded-full">
                      {{ item.category === 'hotel' ? 'hotel' : item.category === 'restaurant' ? 'restaurant' : 'place' }}
                   </span>
                   <div>
                      <div class="font-medium text-sm">{{ item.title }}</div>
                      <div class="text-xs text-gray-500 capitalize">{{ item.category }}</div>
                   </div>
                </div>
             </div>

             <!-- Action Area -->
             <div class="mt-6 pt-6 border-t border-gray-200 sticky bottom-0 bg-white pb-6">
                <button (click)="showAuthModal = true" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
                   <span class="material-icons text-sm">cloud_upload</span> Salvar Itinerário
                </button>
             </div>
          </div>
        }
      </div>

      <!-- Map Area -->
      <div class="w-full md:w-2/3 h-96 md:h-full relative bg-gray-100">
         <app-map [markers]="allMarkers"></app-map>
      </div>

      <!-- Auth Modal Integration -->
      <app-auth-modal *ngIf="showAuthModal" (close)="showAuthModal = false" (success)="onAuthSuccess()"></app-auth-modal>
    </div>
  `,
  styles: []
})
export class ExploreBuilderComponent implements OnInit {
  @Input() destination: any = null;
  @Output() close = new EventEmitter<void>();

  private http = inject(HttpClient);
  public guestItinerary = inject(GuestItineraryService);

  weather: any = null;
  draft = this.guestItinerary.draft;
  showAuthModal = false;
  newItemTitle: { [key: number]: string } = {};

  // Extended mock coordinates for demo
  private mockCoords: { [key: string]: { lat: number, lng: number } } = {
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Bali': { lat: -8.4095, lng: 115.1889 },
    'Nova Iorque': { lat: 40.7128, lng: -74.0060 },
    'Tóquio': { lat: 35.6762, lng: 139.6503 },
    'Santorini': { lat: 36.3932, lng: 25.4615 },
    'Maldivas': { lat: 3.2028, lng: 73.2207 },
    'Roma': { lat: 41.9028, lng: 12.4964 },
    'Cidade do Cabo': { lat: -33.9249, lng: 18.4241 }
  };

  isGenerated = false;
  wizardData = {
    startDate: '',
    endDate: '',
    tripType: 'economica',
    interests: ''
  };

  ngOnInit() {
    if (this.destination) {
      this.guestItinerary.initializeDraft(this.destination.name, new Date().toISOString());
      this.fetchWeather();
    }
  }

  fetchWeather() {
    if (!this.destination) return;
    this.http.get<any>(`http://localhost/sistema-planejamento-viagens/backend/api/weather/current.php?city=${this.destination.name}`)
      .subscribe({
        next: (res) => {
          this.weather = res.data;
        },
        error: (err) => console.error('Weather error', err)
      });
  }

  generateItinerary() {
    if (!this.wizardData.startDate || !this.wizardData.endDate) {
      alert("Preencha as datas para gerar o roteiro.");
      return;
    }

    // Mock AI Generation
    const start = new Date(this.wizardData.startDate);
    const end = new Date(this.wizardData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Reset draft
    this.guestItinerary.clearDraft();
    this.guestItinerary.initializeDraft(this.destination.name, this.wizardData.startDate);

    for (let i = 0; i < diffDays; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(nextDate.getDate() + i);
      this.guestItinerary.addDay(nextDate.toISOString().split('T')[0]);
      
      const baseCoords = this.mockCoords[this.destination?.name] || { lat: 0, lng: 0 };
      
      // Add morning activity
      this.guestItinerary.addItemToDay(i, {
        id: Math.random().toString(),
        title: `Exploração Matinal (${this.wizardData.interests || 'Turismo'})`,
        category: 'attraction',
        lat: baseCoords.lat + ((Math.random() - 0.5) * 0.05),
        lng: baseCoords.lng + ((Math.random() - 0.5) * 0.05)
      });

      // Add lunch
      this.guestItinerary.addItemToDay(i, {
        id: Math.random().toString(),
        title: `Almoço Local`,
        category: 'restaurant',
        lat: baseCoords.lat + ((Math.random() - 0.5) * 0.05),
        lng: baseCoords.lng + ((Math.random() - 0.5) * 0.05)
      });
    }

    this.isGenerated = true;
  }

  get allMarkers(): TripItem[] {
    const items: TripItem[] = [];
    this.draft()?.days.forEach(day => {
      items.push(...day.items);
    });
    return items;
  }

  onAuthSuccess() {
    this.showAuthModal = false;
    alert('Autenticação e sincronização concluídas! Você será redirecionado para o dashboard.');
    window.location.href = '/dashboard'; // Force full refresh to clear guest states
  }
}
