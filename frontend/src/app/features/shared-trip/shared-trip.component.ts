import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ShareService, SharePayload } from '../../core/services/share.service';
import { EXPENSE_CATEGORIES, STATUS_LABELS } from '../../core/models/trip.model';
import { ThemeService } from '../../core/services/theme.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-shared-trip',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-trip.component.html',
  styleUrl: './shared-trip.component.scss'
})
export class SharedTripComponent implements OnInit {
  Math = Math;
  route        = inject(ActivatedRoute);
  shareService = inject(ShareService);
  themeService = inject(ThemeService);

  payload   = signal<SharePayload | null>(null);
  invalid   = signal(false);
  isDark    = this.themeService.isDark;

  categories  = EXPENSE_CATEGORIES;
  statusLabels = STATUS_LABELS;

  totalExpenses = computed(() =>
    (this.payload()?.expenses ?? []).reduce((s, e) => s + e.amount, 0)
  );

  expensesByCat = computed(() => {
    const cats: Record<string, number> = {};
    for (const e of (this.payload()?.expenses ?? [])) {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    }
    return cats;
  });

  exportingPdf = signal(false);

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    const data  = this.shareService.decode(token);
    if (data?.trip) {
      this.payload.set(data);
    } else {
      this.invalid.set(true);
    }
  }

  getDays(): number {
    const t = this.payload()?.trip;
    if (!t) return 0;
    const ms = new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
    return Math.max(1, Math.ceil(ms / 86400000));
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatShared(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getCategoryLabel(cat: string): string {
    return this.categories.find(c => c.value === cat)?.label ?? cat;
  }

  getCategoryIcon(cat: string): string {
    return this.categories.find(c => c.value === cat)?.icon ?? 'receipt';
  }

  toggleTheme() { this.themeService.toggle(); }

  async downloadPDF() {
    const p = this.payload();
    if (!p || this.exportingPdf()) return;
    const t = p.trip;
    this.exportingPdf.set(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const PRIMARY: [number,number,number] = [37, 99, 235];
      const DARK:    [number,number,number] = [15, 23, 42];
      const GRAY:    [number,number,number] = [100, 116, 139];
      const LIGHT:   [number,number,number] = [248, 250, 252];
      const W = 210, PAD = 16;

      const fmt   = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
      const money = (n: number) => new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
      const statusMap: Record<string, string> = {
        planned: 'Planeada', ongoing: 'Em Curso', completed: 'Concluída', cancelled: 'Cancelada'
      };
      const catLabel: Record<string, string> = {
        transport: 'Transporte', accommodation: 'Alojamento', food: 'Alimentação',
        activities: 'Actividades', shopping: 'Compras', other: 'Outros'
      };

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
      doc.text(`Partilhado em ${this.formatShared(p.sharedAt)} — TravelPlan`, PAD, 33);

      let y = 48;

      const boxes = [
        { label: 'Partida',        val: fmt(t.startDate) },
        { label: 'Regresso',       val: fmt(t.endDate) },
        { label: 'Duração',        val: `${this.getDays()} dias` },
        { label: 'Participantes',  val: String(t.participants) },
        { label: 'Orçamento',      val: `${t.currency} ${money(t.budget)}` },
        { label: 'Total Despesas', val: `${t.currency} ${money(this.totalExpenses())}` },
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

      if (t.activities.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text('Actividades Planeadas', PAD, y);
        y += 5;
        const half = Math.ceil(t.activities.length / 2);
        const colW = (W - PAD * 2 - 8) / 2;
        let lY = y, rY = y;
        t.activities.slice(0, half).forEach(a => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...GRAY);
          doc.text(`• ${a}`, PAD + 2, lY);
          lY += 5;
        });
        t.activities.slice(half).forEach(a => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...GRAY);
          doc.text(`• ${a}`, PAD + colW + 10, rY);
          rY += 5;
        });
        y = Math.max(lY, rY) + 8;
      }

      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(`Despesas (${p.expenses.length})`, PAD, y);
      y += 3;

      if (p.expenses.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text('Nenhuma despesa registada.', PAD, y + 6);
        y += 14;
      } else {
        autoTable(doc, {
          startY: y,
          head: [['Categoria', 'Descrição', 'Pago por', 'Data', `Valor (${t.currency})`]],
          body: p.expenses.map(e => [
            catLabel[e.category] ?? e.category,
            e.description, e.paidBy || '—',
            new Date(e.date).toLocaleDateString('pt-PT'),
            money(e.amount)
          ]),
          foot: [['', '', '', 'TOTAL', `${t.currency} ${money(this.totalExpenses())}`]],
          theme: 'striped',
          headStyles: { fillColor: PRIMARY, textColor: [255,255,255], fontSize: 8, fontStyle: 'bold' },
          footStyles: { fillColor: LIGHT, textColor: DARK, fontSize: 8.5, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8, textColor: DARK },
          columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
          margin: { left: PAD, right: PAD },
          styles: { cellPadding: 3, lineColor: [226,232,240], lineWidth: 0.3 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      const pageCount = doc.getNumberOfPages();
      for (let pg = 1; pg <= pageCount; pg++) {
        doc.setPage(pg);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 287, W, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        doc.text('TravelPlan · Sistema de Planejamento de Viagens', PAD, 293);
        doc.text(`Página ${pg} de ${pageCount}`, W - PAD, 293, { align: 'right' });
      }

      doc.save(`viagem-${t.destination.toLowerCase().replace(/\s+/g, '-')}-${t.startDate}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      this.exportingPdf.set(false);
    }
  }
}
