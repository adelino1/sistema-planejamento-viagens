import { Injectable, signal } from '@angular/core';

export interface TripItem {
  id: string;
  title: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'event' | 'custom';
  lat?: number;
  lng?: number;
}

export interface TripDay {
  date: string;
  items: TripItem[];
}

export interface GuestTripDraft {
  destination: string;
  startDate?: string;
  endDate?: string;
  days: TripDay[];
}

@Injectable({
  providedIn: 'root'
})
export class GuestItineraryService {
  private readonly STORAGE_KEY = 'tripnomad_guest_draft';
  
  // Reactive state using Angular Signals
  public draft = signal<GuestTripDraft | null>(this.loadDraft());

  constructor() {}

  private loadDraft(): GuestTripDraft | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse guest draft', e);
        return null;
      }
    }
    return null;
  }

  private saveDraft(draft: GuestTripDraft) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(draft));
    this.draft.set(draft);
  }

  public initializeDraft(destination: string, startDate?: string, endDate?: string) {
    const newDraft: GuestTripDraft = {
      destination,
      startDate,
      endDate,
      days: []
    };
    this.saveDraft(newDraft);
  }

  public addDay(date: string) {
    const current = this.draft();
    if (current) {
      current.days.push({ date, items: [] });
      this.saveDraft(current);
    }
  }

  public addItemToDay(dayIndex: number, item: TripItem) {
    const current = this.draft();
    if (current && current.days[dayIndex]) {
      current.days[dayIndex].items.push(item);
      this.saveDraft(current);
    }
  }

  public clearDraft() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.draft.set(null);
  }

  public getDraftData(): GuestTripDraft | null {
    return this.draft();
  }
}
