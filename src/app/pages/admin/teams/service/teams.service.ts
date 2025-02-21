import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environtment';
import { TeamResponse } from '../interface/teams.interface';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getTeams(): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.baseUrl}/gestion_call`, {
      params: {
        service: 'listar_teams'
      }
    });
  }


  createTeam(n_team: string): Observable<any>{
    const formData = new FormData();
    formData.append('service', 'add_team');
    formData.append('n_team', n_team);

    return this.http.post<any>(`${this.baseUrl}/gestion_call`, formData);
  }
}
