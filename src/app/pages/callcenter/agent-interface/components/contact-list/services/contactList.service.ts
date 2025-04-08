import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environtment';
import { contactListResponse } from '../interfaces/contactList.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactListService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getProxCall(agente: string): Observable<contactListResponse> {
    
    return this.http.get<contactListResponse>(`${this.baseUrl}/calls_preview`, {
      params: {
        service: 'listar_prox_call',
        n_agente: agente
      }
    });
  }
}
