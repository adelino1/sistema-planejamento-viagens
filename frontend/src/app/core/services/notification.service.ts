import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  toasts = signal<Toast[]>([]);

  private show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(t => [...t, { ...toast, id }]);
    setTimeout(() => this.remove(id), toast.duration ?? 4000);
  }

  success(title: string, message?: string) {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string) {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(title: string, message?: string) {
    this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string) {
    this.show({ type: 'info', title, message });
  }

  remove(id: string) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
