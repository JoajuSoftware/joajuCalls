import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environtment';
import { ContactResponse } from '../interfaces/contact-manage.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactManageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCurrentFormattedDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  getListGestionesDia(agente: string): Observable<ContactResponse> {
    const formattedDate = this.getCurrentFormattedDate();
    
    return this.http.get<ContactResponse>(`${this.baseUrl}/calls_preview`, {
      params: {
        service: 'list_ges_dia',
        n_agente: agente,
        fecha: '2024-07-19'
      }
    });
  }
}
