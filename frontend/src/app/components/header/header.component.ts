import { Component, inject } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  translate = inject(TranslateService);
  auth = inject(AuthService);
  
  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
  }

  logout() {
    this.auth.logout();
  }
}
