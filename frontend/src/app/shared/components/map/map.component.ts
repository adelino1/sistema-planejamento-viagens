import { Component, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TripItem } from '../../../core/services/guest-itinerary.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div #mapContainer class="absolute inset-0"></div>
    </div>
  `,
  styles: []
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() set markers(items: TripItem[]) {
    this.updateMarkers(items);
  }

  private map!: L.Map;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private isInitialized = false;

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    // Default center (can be dynamically updated later)
    this.map = L.map(this.mapContainer.nativeElement).setView([51.505, -0.09], 13);

    // Free OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.isInitialized = true;

    // Fix for missing marker icons in leaflet
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private updateMarkers(items: TripItem[]) {
    if (!this.isInitialized) return;

    this.markersLayer.clearLayers();
    
    if (!items || items.length === 0) return;

    const bounds = L.latLngBounds([]);

    items.forEach(item => {
      if (item.lat && item.lng) {
        const marker = L.marker([item.lat, item.lng]);
        marker.bindPopup(`<b>${item.title}</b><br>${item.category}`);
        this.markersLayer.addLayer(marker);
        bounds.extend([item.lat, item.lng]);
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
