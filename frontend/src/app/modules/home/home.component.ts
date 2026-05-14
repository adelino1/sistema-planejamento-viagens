import { Component, OnInit } from '@angular/core';
import { ApiService, StatusPayload } from '../../services/api.service';
import { ApiEnvelope } from '../../models/api-response.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  loading = true;
  error: string | null = null;
  payload: ApiEnvelope<StatusPayload> | null = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.status().subscribe({
      next: (res) => {
        this.payload = res;
        this.loading = false;
      },
      error: () => {
        this.error =
          'Não foi possível contactar a API. Verifique se o Apache (XAMPP) está ativo e se executou npm start com proxy.';
        this.loading = false;
      },
    });
  }
}
