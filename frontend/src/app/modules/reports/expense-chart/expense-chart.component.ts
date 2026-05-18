import { Component, Input, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
}

@Component({
  selector: 'app-expense-chart',
  templateUrl: './expense-chart.component.html',
  styleUrls: ['./expense-chart.component.scss'],
})
export class ExpenseChartComponent implements OnInit, OnChanges {
  @Input() expenses: any[] = [];
  @Input() currencySymbol = '€';
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  chartData: ExpenseData[] = [];
  loading = false;
  noData = true;

  private colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
  ];

  ngOnInit(): void {
    if (this.expenses.length > 0) {
      this.processExpenses();
    }
  }

  ngOnChanges(): void {
    if (this.expenses.length > 0) {
      this.processExpenses();
    }
  }

  private processExpenses(): void {
    const categoryMap = new Map<string, number>();

    this.expenses.forEach(expense => {
      const category = expense.category || 'Outra';
      const amount = categoryMap.get(category) || 0;
      categoryMap.set(category, amount + (!expense.is_estimated ? expense.amount : 0));
    });

    this.chartData = Array.from(categoryMap.entries())
      .map((entry, index) => ({
        category: this.getCategoryLabel(entry[0]),
        amount: entry[1],
        color: this.colors[index % this.colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);

    this.noData = this.chartData.length === 0;

    if (this.chartCanvas && this.chartData.length > 0) {
      this.drawChart();
    }
  }

  private drawChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const labels = this.chartData.map(d => d.category);
    const data = this.chartData.map(d => d.amount);
    const colors = this.chartData.map(d => d.color);

    // Use Chart.js from CDN via window
    if (typeof (window as any).Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // Destroy existing chart if it exists
    if ((this as any).chart) {
      (this as any).chart.destroy();
    }

    (this as any).chart = new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${this.currencySymbol}${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

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

  get totalExpenses(): number {
    return this.chartData.reduce((sum, item) => sum + item.amount, 0);
  }
}
