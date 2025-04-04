import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environtment';
import { Data, ResponseInterface, ConnectionAgentData } from '../../../models/interface';
import { Observable } from 'rxjs';

const HEADER = { 
  'Authorization': `Bearer ${environment.apiKey}`
}

@Injectable({
  providedIn: 'root'
})
export class AgentConectionsService {

  http: HttpClient = inject(HttpClient);

  constructor() { }

  getConnectionsData(data): Observable<ResponseInterface<ConnectionAgentData>> {
    // console.log(data)
    return this.http.get<ResponseInterface<ConnectionAgentData>>(`${environment.apiUrl}/agentes?service=conexion_agentes&fecha_ini=${data.fecha_ini}&fecha_fin=${data.fecha_fin}&id_teams=${data.id_teams}`, {headers: HEADER});
  }


}
