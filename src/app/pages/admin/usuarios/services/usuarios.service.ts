import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environtment';
import { TeamAclResponse, UsuarioResponse } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  apiUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(
      `${this.apiUrl}/usuarios?service=lista_usuarios`
    );
  }

  createUsuario(formData: FormData): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/usuarios`, formData, {
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          console.log('Respuesta original:', response);

          if (response === 'Usuario ya existe') {
            return {
              err_code: 'error',
              mensaje: 'Usuario ya existe',
            };
          }

          try {
            const lastIdMatch = response.match(/\[last_id\] => (\d+)/);
            const lastId = lastIdMatch ? lastIdMatch[1] : null;

            if (lastId) {
              return {
                lastId,
                err_code: '200',
                mensaje: 'Usuario creado exitosamente',
              };
            } else {
              return {
                err_code: 'error',
                mensaje: response,
              };
            }
          } catch (error) {
            console.error('Error procesando respuesta:', error);
            return {
              err_code: 'error',
              mensaje: response,
            };
          }
        })
      );
  }

  updateUsuario(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, formData);
  }

  listAclSup(usuario: string): Observable<TeamAclResponse> {
    const params = new HttpParams()
        .set('service', 'list_acl_sup')
        .set('usuario', usuario);

    return this.http.get<TeamAclResponse>(`${this.apiUrl}/usuarios`, { params });
  }

  addUsuarioTeam(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, formData);
  }

  delUsuarioTeam(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, formData);
  }
}
