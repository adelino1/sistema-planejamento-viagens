export type TripStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  destination: string;
  country: string;
  countryCode: string;
  flag?: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: number;
  currency: string;
  status: TripStatus;
  coverImage: string;
  isFavorite: boolean;
  userId: number;
  participants: number;
  activities: string[];
  lat: number;
  lon: number;
  createdAt: string;
  updatedAt: string;
}

export interface TripFormData {
  destination: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: number;
  currency: string;
  status: TripStatus;
  coverImage: string;
  participants: number;
  activities: string[];
  lat: number;
  lon: number;
}

export interface Expense {
  id: number;
  tripId: number;
  description: string;
  amount: number;
  currency: string;
  category: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
  date: string;
  paidBy: string;
  participants: string[];
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  { value: 'transport', label: 'Transporte', icon: 'directions_car' },
  { value: 'accommodation', label: 'Alojamento', icon: 'hotel' },
  { value: 'food', label: 'Alimentação', icon: 'restaurant' },
  { value: 'activities', label: 'Actividades', icon: 'attractions' },
  { value: 'shopping', label: 'Compras', icon: 'shopping_bag' },
  { value: 'other', label: 'Outros', icon: 'more_horiz' }
];

export const STATUS_LABELS: Record<TripStatus, { label: string; badge: string; dot: string }> = {
  planned: { label: 'Planeada', badge: 'badge--info', dot: 'status-dot--planned' },
  ongoing: { label: 'Em Curso', badge: 'badge--success', dot: 'status-dot--ongoing' },
  completed: { label: 'Concluída', badge: 'badge--secondary', dot: 'status-dot--completed' },
  cancelled: { label: 'Cancelada', badge: 'badge--danger', dot: 'status-dot--cancelled' }
};
