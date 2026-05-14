import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEnvelope } from '../models/api-response.model';

export interface HealthPayload {
  service: string;
  version: string;
  timestamp: string;
}

export interface StatusPayload {
  api: string;
  database: string;
  timestamp: string;
}

/**
 * Cliente HTTP base para a API PHP (via proxy em desenvolvimento).
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  health(): Observable<ApiEnvelope<HealthPayload>> {
    return this.http.get<ApiEnvelope<HealthPayload>>('/api/v1/health');
  }

  status(): Observable<ApiEnvelope<StatusPayload>> {
    return this.http.get<ApiEnvelope<StatusPayload>>('/api/v1/status');
  }
}
