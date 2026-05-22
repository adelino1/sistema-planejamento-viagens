import { Injectable, signal, computed, effect } from '@angular/core';
import { TripDraft, Activity } from '../models/trip.model';

const STORAGE_KEY = 'tripnomad_guest_draft';

@Injectable({
  providedIn: 'root'
})
export class TripStateService {
  // O estado principal mantido via signal
  public tripDraft = signal<TripDraft | null>(this.loadFromStorage());

  // Valores derivados
  public hasDraft = computed(() => this.tripDraft() !== null);
  public activityCount = computed(() => this.tripDraft()?.activities.length || 0);

  constructor() {
    // Sempre que o draft mudar, sincroniza com o localStorage de forma transparente (Guest Mode)
    effect(() => {
      const draft = this.tripDraft();
      if (draft) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  private loadFromStorage(): TripDraft | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse trip draft from storage', e);
        return null;
      }
    }
    return null;
  }

  public initNewDraft(destination: string, lat?: number, lng?: number) {
    const newDraft: TripDraft = {
      id: crypto.randomUUID(),
      destination,
      lat,
      lng,
      activities: []
    };
    this.tripDraft.set(newDraft);
  }

  public addActivity(activity: Activity) {
    this.tripDraft.update(draft => {
      if (!draft) return draft;
      return {
        ...draft,
        activities: [...draft.activities, activity]
      };
    });
  }

  public removeActivity(activityId: string) {
    this.tripDraft.update(draft => {
      if (!draft) return draft;
      return {
        ...draft,
        activities: draft.activities.filter(a => a.id !== activityId)
      };
    });
  }

  public clearDraft() {
    this.tripDraft.set(null);
  }
}
