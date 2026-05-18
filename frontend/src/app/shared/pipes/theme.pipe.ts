import { Pipe, PipeTransform } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Pipe para retornar valor baseado em tema.
 * Uso: {{ 'dark-class' | themePipe : 'light-class' }}
 */
@Pipe({
  name: 'themePipe',
  standalone: true,
})
export class ThemePipe implements PipeTransform {
  constructor(private themeService: ThemeService) {}

  transform(darkValue: any, lightValue: any): any {
    return this.themeService.mode$.value === 'dark' ? darkValue : lightValue;
  }
}
