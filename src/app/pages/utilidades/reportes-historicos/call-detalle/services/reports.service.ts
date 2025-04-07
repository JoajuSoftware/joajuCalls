import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environtment';
import { Observable } from 'rxjs';
import { Data, ResponseInterface } from '../../../models/interface';

// mover la interfaz a un archivo de interfaces
interface CallData { 
  callid: string;
  estado: string;
  datetime_ini: string;
  datetime_fin: string;
  num: string;
  espera: string;
  duracion: string;
  grabacion: string;
  n_agente: string;
  cola: string;
  n_cola: string;
}

const HEADER = {
  'Authorization': `Bearer ${environment.apiKey}`
}


@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private http: HttpClient = inject(HttpClient);
  readonly apiReports = environment.apiUrl;

  constructor() { }

  getCallsDetails(data: Data): Observable<ResponseInterface<CallData>> {
    return this.http.get<ResponseInterface<CallData>>(`${this.apiReports}/calls?service=call_detalle&&fecha_ini=${data.initDate}&&fecha_fin=${data.endDate}&&cola=${data.queues}`, {headers: HEADER});
  }

}
