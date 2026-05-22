import { Injectable, signal } from '@angular/core';
import { Trip, TripFormData, TripStatus, Expense } from '../models/trip.model';

const DEMO_TRIPS: Trip[] = [
  {
    id: 1, destination: 'Paris', country: 'França', countryCode: 'FR',
    flag: '🇫🇷', startDate: '2025-06-15', endDate: '2025-06-22',
    description: 'Uma semana romântica em Paris visitando os museus mais famosos, a Torre Eiffel, e explorando a requintada culinária francesa. Uma viagem inesquecível para os amantes de arte e cultura.',
    budget: 2500, currency: 'EUR', status: 'planned',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
    isFavorite: true, userId: 2, participants: 2,
    activities: ['Torre Eiffel', 'Museu do Louvre', 'Cruzeiro no Sena', 'Palácio de Versalhes', 'Montmartre'],
    lat: 48.8566, lon: 2.3522, createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 2, destination: 'Bali', country: 'Indonésia', countryCode: 'ID',
    flag: '🇮🇩', startDate: '2025-07-10', endDate: '2025-07-24',
    description: 'Duas semanas de puro relaxamento nas praias paradisíacas de Bali. Visitas a templos milenares, terraços de arroz deslumbrantes e muito surf.',
    budget: 3200, currency: 'USD', status: 'planned',
    coverImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&auto=format&fit=crop',
    isFavorite: false, userId: 2, participants: 4,
    activities: ['Templo Tanah Lot', 'Terraços de Arroz Tegallalang', 'Praia de Seminyak', 'Ubud', 'Kuta Beach'],
    lat: -8.3405, lon: 115.0920, createdAt: '2025-01-15T09:00:00Z', updatedAt: '2025-01-15T09:00:00Z'
  },
  {
    id: 3, destination: 'Nova Iorque', country: 'EUA', countryCode: 'US',
    flag: '🇺🇸', startDate: '2025-08-05', endDate: '2025-08-12',
    description: 'Uma semana na cidade que nunca dorme. Broadway, Central Park, museus de classe mundial e a icónica skyline de Manhattan.',
    budget: 4500, currency: 'USD', status: 'planned',
    coverImage: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop',
    isFavorite: true, userId: 2, participants: 2,
    activities: ['Central Park', 'Museu Metropolitano', 'Times Square', 'Brooklyn Bridge', 'Estátua da Liberdade'],
    lat: 40.7128, lon: -74.0060, createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z'
  },
  {
    id: 4, destination: 'Tóquio', country: 'Japão', countryCode: 'JP',
    flag: '🇯🇵', startDate: '2025-10-01', endDate: '2025-10-15',
    description: 'Duas semanas de imersão na cultura japonesa. Templos milenares, gastronomia única, tecnologia de vanguarda e a beleza do Monte Fuji ao pôr-do-sol.',
    budget: 5800, currency: 'USD', status: 'planned',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
    isFavorite: false, userId: 2, participants: 2,
    activities: ['Templo Sensoji', 'Monte Fuji', 'Shibuya Crossing', 'Kyoto', 'Akihabara'],
    lat: 35.6762, lon: 139.6503, createdAt: '2025-02-10T10:00:00Z', updatedAt: '2025-02-10T10:00:00Z'
  },
  {
    id: 5, destination: 'Santorini', country: 'Grécia', countryCode: 'GR',
    flag: '🇬🇷', startDate: '2025-04-20', endDate: '2025-04-27',
    description: 'Uma semana nas ilhas gregas com as suas casas brancas e telhados azuis icónicos. Pôres-do-sol mágicos em Oia, praias de águas cristalinas e vinho local.',
    budget: 2800, currency: 'EUR', status: 'completed',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop',
    isFavorite: true, userId: 2, participants: 2,
    activities: ['Oia', 'Praia Vermelha', 'Fira', 'Akrotiri', 'Wine Tasting'],
    lat: 36.3932, lon: 25.4615, createdAt: '2024-12-01T10:00:00Z', updatedAt: '2025-05-01T10:00:00Z'
  },
  {
    id: 6, destination: 'Dubai', country: 'Emirados', countryCode: 'AE',
    flag: '🇦🇪', startDate: '2025-03-10', endDate: '2025-03-17',
    description: 'Uma semana no luxuoso Dubai. Arranha-céus futuristas, desertos de areia dourada, centros comerciais luxuosos e experiências gastronómicas únicas.',
    budget: 6000, currency: 'USD', status: 'completed',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
    isFavorite: false, userId: 2, participants: 3,
    activities: ['Burj Khalifa', 'Dubai Mall', 'Safari no Deserto', 'Palm Jumeirah', 'Dubai Marina'],
    lat: 25.2048, lon: 55.2708, createdAt: '2024-12-15T10:00:00Z', updatedAt: '2025-03-18T10:00:00Z'
  },
  {
    id: 7, destination: 'Roma', country: 'Itália', countryCode: 'IT',
    flag: '🇮🇹', startDate: '2025-05-05', endDate: '2025-05-12',
    description: 'A Cidade Eterna em toda a sua glória. O Coliseu, o Vaticano, a Fontana di Trevi e a melhor pizza e pasta do mundo. História e gastronomia em perfeita harmonia.',
    budget: 2200, currency: 'EUR', status: 'completed',
    coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop',
    isFavorite: true, userId: 2, participants: 2,
    activities: ['Coliseu', 'Vaticano', 'Fontana di Trevi', 'Fórum Romano', 'Piazza Navona'],
    lat: 41.9028, lon: 12.4964, createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-05-13T10:00:00Z'
  },
  {
    id: 8, destination: 'Maldivas', country: 'Maldivas', countryCode: 'MV',
    flag: '🇲🇻', startDate: '2025-12-20', endDate: '2025-12-30',
    description: 'O destino de lua-de-mel perfeito. Bangalós sobre a água turquesa, snorkeling com raias e tubarões-baleia, e pôres-do-sol de tirar o fôlego.',
    budget: 8000, currency: 'USD', status: 'planned',
    coverImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&auto=format&fit=crop',
    isFavorite: true, userId: 2, participants: 2,
    activities: ['Snorkeling', 'Bangalô sobre a água', 'Mergulho', 'Spa', 'Pôr-do-sol romântico'],
    lat: 3.2028, lon: 73.2207, createdAt: '2025-02-28T10:00:00Z', updatedAt: '2025-02-28T10:00:00Z'
  }
];

