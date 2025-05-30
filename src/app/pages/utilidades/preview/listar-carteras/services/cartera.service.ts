import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environtment';
import { CarteraResponse, DetalleCarteraResponse } from '../interfaces/cartera.interface';

@Injectable({
  providedIn: 'root',
})
export class CarteraService {
  apiUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getCarteras(colas): Observable<CarteraResponse> {
    return this.http.get<CarteraResponse>(
      `${this.apiUrl}/calls_preview?service=listar_carteras&colas=${colas}`
    );
  }

  getDetalleCartera(id): Observable<DetalleCarteraResponse> {
    return this.http.get<DetalleCarteraResponse>(
      `${this.apiUrl}/calls_preview?service=detalle_cartera&id_camp=${id}`
    );
  }
}
