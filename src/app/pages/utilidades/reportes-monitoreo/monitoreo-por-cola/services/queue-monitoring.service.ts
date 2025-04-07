import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environtment';
import { Data, QueueMonitoringData, ResponseInterface } from '../../../models/interface';
import { Observable } from 'rxjs';

const HEADER = { 
  'Authorization': `Bearer ${environment.apiKey}`
}

@Injectable({
  providedIn: 'root'
})
export class QueueMonitoringService {

  http:HttpClient = inject(HttpClient)

  constructor() { }

  getQueueMonitoringData(data: Pick<Data, 'queues'>): Observable<ResponseInterface<QueueMonitoringData>> {
    return this.http.get<ResponseInterface<QueueMonitoringData>>(`${environment.apiUrl}/agentes?service=agentes_cola&cola=${data.queues}`, { headers: HEADER })
  }

}
