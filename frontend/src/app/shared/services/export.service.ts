import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

export interface ExportOptions {
  filename: string;
  title?: string;
  includeMetadata?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  /**
   * Exporta dados para CSV.
   * @param data Array de objetos
   * @param filename Nome do arquivo
   */
  exportToCSV(data: any[], filename: string = 'export.csv'): void {
    const csv = Papa.unparse(data);
    this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta uma tabela HTML para CSV.
   */
  tableToCSV(tableElement: HTMLElement, filename: string = 'table.csv'): void {
    const rows: string[] = [];
    const table = tableElement.querySelector('table');

    if (!table) {
      console.error('No table found');
      return;
    }

    // Cabeçalhos
    const headers = Array.from(table.querySelectorAll('thead th'))
      .map((th) => this.escapeCSV(th.textContent || ''));
    rows.push(headers.join(','));

    // Linhas
    table.querySelectorAll('tbody tr').forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td'))
        .map((td) => this.escapeCSV(td.textContent || ''));
      rows.push(cells.join(','));
    });

    const csv = rows.join('\n');
    this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta uma tabela HTML para PDF.
   */
  async tableToPDF(tableElement: HTMLElement, options: Partial<ExportOptions> = {}): Promise<void> {
    const {
      filename = 'table.pdf',
      title = 'Export',
      includeMetadata = true,
    } = options;

    try {
      const canvas = await html2canvas(tableElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 10;

      // Título
      if (title) {
        pdf.setFontSize(14);
        pdf.text(title, 10, yPosition);
        yPosition += 10;
      }

      // Metadados
      if (includeMetadata) {
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, yPosition);
        yPosition += 5;
      }

      // Tabela
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth - 20, imgHeight);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta dados JSON para PDF (mais flexível).
   */
  async dataToPDF(
    data: any,
    htmlGenerator: (data: any) => HTMLElement,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const element = htmlGenerator(data);
    document.body.appendChild(element);
    try {
      await this.tableToPDF(element, options);
    } finally {
      element.remove();
    }
  }

  /**
   * Exporta JSON bruto.
   */
  exportToJSON(data: any, filename: string = 'export.json'): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, filename, 'application/json;charset=utf-8;');
  }

  /**
   * Faz download de um arquivo.
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Escapa valores CSV.
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