const DEMO_EXPENSES: Expense[] = [
  { id: 1, tripId: 5, description: 'Voo Paris-Santorini', amount: 480, currency: 'EUR', category: 'transport', date: '2025-04-20', paidBy: 'João Silva', participants: ['João', 'Ana'], createdAt: '2025-04-20T08:00:00Z' },
  { id: 2, tripId: 5, description: 'Hotel em Oia (7 noites)', amount: 1400, currency: 'EUR', category: 'accommodation', date: '2025-04-20', paidBy: 'João Silva', participants: ['João', 'Ana'], createdAt: '2025-04-20T08:00:00Z' },
  { id: 3, tripId: 5, description: 'Jantar romântico', amount: 120, currency: 'EUR', category: 'food', date: '2025-04-22', paidBy: 'Ana Pereira', participants: ['João', 'Ana'], createdAt: '2025-04-22T20:00:00Z' },
  { id: 4, tripId: 5, description: 'Tour em catamarã', amount: 180, currency: 'EUR', category: 'activities', date: '2025-04-23', paidBy: 'João Silva', participants: ['João', 'Ana'], createdAt: '2025-04-23T09:00:00Z' },
  { id: 5, tripId: 6, description: 'Voo directo para Dubai', amount: 1200, currency: 'USD', category: 'transport', date: '2025-03-10', paidBy: 'João Silva', participants: ['João', 'Ana', 'Pedro'], createdAt: '2025-03-10T06:00:00Z' },
  { id: 6, tripId: 6, description: 'Hotel Burj Al Arab (7 noites)', amount: 3500, currency: 'USD', category: 'accommodation', date: '2025-03-10', paidBy: 'João Silva', participants: ['João', 'Ana', 'Pedro'], createdAt: '2025-03-10T08:00:00Z' }
];

