import { HttpClient } from "@angular/common/http"
import { Injectable, inject } from "@angular/core"
import { Observable } from "rxjs"
import { environment } from "../../../../environments/environtment"

import {Agent, AgentResponse, AgentsApiResponse} from '../interface/agentes.interface'

@Injectable({
  providedIn: 'root'
})

export class AgentesService{
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAgentes(): Observable<AgentsApiResponse> {
    return this.http.get<AgentsApiResponse>(`${this.baseUrl}/agentes`,{
      params: {
        service: 'estado_agentes'
      }
    })
  }


}
