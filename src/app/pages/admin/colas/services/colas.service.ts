import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environtment';
import { Cola, ColasApiResponse } from '../interfaces/colas.interface';

@Injectable({
  providedIn: 'root',
})
export class ColasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private url = 'https://cloudpbx.joaju.net/api/agentes?service=agente_consulta&agente='

  getColas(): Observable<ColasApiResponse> {
    return this.http.get<ColasApiResponse>(`${this.baseUrl}/gestion_call`, {
      params: {
        service: 'listar_colas',
      },
    });
  }

  getUserQueues(username: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/agentes?service=agente_consulta&agente=${username}`);
  }

  createCola(numeroCola: string, nombreCola: string): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'add_cola');
    formData.append('cola', numeroCola);
    formData.append('n_cola', nombreCola);

    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }

  updateCola(idCola: string, numeroCola: string, nombreCola: string): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'update_cola');
    formData.append('id', idCola);
    formData.append('cola', numeroCola);
    formData.append('n_cola', nombreCola);

    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }

  deleteCola(idCola: string): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'delete_cola');
    formData.append('id', idCola);

    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }

  addAgentToQueue(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agente`, data);
  }

  deleteAgentFromQueue(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agente`, data);
  }
}
