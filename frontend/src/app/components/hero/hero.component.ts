import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  destinations = [
    {
      name: 'Ilha do Mussulo, Luanda',
      image: 'https://images.unsplash.com/photo-1574007623916-24879b2fa955?auto=format&fit=crop&q=80&w=800',
      description: 'Areias brancas e águas calmas para relaxar.',
      price: '50.000 AOA'
    },
    {
      name: 'Fenda da Tundavala, Huíla',
      image: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&q=80&w=800',
      description: 'Uma vista deslumbrante a 1000m de altitude.',
      price: 'Grátis'
    },
    {
      name: 'Quedas de Kalandula, Malanje',
      image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800',
      description: 'Uma das maiores quedas d\'água da África.',
      price: '20.000 AOA'
    },
    {
      name: 'Paris, França',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800',
      description: 'A cidade do amor e luz.',
      price: '1.200.000 AOA'
    }
  ];
}
