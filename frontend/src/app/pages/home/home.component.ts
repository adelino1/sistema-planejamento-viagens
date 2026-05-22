import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

const DESTINATIONS = [
  { name: 'Paris', country: 'França', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop', price: 'desde €1.200' },
  { name: 'Bali', country: 'Indonésia', img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&auto=format&fit=crop', price: 'desde $1.800' },
  { name: 'Nova Iorque', country: 'EUA', img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&auto=format&fit=crop', price: 'desde $2.000' },
  { name: 'Tóquio', country: 'Japão', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop', price: 'desde $3.500' },
  { name: 'Santorini', country: 'Grécia', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop', price: 'desde €1.500' },
  { name: 'Maldivas', country: 'Maldivas', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&auto=format&fit=crop', price: 'desde $4.000' }
];

const FEATURES = [
  { icon: 'route', title: 'Planeie com Facilidade', desc: 'Crie roteiros completos com datas, destinos e actividades em minutos.' },
  { icon: 'cloud', title: 'Clima em Tempo Real', desc: 'Consulte o clima actual de qualquer destino através da API Open-Meteo.' },
  { icon: 'receipt_long', title: 'Controlo de Despesas', desc: 'Acompanhe todas as despesas da viagem e mantenha-se dentro do orçamento.' },
  { icon: 'group', title: 'Viagens em Grupo', desc: 'Organize viagens com múltiplos participantes e divida as despesas.' },
  { icon: 'dark_mode', title: 'Modo Escuro / Claro', desc: 'Interface elegante com suporte total a modo escuro para maior conforto.' },
  { icon: 'devices', title: 'Totalmente Responsivo', desc: 'Acesse o sistema em qualquer dispositivo — móvel, tablet ou desktop.' }
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  auth = inject(AuthService);
  themeService = inject(ThemeService);

  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isDark = computed(() => this.themeService.isDark());

  destinations = DESTINATIONS;
  features = FEATURES;

  toggleTheme() { this.themeService.toggle(); }
}
