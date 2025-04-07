import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environtment';
import { Data, ResponseInterface, QueueData } from '../../../models/interface';
import { Observable } from 'rxjs';

const HEADER = { 
  'Authorization': `Bearer ${environment.apiKey}`
}

@Injectable({
  providedIn: 'root'
})
export class QueueResumeService {

  http: HttpClient = inject(HttpClient);

  constructor() { }


  getQueueResume(data: Data): Observable<ResponseInterface<QueueData>> {
    return this.http.get<ResponseInterface<QueueData>>(`${environment.apiUrl}/calls?service=calls_resumen_cola&fecha_ini=${data.initDate}&fecha_fin=${data.endDate}&cola=${data.queues}`, {headers: HEADER});
  }
 


}
