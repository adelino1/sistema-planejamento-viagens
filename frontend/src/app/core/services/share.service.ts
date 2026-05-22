import { Injectable } from '@angular/core';
import { Trip, Expense } from '../models/trip.model';

export interface SharePayload {
  trip: Trip;
  expenses: Expense[];
  sharedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ShareService {

  encode(trip: Trip, expenses: Expense[]): string {
    const payload: SharePayload = { trip, expenses, sharedAt: new Date().toISOString() };
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch {
      return btoa(JSON.stringify(payload));
    }
  }

  decode(token: string): SharePayload | null {
    try {
      const raw = decodeURIComponent(escape(atob(token)));
      return JSON.parse(raw) as SharePayload;
    } catch {
      try {
        return JSON.parse(atob(token)) as SharePayload;
      } catch {
        return null;
      }
    }
  }

  buildUrl(trip: Trip, expenses: Expense[]): string {
    const token = this.encode(trip, expenses);
    const base = window.location.origin;
    return `${base}/share/${token}`;
  }

  async copyToClipboard(url: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }
}
