export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: number;
  tripId: number;
  userId: number;
  userName: string;
  userEmail: string;
  tripDestination: string;
  tripCoverImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, { label: string; badge: string }> = {
  pending: { label: 'Pendente', badge: 'badge--warning' },
  confirmed: { label: 'Confirmada', badge: 'badge--success' },
  cancelled: { label: 'Cancelada', badge: 'badge--danger' }
};
