import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../core/services/trip.service';
import { WeatherService, WeatherData } from '../../../core/services/weather.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ShareService } from '../../../core/services/share.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Trip, Expense, EXPENSE_CATEGORIES, STATUS_LABELS } from '../../../core/models/trip.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss'
})
export class TripDetailComponent implements OnInit {
  Math = Math;
  route        = inject(ActivatedRoute);
  router       = inject(Router);
  tripService  = inject(TripService);
  weatherService = inject(WeatherService);
  shareService = inject(ShareService);
  ns           = inject(NotificationService);

  trip = signal<Trip | null>(null);
  expenses = signal<Expense[]>([]);
  weather = signal<WeatherData | null>(null);
  weatherLoading = signal(true);
  loading = signal(true);

  showExpenseModal = signal(false);
  savingExpense = signal(false);
  showConfirm = signal(false);
  deleting = signal(false);
  exportingPdf = signal(false);
  sharing      = signal(false);

  expenseForm = signal({
    description: '', amount: 0, currency: 'USD',
    category: 'transport' as Expense['category'],
    date: new Date().toISOString().slice(0, 10),
    paidBy: '', participants: ''
  });

  categories = EXPENSE_CATEGORIES;
  statusLabels = STATUS_LABELS;

  totalExpenses = computed(() => this.expenses().reduce((s, e) => s + e.amount, 0));

