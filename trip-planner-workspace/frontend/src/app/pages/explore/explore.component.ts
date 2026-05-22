import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripStateService } from '../../services/trip-state.service';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: L.Map | undefined;
  public searchQuery = '';
  public destinations = [
    { name: 'Lisboa, Portugal', lat: 38.7169, lng: -9.1399 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 }
  ];

  constructor(public tripState: TripStateService, public auth: AuthService) {}

  ngOnInit() {
    // Check if we need to restore map state based on draft
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    // Default to a generic view or the draft's destination if it exists
    let initialLat = 20.0;
    let initialLng = 0.0;
    let zoom = 2;

    const draft = this.tripState.tripDraft();
    if (draft && draft.lat && draft.lng) {
      initialLat = draft.lat;
      initialLng = draft.lng;
      zoom = 12;
    }

    this.map = L.map('map').setView([initialLat, initialLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker for draft destination
    if (draft && draft.lat && draft.lng) {
      L.marker([draft.lat, draft.lng]).addTo(this.map)
        .bindPopup(`<b>${draft.destination}</b><br>Roteiro Atual.`).openPopup();
    }
  }

  public selectDestination(dest: any) {
    this.tripState.initNewDraft(dest.name, dest.lat, dest.lng);
    if (this.map) {
      this.map.setView([dest.lat, dest.lng], 12);
      L.marker([dest.lat, dest.lng]).addTo(this.map)
        .bindPopup(`<b>${dest.name}</b><br>Iniciando roteiro.`).openPopup();
    }
  }

  public clearDraft() {
    this.tripState.clearDraft();
    if (this.map) {
      this.map.setView([20.0, 0.0], 2);
      // Clean markers (simplified for now)
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
    }
  }
}
