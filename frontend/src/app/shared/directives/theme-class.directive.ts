import { Directive, HostBinding, Input } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Diretiva para aplicar classes baseado em tema.
 * Uso: [appThemeClass]="'dark-bg'"
 */
@Directive({
  selector: '[appThemeClass]',
  standalone: true,
})
export class ThemeClassDirective {
  @Input() set appThemeClass(value: string) {
    this.updateClass(value);
  }

  @HostBinding('class') classes = '';

  constructor(private themeService: ThemeService) {
    this.themeService.mode$.subscribe(() => {
      if (this.lastValue) {
        this.updateClass(this.lastValue);
      }
    });
  }

  private lastValue = '';

  private updateClass(value: string): void {
    this.lastValue = value;
    const isDark = this.themeService.mode$.value === 'dark';
    this.classes = isDark ? value : '';
  }
}
