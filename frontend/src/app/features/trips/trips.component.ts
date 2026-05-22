import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TripService } from '../../core/services/trip.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Trip, TripFormData, STATUS_LABELS, TripStatus } from '../../core/models/trip.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop'
];

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoaderComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.scss'
})
export class TripsComponent implements OnInit {
  tripService = inject(TripService);
  auth = inject(AuthService);
  ns = inject(NotificationService);
  router = inject(Router);

  loading = signal(true);
  allTrips = signal<Trip[]>([]);
  search = signal('');
  statusFilter = signal('');
  sort = signal('created_desc');
  viewMode = signal<'grid' | 'list'>('grid');
  page = signal(1);
  pageSize = 9;

  showModal = signal(false);
  editTrip = signal<Trip | null>(null);
  saving = signal(false);
  showConfirm = signal(false);
  deletingId = signal<number | null>(null);
  deleting = signal(false);

  form = signal<Partial<TripFormData>>({
    destination: '', country: '', countryCode: '',
    startDate: '', endDate: '', description: '',
    budget: 0, currency: 'USD', status: 'planned',
    coverImage: COVER_IMAGES[0], participants: 1,
    activities: [], lat: 0, lon: 0
  });

  activitiesInput = signal('');
  coverImages = COVER_IMAGES;
  statusLabels = STATUS_LABELS;
  statusOptions: TripStatus[] = ['planned', 'ongoing', 'completed', 'cancelled'];
  currencies = ['USD', 'EUR', 'GBP', 'AOA', 'BRL'];

  filtered = computed(() => {
    const trips = this.allTrips();
    return this.tripService.filterAndSearch(trips, this.search(), this.statusFilter(), this.sort());
  });

  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize));

  ngOnInit() {
    const userId = this.auth.currentUser()?.id ?? 0;
    const isAdmin = this.auth.isAdmin();
    const trips = isAdmin ? this.tripService.getAll() : this.tripService.getByUser(userId);
    this.allTrips.set(trips);
    this.loading.set(false);
  }

  openCreate() {
    this.editTrip.set(null);
    this.form.set({
      destination: '', country: '', countryCode: '',
      startDate: '', endDate: '', description: '',
      budget: 1000, currency: 'USD', status: 'planned',
      coverImage: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)],
      participants: 1, activities: [], lat: 48.8566, lon: 2.3522
    });
    this.activitiesInput.set('');
    this.showModal.set(true);
  }

  openEdit(trip: Trip, e: Event) {
    e.stopPropagation();
    this.editTrip.set(trip);
    this.form.set({ ...trip });
    this.activitiesInput.set(trip.activities.join(', '));
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  updateForm(field: string, value: any) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  async save() {
    const f = this.form();
    if (!f.destination || !f.startDate || !f.endDate || !f.budget) {
      this.ns.error('Campos obrigatórios', 'Preencha destino, datas e orçamento.');
      return;
    }
    if (f.startDate! >= f.endDate!) {
      this.ns.error('Datas inválidas', 'A data de fim deve ser após o início.');
      return;
    }
    this.saving.set(true);
    const activities = this.activitiesInput().split(',').map(a => a.trim()).filter(Boolean);
    const data: TripFormData = {
      destination: f.destination!, country: f.country || f.destination!,
      countryCode: f.countryCode || 'XX', startDate: f.startDate!, endDate: f.endDate!,
      description: f.description || '', budget: Number(f.budget), currency: f.currency || 'USD',
      status: f.status as TripStatus, coverImage: f.coverImage || COVER_IMAGES[0],
      participants: Number(f.participants) || 1, activities,
      lat: Number(f.lat) || 48.8566, lon: Number(f.lon) || 2.3522
    };
    try {
      const editing = this.editTrip();
      if (editing) {
        const updated = await this.tripService.update(editing.id, data);
        this.allTrips.update(trips => trips.map(t => t.id === updated.id ? updated : t));
        this.ns.success('Viagem actualizada!');
      } else {
        const userId = this.auth.currentUser()!.id;
        const created = await this.tripService.create(data, userId);
        this.allTrips.update(trips => [...trips, created]);
        this.ns.success('Viagem criada!', 'A sua nova viagem foi adicionada.');
      }
      this.closeModal();
    } catch (e: any) {
      this.ns.error('Erro', e.message);
    } finally {
      this.saving.set(false);
    }
  }

  confirmDelete(id: number, e: Event) {
    e.stopPropagation();
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  async doDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.deleting.set(true);
    try {
      await this.tripService.delete(id);
      this.allTrips.update(trips => trips.filter(t => t.id !== id));
      this.ns.success('Viagem eliminada.');
      this.showConfirm.set(false);
    } catch {
      this.ns.error('Erro ao eliminar viagem.');
    } finally {
      this.deleting.set(false);
    }
  }

  toggleFav(trip: Trip, e: Event) {
    e.stopPropagation();
    this.tripService.toggleFavorite(trip.id);
    this.allTrips.update(trips => trips.map(t => t.id === trip.id ? { ...t, isFavorite: !t.isFavorite } : t));
  }

  goToDetail(id: number) { this.router.navigate(['/trips', id]); }

  getDays(trip: Trip): number { return this.tripService.getDays(trip); }

  onSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
    this.page.set(1);
  }

  setPage(p: number) { this.page.set(p); }

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });
}
