import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environtment';

import {
  Agent,
  AgentResponse,
  AgentsApiResponse,
} from '../interface/agentes.interface';

@Injectable({
  providedIn: 'root',
})
export class AgentesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Obtener lista de agentes
  getAgentes(): Observable<AgentsApiResponse> {
    return this.http.get<AgentsApiResponse>(`${this.baseUrl}/agentes`, {
      params: {
        service: 'estado_agentes',
      },
    });
  }

  //Crear Agente
  createAgent(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }

  // agentes.service.ts
  updateAgent(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }
}
