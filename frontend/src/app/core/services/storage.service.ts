import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private GUEST_TRIP_KEY = 'tp_guest_trip_draft';
  private GUEST_TRIP_TTL = 72 * 60 * 60 * 1000; // 72 horas em ms

  saveGuestTrip(tripData: any): void {
    const payload = {
      data: tripData,
      timestamp: Date.now()
    };
    localStorage.setItem(this.GUEST_TRIP_KEY, JSON.stringify(payload));
  }

  getGuestTrip(): any | null {
    const stored = localStorage.getItem(this.GUEST_TRIP_KEY);
    if (!stored) return null;

    try {
      const payload = JSON.parse(stored);
      // Validar TTL (72 horas)
      if (Date.now() - payload.timestamp > this.GUEST_TRIP_TTL) {
        this.clearGuestTrip();
        return null;
      }
      return payload.data;
    } catch {
      this.clearGuestTrip();
      return null;
    }
  }

  clearGuestTrip(): void {
    localStorage.removeItem(this.GUEST_TRIP_KEY);
  }

  hasDraft(): boolean {
    return this.getGuestTrip() !== null;
  }
}
