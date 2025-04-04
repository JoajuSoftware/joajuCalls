import { Injectable, inject } from '@angular/core';
// import { Agent } from '../../../admin/agentes/interface/agentes.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environtment';
import { Observable } from 'rxjs';


const HEADER = { 
  'Authorization': `Bearer ${environment.apiKey}`
}

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  http: HttpClient = inject(HttpClient);

  constructor() { }

  createPortfolio(data:any): Observable<any> { 
    return this.http.post(`${environment.apiUrl}/calls_preview`, data, { headers: HEADER });
  }

  distributeContacts( data:any ): Observable<any> {
    return this.http.post(`${environment.apiUrl}/calls_preview`, data, { headers: HEADER });
  }

  saveContact() {

  }

}
