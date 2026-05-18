import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Destination {
  id: string;
  name: string;
  country: string;
  flag: string;
  costPerDay: number;
  bestSeason: string;
  continent: 'Europa' | 'Ásia' | 'Américas' | 'África' | 'Oceânia';
  description: string;
}

@Component({
  selector: 'app-featured-destinations',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="destinations-container">
      <div class="destinations-header">
        <h3>Destinos em Destaque</h3>
        <p>Explore os locais mais populares para as suas viagens</p>
      </div>

      <div class="filter-buttons">
        <button
          *ngFor="let continent of continents"
          [class.active]="selectedContinent === continent"
          (click)="selectedContinent = continent"
          class="filter-btn"
        >
          {{ continent }}
        </button>
      </div>

      <div class="destinations-grid">
        <div
          *ngFor="let dest of filteredDestinations"
          class="destination-card"
        >
          <div class="card-header">
            <span class="flag">{{ dest.flag }}</span>
            <h4>{{ dest.name }}</h4>
          </div>

          <p class="country">{{ dest.country }}</p>
          <p class="description">{{ dest.description }}</p>

          <div class="card-footer">
            <div class="cost">
              <span class="label">Por dia</span>
              <span class="value">€{{ dest.costPerDay }}</span>
            </div>
            <div class="season">
              <span class="label">Melhor época</span>
              <span class="value">{{ dest.bestSeason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .destinations-container {
      padding: 3rem 2rem;
      background: linear-gradient(to bottom, #f8f9fa, #fff);
    }

    .destinations-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .destinations-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .destinations-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .filter-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      color: #4b5563;
    }

    .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .filter-btn.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    .destinations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .destination-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .destination-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .flag {
      font-size: 2.5rem;
      line-height: 1;
    }

    .card-header h4 {
      margin: 0;
      font-size: 1.3rem;
      color: #1f2937;
      flex: 1;
    }

    .country {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .description {
      margin: 0 0 1.5rem 0;
      color: #4b5563;
      font-size: 0.95rem;
      line-height: 1.5;
      flex: 1;
    }

    .card-footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .cost,
    .season {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .cost .label,
    .season .label {
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 500;
    }

    .cost .value,
    .season .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }

    @media (max-width: 768px) {
      .destinations-container {
        padding: 2rem 1rem;
      }

      .destinations-header h3 {
        font-size: 1.5rem;
      }

      .filter-buttons {
        gap: 0.5rem;
      }

      .filter-btn {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
      }

      .destinations-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `],
})
export class FeaturedDestinationsComponent {
  selectedContinent: string = 'Europa';

  readonly continents = ['Europa', 'Ásia', 'Américas', 'África', 'Oceânia'];

  readonly destinations: Destination[] = [
    {
      id: '1',
      name: 'Lisboa',
      country: 'Portugal 🇵🇹',
      flag: '🏰',
      costPerDay: 45,
      bestSeason: 'Abril-Maio',
      continent: 'Europa',
      description: 'Capital histórica com azulejos únicos e pastéis de nata',
    },
    {
      id: '2',
      name: 'Barcelona',
      country: 'Espanha 🇪🇸',
      flag: '🏛️',
      costPerDay: 55,
      bestSeason: 'Setembro-Outubro',
      continent: 'Europa',
      description: 'Gaudí, praias e vida cultural vibrante',
    },
    {
      id: '3',
      name: 'Tóquio',
      country: 'Japão 🇯🇵',
      flag: '🗼',
      costPerDay: 65,
      bestSeason: 'Março-Abril',
      continent: 'Ásia',
      description: 'Tecnologia futurista com tradição milenar',
    },
    {
      id: '4',
      name: 'Bangkok',
      country: 'Tailândia 🇹🇭',
      flag: '🛕',
      costPerDay: 35,
      bestSeason: 'Novembro-Fevereiro',
      continent: 'Ásia',
      description: 'Templos dourados e mercados flutuantes',
    },
    {
      id: '5',
      name: 'Nova Iorque',
      country: 'EUA 🇺🇸',
      flag: '🗽',
      costPerDay: 80,
      bestSeason: 'Maio-Junho',
      continent: 'Américas',
      description: 'A cidade que nunca dorme com skyline icónico',
    },
    {
      id: '6',
      name: 'Buenos Aires',
      country: 'Argentina 🇦🇷',
      flag: '💃',
      costPerDay: 40,
      bestSeason: 'Outubro-Novembro',
      continent: 'Américas',
      description: 'Tango, carne e arquitetura europeia em América',
    },
  ];

  get filteredDestinations(): Destination[] {
    return this.destinations.filter((d) => d.continent === this.selectedContinent);
  }
}
