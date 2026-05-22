import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Minhas Viagens', icon: 'luggage', route: '/trips' },
  { label: 'Meu Perfil', icon: 'person', route: '/profile' },
  { label: 'Administração', icon: 'admin_panel_settings', route: '/admin', adminOnly: true }
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  sidebarOpen = signal(true);
  mobileMenuOpen = signal(false);
  isDark = computed(() => this.themeService.isDark());
  user = computed(() => this.auth.currentUser());
  isAdmin = computed(() => this.auth.isAdmin());

  navItems = computed(() =>
    NAV_ITEMS.filter(n => !n.adminOnly || this.isAdmin())
  );

  userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  });

  pageTitle = signal('Dashboard');

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const item = NAV_ITEMS.find(n => e.url.startsWith(n.route));
      if (item) this.pageTitle.set(item.label);
      this.mobileMenuOpen.set(false);
    });
    if (window.innerWidth < 1024) this.sidebarOpen.set(false);
  }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  toggleMobile() { this.mobileMenuOpen.update(v => !v); }
  toggleTheme() { this.themeService.toggle(); }
  logout() { this.auth.logout(); }
  goToProfile() { this.router.navigate(['/profile']); }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
