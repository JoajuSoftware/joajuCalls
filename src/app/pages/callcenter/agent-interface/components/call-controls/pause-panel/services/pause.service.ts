import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environtment';
import { checkAgentStatusResponse, Pause } from '../interfaces/pause.interface';

@Injectable({
  providedIn: 'root',
})
export class PauseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  pause(pauseData: Omit<Pause, 'ag_pass'>): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'pause_agent');
    formData.append('agente', pauseData.agente);
    formData.append('ag_pass', '12345');
    formData.append('reason', pauseData.reason);

    return this.http.post<any>(`${this.baseUrl}/agentes`, formData)
      .pipe(
        map(response => this.normalizeResponse(response))
      );
  }

  unPause(unPauseData: Omit<Pause, 'reason' | 'ag_pass'>): Observable<any> {
    const formData = new FormData();
    formData.append('service', 'unpause_agent');
    formData.append('agente', unPauseData.agente);
    formData.append('ag_pass', "12345");

    return this.http.post<any>(`${this.baseUrl}/agentes`, formData)
      .pipe(
        map(response => this.normalizeResponse(response))
      );
  }

  checkAgentStatus(agente: string): Observable<checkAgentStatusResponse> {
    let params = new HttpParams()
      .set('service', 'estado_agentes')
      .set('agente', agente);

    return this.http.get<checkAgentStatusResponse>(`${this.baseUrl}/agentes`, { params });
  }

  private normalizeResponse(response: any): any {
    if (response.err_code === '200') {
      return {
        err_code: '200',
        estado: 'Pausa correcta',
        mensaje: response.mensaje
      };
    }

    if (response.estado && response.estado.includes('Pausa correcta')) {
      return {
        err_code: '200',
        estado: response.estado,
        mensaje: 'Operación exitosa'
      };
    }

    if (response.estado && response.estado.startsWith('Error')) {
      return {
        err_code: 'parcial',
        estado: response.estado,
        mensaje: 'Pausa aplicada parcialmente'
      };
    }

    return response;
  }
}