  expensesByCat = computed(() => {
    const cats: Record<string, number> = {};
    for (const e of this.expenses()) {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    }
    return cats;
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const trip = this.tripService.getById(id);
    if (!trip) { this.router.navigate(['/trips']); return; }
    this.trip.set(trip);
    this.expenses.set(this.tripService.getExpenses(id));
    this.loading.set(false);
    this.weatherService.getWeather(trip.lat, trip.lon, trip.destination).then(w => {
      this.weather.set(w);
      this.weatherLoading.set(false);
    });
  }

  getDays(): number {
    const t = this.trip();
    return t ? this.tripService.getDays(t) : 0;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  toggleFav() {
    const t = this.trip();
    if (!t) return;
    this.tripService.toggleFavorite(t.id);
    this.trip.update(tr => tr ? { ...tr, isFavorite: !tr.isFavorite } : null);
  }

  openExpenseModal() {
    this.expenseForm.set({
      description: '', amount: 0, currency: this.trip()?.currency || 'USD',
      category: 'transport', date: new Date().toISOString().slice(0, 10),
      paidBy: '', participants: ''
    });
    this.showExpenseModal.set(true);
  }

  updateExpForm(field: string, value: any) {
    this.expenseForm.update(f => ({ ...f, [field]: value }));
  }

  async saveExpense() {
    const f = this.expenseForm();
    if (!f.description || !f.amount) {
      this.ns.error('Campos obrigatórios', 'Preencha a descrição e o valor.');
      return;
    }
    this.savingExpense.set(true);
    try {
      const e = await this.tripService.addExpense({
        tripId: this.trip()!.id,
        description: f.description,
        amount: Number(f.amount),
        currency: f.currency,
        category: f.category,
        date: f.date,
        paidBy: f.paidBy || 'Eu',
        participants: f.participants.split(',').map(p => p.trim()).filter(Boolean)
      });
      this.expenses.update(ex => [...ex, e]);
      this.showExpenseModal.set(false);
      this.ns.success('Despesa adicionada!');
    } catch (err: any) {
      this.ns.error('Erro', err.message);
    } finally {
      this.savingExpense.set(false);
    }
  }

  async deleteExpense(id: number) {
    await this.tripService.deleteExpense(id);
    this.expenses.update(ex => ex.filter(e => e.id !== id));
    this.ns.success('Despesa eliminada.');
  }

  confirmDeleteTrip() { this.showConfirm.set(true); }

  async doDeleteTrip() {
    this.deleting.set(true);
    try {
      await this.tripService.delete(this.trip()!.id);
      this.ns.success('Viagem eliminada.');
      this.router.navigate(['/trips']);
    } finally {
      this.deleting.set(false);
    }
  }

  getCategoryIcon(cat: string): string {
    return this.categories.find(c => c.value === cat)?.icon ?? 'receipt';
  }

  getCategoryLabel(cat: string): string {
    return this.categories.find(c => c.value === cat)?.label ?? cat;
  }

  openMaps() {
    const t = this.trip();
    if (!t) return;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(t.destination + ', ' + t.country)}`, '_blank');
  }

  async shareTrip() {
    const t = this.trip();
    if (!t || this.sharing()) return;
    this.sharing.set(true);
    try {
      const url = this.shareService.buildUrl(t, this.expenses());
      await this.shareService.copyToClipboard(url);
      this.ns.success('Link copiado!', 'Partilhe o link para que outros possam ver esta viagem.');
    } catch {
      this.ns.error('Erro', 'Não foi possível copiar o link.');
    } finally {
      this.sharing.set(false);
    }
  }

  async exportPDF() {
    const t = this.trip();
    if (!t || this.exportingPdf()) return;
    this.exportingPdf.set(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const PRIMARY = [37, 99, 235] as [number, number, number];
      const DARK    = [15, 23, 42]  as [number, number, number];
      const GRAY    = [100, 116, 139] as [number, number, number];
      const LIGHT   = [248, 250, 252] as [number, number, number];
      const W = 210;
      const PAD = 16;

      const fmt = (d: string) =>
        new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
      const money = (n: number) =>
        new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
      const statusMap: Record<string, string> = {
        planned: 'Planeada', ongoing: 'Em Curso', completed: 'Concluída', cancelled: 'Cancelada'
      };
      const catLabel: Record<string, string> = {
        transport: 'Transporte', accommodation: 'Alojamento', food: 'Alimentação',
        activities: 'Actividades', shopping: 'Compras', other: 'Outros'
      };

      // ── HEADER BAND ──────────────────────────────────────────────
      doc.setFillColor(...PRIMARY);
      doc.rect(0, 0, W, 38, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(`${t.flag ?? '✈'} ${t.destination}`, PAD, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(200, 214, 254);
      doc.text(`${t.country}  ·  ${statusMap[t.status] ?? t.status}`, PAD, 26);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-PT')} — TravelPlan`, PAD, 33);

      let y = 48;

      // ── SUMMARY BOXES ─────────────────────────────────────────────
      const boxes = [
        { label: 'Partida',       val: fmt(t.startDate) },
        { label: 'Regresso',      val: fmt(t.endDate) },
        { label: 'Duração',       val: `${this.getDays()} dias` },
        { label: 'Participantes', val: String(t.participants) },
        { label: 'Orçamento',     val: `${t.currency} ${money(t.budget)}` },
        { label: 'Total Despesas',val: `${t.currency} ${money(this.totalExpenses())}` },
      ];

      const boxW = (W - PAD * 2 - 10) / 3;
      const boxH = 22;
      const cols = 3;

      boxes.forEach((b, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = PAD + col * (boxW + 5);
        const by = y + row * (boxH + 4);

        doc.setFillColor(...LIGHT);
        doc.roundedRect(bx, by, boxW, boxH, 3, 3, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.text(b.label.toUpperCase(), bx + 5, by + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(b.val, bx + 5, by + 15);
      });

      y += Math.ceil(boxes.length / cols) * (boxH + 4) + 10;

      // ── BUDGET PROGRESS ───────────────────────────────────────────
      const pct = t.budget > 0 ? Math.min(this.totalExpenses() / t.budget, 1) : 0;
      const remaining = t.budget - this.totalExpenses();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text('Orçamento vs Despesas', PAD, y);
      y += 5;

      const barW = W - PAD * 2;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(PAD, y, barW, 5, 2, 2, 'F');
      const fillColor: [number, number, number] = pct > 0.9 ? [239, 68, 68] : pct > 0.7 ? [245, 158, 11] : [34, 197, 94];
      doc.setFillColor(...fillColor);
      doc.roundedRect(PAD, y, barW * pct, 5, 2, 2, 'F');
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(`Usado: ${t.currency} ${money(this.totalExpenses())} de ${money(t.budget)}`, PAD, y);
      doc.text(`Restam: ${t.currency} ${money(remaining)}`, W - PAD, y, { align: 'right' });
      y += 10;

      // ── DESCRIPTION ───────────────────────────────────────────────
      if (t.description) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text('Descrição', PAD, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        const lines = doc.splitTextToSize(t.description, W - PAD * 2);
        doc.text(lines, PAD, y);
        y += lines.length * 4.5 + 8;
      }

      // ── ACTIVITIES ────────────────────────────────────────────────
      if (t.activities.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text('Actividades Planeadas', PAD, y);
        y += 5;

        const half = Math.ceil(t.activities.length / 2);
        const leftActs  = t.activities.slice(0, half);
        const rightActs = t.activities.slice(half);
        const colW = (W - PAD * 2 - 8) / 2;
        let leftY = y, rightY = y;

        leftActs.forEach(a => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...GRAY);
          doc.text(`• ${a}`, PAD + 2, leftY);
          leftY += 5;
        });
        rightActs.forEach(a => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...GRAY);
          doc.text(`• ${a}`, PAD + colW + 10, rightY);
          rightY += 5;
        });

