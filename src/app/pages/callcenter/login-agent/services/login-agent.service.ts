import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environtment";

@Injectable({
    providedIn: "root"
})
export class LoginAgentService {
    public isLoginAgentAuth = new BehaviorSubject<boolean>(false);
    apiUrl: string = environment.apiUrl;

    constructor(private router: Router, private http: HttpClient) {
        this.autoSignIn();
    }

    signIn(credentials: any): Observable<any> {
        const formData = new FormData();
        
        formData.append('service', "con_agente");
        formData.append('agente', credentials.agente);
        formData.append('ag_pass', "123456");
        formData.append('exten', credentials.extension);

        const loginAgent = {
            agente: credentials.agente,
            exten: credentials.extension
        }

        return this.http.post<any>(`${this.apiUrl}/agentes`, formData).pipe(
            tap(response => {
                if (response && response.err_code === "200" || response && response.err_code === "202" || response && response.err_code === "201") {
                    sessionStorage.setItem('loginAgent', JSON.stringify(loginAgent));
                    this.isLoginAgentAuth.next(true);
                    this.router.navigate(['/callcenter/dashboard']);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Login failed', error);
                return throwError(() => error);
            })
        );
    }

    autoSignIn() {
        const userData = sessionStorage.getItem('loginAgent');
        if (userData) {
            const parsedData = JSON.parse(userData);
            if (parsedData) {
                this.isLoginAgentAuth.next(true);
            }
        }
    }

    logout() {
        const loginAgent = JSON.parse(sessionStorage.getItem('loginAgent'));

        const formData = new FormData();
        
        formData.append('service', "logout_agente");
        formData.append('agente', loginAgent.agente);
        formData.append('ag_pass', "123456");

        return this.http.post<any>(`${this.apiUrl}/agentes`, formData).pipe(
            tap(response => {
                if (response && response.err_code === "200") {
                    sessionStorage.removeItem('loginAgent');
                    this.isLoginAgentAuth.next(false);
                    this.router.navigate(['/loginAgent']);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Logout failed', error);
                return throwError(() => error);
            })
        );
    }
}