@Injectable({ providedIn: 'root' })
export class TripService {
  private trips = signal<Trip[]>([]);
  private expenses = signal<Expense[]>([]);

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const stored = localStorage.getItem('tp_trips');
      const trips = stored ? JSON.parse(stored) : DEMO_TRIPS;
      this.trips.set(trips);
    } catch {
      this.trips.set(DEMO_TRIPS);
    }
    try {
      const stored = localStorage.getItem('tp_expenses');
      const expenses = stored ? JSON.parse(stored) : DEMO_EXPENSES;
      this.expenses.set(expenses);
    } catch {
      this.expenses.set(DEMO_EXPENSES);
    }
  }

  private save() {
    localStorage.setItem('tp_trips', JSON.stringify(this.trips()));
  }

  private saveExpenses() {
    localStorage.setItem('tp_expenses', JSON.stringify(this.expenses()));
  }

  getAll(): Trip[] {
    return this.trips();
  }

  getById(id: number): Trip | undefined {
    return this.trips().find(t => t.id === id);
  }

  getByUser(userId: number): Trip[] {
    return this.trips().filter(t => t.userId === userId);
  }

  getFavorites(userId: number): Trip[] {
    return this.trips().filter(t => t.userId === userId && t.isFavorite);
  }

  getStats(userId: number) {
    const userTrips = this.getByUser(userId);
    const total = userTrips.length;
    const planned = userTrips.filter(t => t.status === 'planned').length;
    const ongoing = userTrips.filter(t => t.status === 'ongoing').length;
    const completed = userTrips.filter(t => t.status === 'completed').length;
    const cancelled = userTrips.filter(t => t.status === 'cancelled').length;
    const totalBudget = userTrips.reduce((s, t) => s + t.budget, 0);
    const favorites = userTrips.filter(t => t.isFavorite).length;
    return { total, planned, ongoing, completed, cancelled, totalBudget, favorites };
  }

  create(data: TripFormData, userId: number): Promise<Trip> {
    return new Promise(resolve => {
      setTimeout(() => {
        const trip: Trip = {
          id: Date.now(), ...data, userId, isFavorite: false,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        this.trips.update(t => [...t, trip]);
        this.save();
        resolve(trip);
      }, 600);
    });
  }

  update(id: number, data: Partial<Trip>): Promise<Trip> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = this.trips().findIndex(t => t.id === id);
        if (idx === -1) { reject(new Error('Viagem não encontrada')); return; }
        const updated = { ...this.trips()[idx], ...data, updatedAt: new Date().toISOString() };
        this.trips.update(t => t.map(x => x.id === id ? updated : x));
        this.save();
        resolve(updated);
      }, 500);
    });
  }

  toggleFavorite(id: number): void {
    const trip = this.trips().find(t => t.id === id);
    if (trip) {
      this.update(id, { isFavorite: !trip.isFavorite });
    }
  }

  delete(id: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.trips.update(t => t.filter(x => x.id !== id));
        this.save();
        resolve();
      }, 500);
    });
  }

  getExpenses(tripId: number): Expense[] {
    return this.expenses().filter(e => e.tripId === tripId);
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    return new Promise(resolve => {
      setTimeout(() => {
        const e: Expense = { ...expense, id: Date.now(), createdAt: new Date().toISOString() };
        this.expenses.update(ex => [...ex, e]);
        this.saveExpenses();
        resolve(e);
      }, 400);
    });
  }

  deleteExpense(id: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.expenses.update(ex => ex.filter(e => e.id !== id));
        this.saveExpenses();
        resolve();
      }, 300);
    });
  }

  getDays(trip: Trip): number {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  }

  filterAndSearch(trips: Trip[], search: string, status: string, sort: string): Trip[] {
    let result = [...trips];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.destination.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    if (status) result = result.filter(t => t.status === status);
    switch (sort) {
      case 'date_asc': result.sort((a, b) => a.startDate.localeCompare(b.startDate)); break;
      case 'date_desc': result.sort((a, b) => b.startDate.localeCompare(a.startDate)); break;
      case 'budget_asc': result.sort((a, b) => a.budget - b.budget); break;
      case 'budget_desc': result.sort((a, b) => b.budget - a.budget); break;
      default: result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return result;
  }
}