        y = Math.max(leftY, rightY) + 8;
      }

      // ── EXPENSES TABLE ────────────────────────────────────────────
      if (y > 220) { doc.addPage(); y = 20; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(`Despesas (${this.expenses().length})`, PAD, y);
      y += 3;

      const exps = this.expenses();
      if (exps.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text('Nenhuma despesa registada.', PAD, y + 6);
        y += 14;
      } else {
        autoTable(doc, {
          startY: y,
          head: [['Categoria', 'Descrição', 'Pago por', 'Data', `Valor (${t.currency})`]],
          body: exps.map(e => [
            catLabel[e.category] ?? e.category,
            e.description,
            e.paidBy || '—',
            new Date(e.date).toLocaleDateString('pt-PT'),
            money(e.amount)
          ]),
          foot: [['', '', '', 'TOTAL', `${t.currency} ${money(this.totalExpenses())}`]],
          theme: 'striped',
          headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          footStyles: { fillColor: LIGHT, textColor: DARK, fontSize: 8.5, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8, textColor: DARK },
          columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
          margin: { left: PAD, right: PAD },
          styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.3 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ── EXPENSES BY CATEGORY ──────────────────────────────────────
      if (exps.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        const catData = this.categories
          .filter(c => this.expensesByCat()[c.value])
          .map(c => [c.label, `${t.currency} ${money(this.expensesByCat()[c.value])}`,
            `${((this.expensesByCat()[c.value] / this.totalExpenses()) * 100).toFixed(1)}%`]);

        if (catData.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...DARK);
          doc.text('Despesas por Categoria', PAD, y);
          y += 3;

          autoTable(doc, {
            startY: y,
            head: [['Categoria', 'Total', 'Percentagem']],
            body: catData,
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8, textColor: DARK },
            columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
            margin: { left: PAD, right: PAD },
            styles: { cellPadding: 2.5, lineColor: [226, 232, 240], lineWidth: 0.3 },
          });
          y = (doc as any).lastAutoTable.finalY + 8;
        }
      }

      // ── FOOTER ────────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 287, W, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        doc.text('TravelPlan · Sistema de Planejamento de Viagens', PAD, 293);
        doc.text(`Página ${p} de ${pageCount}`, W - PAD, 293, { align: 'right' });
      }

      const filename = `viagem-${t.destination.toLowerCase().replace(/\s+/g, '-')}-${t.startDate}.pdf`;
      doc.save(filename);
      this.ns.success('PDF exportado!', `Ficheiro ${filename} guardado.`);
    } catch (err) {
      console.error(err);
      this.ns.error('Erro ao exportar', 'Não foi possível gerar o PDF.');
    } finally {
      this.exportingPdf.set(false);
    }
  }
}
