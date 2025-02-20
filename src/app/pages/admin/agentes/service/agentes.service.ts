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
  createAgent(data: {
    service: string;
    n_agente: string;
    des_agente: string;
    team: string;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'add_agente');
    formData.append('n_agente', data.n_agente);
    formData.append('des_agente', data.des_agente);
    formData.append('team', data.team);

    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }

  // agentes.service.ts
  updateAgent(data: {
    service: string;
    n_agente: string;
    des_agente: string;
    id_agente: string;
    team: string;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'update_agente');
    formData.append('n_agente', data.n_agente);
    formData.append('des_agente', data.des_agente);
    formData.append('id_agente', data.id_agente);
    formData.append('team', data.team);

    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }
}
