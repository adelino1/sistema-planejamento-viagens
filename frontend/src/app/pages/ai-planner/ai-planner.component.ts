import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-ai-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './ai-planner.component.html',
  styleUrl: './ai-planner.component.scss'
})
export class AiPlannerComponent {
  prompt = '';
  loading = false;
  response: any = null;

  constructor(private aiService: AiService) {}

  generate() {
    if (!this.prompt) return;
    
    this.loading = true;
    this.response = null;

    this.aiService.generateItinerary(this.prompt).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.response = res.data.itinerary;
        }
        this.loading = false;
      },
      error: () => {
        // Fallback demo caso MySQL/PHP offline
        setTimeout(() => {
          this.response = {
            title: 'Expedição Kalandula (Demo IA)',
            description: 'Roteiro de 2 dias otimizado para a sua viagem a Malanje.',
            days: [
              {
                day: 1,
                activities: [
                  { time: '08:00', desc: 'Viagem de carro Luanda - Malanje', cost_aoa: 15000 },
                  { time: '14:00', desc: 'Piquenique nas Quedas de Kalandula', cost_aoa: 5000 },
                  { time: '18:00', desc: 'Check-in na Pousada', cost_aoa: 25000 }
                ]
              }
            ]
          };
          this.loading = false;
        }, 1500);
      }
    });
  }
}
