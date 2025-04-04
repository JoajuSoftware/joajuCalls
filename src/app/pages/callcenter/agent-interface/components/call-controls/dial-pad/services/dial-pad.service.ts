import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environtment';
import { AgentCall } from '../interfaces/agent-call.interface';

@Injectable({
  providedIn: 'root',
})
export class DialPadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  call(agent_call: AgentCall): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'agent_call');
    formData.append('agente', agent_call.agent);
    formData.append('nro_cliente', agent_call.nro_cliente);
    formData.append('cola', agent_call.cola);
    formData.append('tipo_call', agent_call.tipo_call);
    formData.append('id_call', agent_call.id_call ? agent_call.id_call : '0');
    formData.append('campana', agent_call.campana ? agent_call.campana : '0');

    return this.http.post(`${this.baseUrl}/agentes`, formData, { 
      responseType: 'text' 
    }).pipe(
      map((response: string) => {
        console.log('Respuesta original:', response);
        
        try {
          const jsonMatch = response.match(/\{.*\}/);
          if (jsonMatch) {
            const jsonPart = jsonMatch[0];
            return JSON.parse(jsonPart);
          } else {
            return { success: true, originalResponse: response };
          }
        } catch (error) {
          console.log('Error al procesar la respuesta:', error);
          return { success: true, originalResponse: response };
        }
      })
    );
  }
}
