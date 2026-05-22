import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: ``,
  styles: [``]
})
export class AuthLayoutComponent {
  themeService = inject(ThemeService);
  isDark = computed(() => this.themeService.isDark());
  toggleTheme() { this.themeService.toggle(); }
}
