import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environtment';
import { AgentCallInfo } from '../interfaces/callInfo';

@Injectable({
  providedIn: 'root',
})
export class CallInfoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAgentCallInfo(agente: string): Observable<AgentCallInfo> {
    return this.http.get<AgentCallInfo>(`${this.baseUrl}/agentes`, {
      params: {
        service: 'agente_consulta',
        agente: agente
      },
    });
  }
}
