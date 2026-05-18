import { Injectable } from '@angular/core';
import { Expense } from './expense.service';

interface ExportOptions {
  tripName?: string;
  currencySymbol?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  /**
   * Exporta despesas como CSV
   */
  exportToCSV(expenses: Expense[], options: ExportOptions = {}): void {
    const { tripName = 'Despesas', currencySymbol = '€' } = options;

    const headers = ['Data', 'Categoria', 'Descrição', 'Valor', 'Tipo'];
    const rows = expenses.map((expense) => [
      new Date(expense.created_at).toLocaleDateString('pt-PT'),
      this.getCategoryLabel(expense.category),
      expense.description || '-',
      `${currencySymbol}${expense.amount.toFixed(2)}`,
      expense.is_estimated ? 'Estimada' : 'Real',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    this.downloadFile(csv, `${tripName}-despesas.csv`, 'text/csv');
  }

  /**
   * Exporta despesas como PDF usando jsPDF
   */
  async exportToPDF(
    expenses: Expense[],
    options: ExportOptions = {}
  ): Promise<void> {
    const { tripName = 'Despesas', currencySymbol = '€' } = options;

    // Check if jsPDF is available
    if (!this.isJsPdfAvailable()) {
      alert('jsPDF não está carregado. Tentando carregar da CDN...');
      await this.loadJsPdf();
    }

    if (!this.isJsPdfAvailable()) {
      alert('Não foi possível carregar jsPDF. Use a exportação CSV em alternativa.');
      return;
    }

    const jsPDF = (window as any).jspdf.jsPDF;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Add title
    pdf.setFontSize(16);
    pdf.text(tripName, 10, 10);

    // Add metadata
    pdf.setFontSize(10);
    pdf.text(`Data de exportação: ${new Date().toLocaleDateString('pt-PT')}`, 10, 20);
    pdf.text(`Total de despesas: ${expenses.length}`, 10, 26);

    // Add summary
    const totalEstimated = expenses.filter(e => e.is_estimated).reduce((sum, e) => sum + e.amount, 0);
    const totalActual = expenses.filter(e => !e.is_estimated).reduce((sum, e) => sum + e.amount, 0);
    pdf.setFontSize(11);
    pdf.text(`Total Estimado: ${currencySymbol}${totalEstimated.toFixed(2)}`, 10, 32);
    pdf.text(`Total Real: ${currencySymbol}${totalActual.toFixed(2)}`, 10, 38);

    // Add table
    const headers = ['Data', 'Categoria', 'Descrição', 'Valor', 'Tipo'];
    const rows = expenses.map((expense) => [
      new Date(expense.created_at).toLocaleDateString('pt-PT'),
      this.getCategoryLabel(expense.category),
      (expense.description || '-').substring(0, 20),
      `${currencySymbol}${expense.amount.toFixed(2)}`,
      expense.is_estimated ? 'Estimada' : 'Real',
    ]);

    this.addTableToDoc(pdf, headers, rows, 44);

    // Save PDF
    pdf.save(`${tripName}-despesas.pdf`);
  }

  /**
   * Adiciona uma tabela ao documento PDF
   */
  private addTableToDoc(
    pdf: any,
    headers: string[],
    rows: (string | number)[][],
    startY: number
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const columnWidth = (pageWidth - 2 * margin) / headers.length;
    const rowHeight = 7;

    let y = startY;

    // Draw headers
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.setFillColor(200, 200, 200);

    headers.forEach((header, i) => {
      pdf.rect(
        margin + i * columnWidth,
        y,
        columnWidth,
        rowHeight,
        'F'
      );
      pdf.text(header, margin + i * columnWidth + 2, y + 5);
    });

    y += rowHeight;

    // Draw rows
    pdf.setFont(undefined, 'normal');
    pdf.setFillColor(255, 255, 255);

    rows.forEach((row) => {
      // Check if we need a new page
      if (y + rowHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;

        // Redraw headers on new page
        pdf.setFont(undefined, 'bold');
        pdf.setFillColor(200, 200, 200);
        headers.forEach((header, i) => {
          pdf.rect(
            margin + i * columnWidth,
            y,
            columnWidth,
            rowHeight,
            'F'
          );
          pdf.text(header, margin + i * columnWidth + 2, y + 5);
        });
        y += rowHeight;
        pdf.setFont(undefined, 'normal');
      }

      row.forEach((cell, i) => {
        pdf.rect(margin + i * columnWidth, y, columnWidth, rowHeight);
        pdf.text(
          String(cell).substring(0, 15),
          margin + i * columnWidth + 2,
          y + 5
        );
      });

      y += rowHeight;
    });
  }

  /**
   * Verifica se jsPDF está disponível
   */
  private isJsPdfAvailable(): boolean {
    return typeof (window as any).jspdf !== 'undefined';
  }

  /**
   * Carrega jsPDF da CDN
   */
  private async loadJsPdf(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  /**
   * Faz download de um arquivo
   */
  private downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Converte categoria para label legível
   */
  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      accommodation: 'Alojamento',
      transportation: 'Transporte',
      meals: 'Refeições',
      activities: 'Atividades',
      shopping: 'Compras',
      other: 'Outra',
    };
    return labels[category] || category;
  }
}
