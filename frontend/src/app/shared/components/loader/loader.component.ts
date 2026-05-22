import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'spinner') {
      <div class="loader-center">
        <div class="spinner spinner--lg"></div>
        @if (message) { <p class="loader-msg">{{ message }}</p> }
      </div>
    }
    @if (type === 'cards') {
      <div class="grid grid--auto">
        @for (i of items; track i) {
          <div class="sk-card">
            <div class="skeleton" style="height:200px;border-radius:12px 12px 0 0;"></div>
            <div style="padding:18px;display:flex;flex-direction:column;gap:10px;">
              <div class="skeleton" style="height:18px;width:70%;"></div>
              <div class="skeleton" style="height:14px;width:50%;"></div>
              <div class="skeleton" style="height:14px;width:40%;"></div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;">
                <div class="skeleton" style="height:16px;width:30%;"></div>
                <div class="skeleton" style="height:20px;width:20%;border-radius:20px;"></div>
              </div>
            </div>
          </div>
        }
      </div>
    }
    @if (type === 'table') {
      <div style="display:flex;flex-direction:column;gap:12px;">
        @for (i of items; track i) {
          <div style="display:flex;align-items:center;gap:16px;">
            <div class="skeleton" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
              <div class="skeleton" style="height:14px;width:60%;"></div>
              <div class="skeleton" style="height:12px;width:40%;"></div>
            </div>
            <div class="skeleton" style="height:24px;width:80px;border-radius:20px;"></div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .loader-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 20px; }
    .loader-msg { color: var(--text-2); font-size: 0.9rem; }
    .sk-card { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  `]
})
export class LoaderComponent {
  @Input() type: 'spinner' | 'cards' | 'table' = 'spinner';
  @Input() count = 6;
  @Input() message = '';
  get items() { return Array(this.count).fill(0); }
}
