import { Component, OnInit } from '@angular/core';
import { ApiService, StatusPayload } from '../../services/api.service';
import { ApiEnvelope } from '../../models/api-response.model';
import { ThemeService } from '../../core/services/theme.service';
import { TRAVEL_HERO_HOME } from '../../core/utils/travel-visuals';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly heroImage = TRAVEL_HERO_HOME;

  loading = true;
  error: string | null = null;
  payload: ApiEnvelope<StatusPayload> | null = null;

  constructor(
    private readonly api: ApiService,
    readonly theme: ThemeService,
  ) {}

  ngOnInit(): void {
    this.api.status().subscribe({
      next: (res) => {
        this.payload = res;
        this.loading = false;
      },
      error: () => {
        this.error =
          'Não foi possível contactar a API. Verifique se o Apache (XAMPP) está activo e se executou npm start com proxy.';
        this.loading = false;
      },
    });
  }
}
