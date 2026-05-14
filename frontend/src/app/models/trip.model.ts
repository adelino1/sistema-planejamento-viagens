export type TripStatus = 'draft' | 'planned' | 'ongoing' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  user_id: number;
  name: string;
  country: string;
  city: string;
  start_date: string;
  end_date: string;
  budget_amount: string;
  budget_currency: string;
  description: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: number;
  trip_id: number;
  day_date: string;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryActivity {
  id: number;
  day_id: number;
  title: string;
  location_name: string | null;
  start_time: string | null;
  end_time: string | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripDetailPayload {
  trip: Trip;
  itinerary_days: Array<{
    day: ItineraryDay;
    activities: ItineraryActivity[];
  }>;
}
