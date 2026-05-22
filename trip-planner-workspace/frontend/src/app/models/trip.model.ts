export interface Activity {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'event' | 'accommodation';
  lat: number;
  lng: number;
  costEstimate?: number; // In local currency or general level
  date?: string; // Assigned date
}

export interface TripDraft {
  id: string; // Ephemeral UUID for local storage
  destination: string;
  lat?: number;
  lng?: number;
  startDate?: string;
  endDate?: string;
  activities: Activity[];
  budgetLevel?: 'economy' | 'standard' | 'luxury';
}
