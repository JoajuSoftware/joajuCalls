import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environtment';
import { Data, ResponseInterface } from '../../../models/interface';
import { Observable } from 'rxjs';

const HEADER = { 
  'Authorization': `Bearer ${environment.apiKey}`
}

interface AgentData {
  agente: string;
  n_agente: string;
  cola: string;
  terminada: string;
  activas: string;
  dur_mayor_15: string;
  dur_min_15: string;
  dur_mayor_60: string;
  dur_min_60: string;
  wait_max_15: string;
  wait_min_15: string;
  dur_avg: string;
  conversacion: string;
  dur_min: string;  
  dur_max: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentResumeService {

  constructor() { }

  http: HttpClient = inject(HttpClient);


  getAgentResume(data: Data): Observable<ResponseInterface<AgentData>> {
    return this.http.get<ResponseInterface<AgentData>>(`${environment.apiUrl}/calls?service=calls_resumen_agente&&fecha_ini=${data.initDate}&&fecha_fin=${data.endDate}&&cola=${data.queues}`, {headers: HEADER});
  }

  // https://cloudpbx.joaju.net/api/calls?service=calls_resumen_agente&fecha_ini=2024-08-01&fecha_fin=2025-03-10&cola=4001,6001,6000



}
