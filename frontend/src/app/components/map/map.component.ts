import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  @Input() center: google.maps.LatLngLiteral = { lat: -8.839988, lng: 13.289437 }; // Default: Luanda, Angola
  @Input() zoom = 11;
  @Input() markers: { position: google.maps.LatLngLiteral, title: string }[] = [];

  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    disableDefaultUI: false,
    clickableIcons: true,
    keyboardShortcuts: false,
  };

  ngOnInit(): void {}
}
