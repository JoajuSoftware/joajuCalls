import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../environments/environtment";
import { LoginAgentService } from "../../pages/callcenter/login-agent/services/login-agent.service";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    public isAuth = new BehaviorSubject<boolean>(false);
    private loginAgentService: LoginAgentService = inject(LoginAgentService);
    apiUrl: string = environment.apiUrl;

    constructor(private router: Router, private http: HttpClient) {
        this.autoSignIn();
    }

    signIn(credentials: any): Observable<any> {
        const formData = new FormData();

        formData.append('service', "login_usuario");
        formData.append('usuario', credentials.username);
        formData.append('password', credentials.password);

        return this.http.post<any>(`${this.apiUrl}/usuarios`, formData).pipe(
            tap(response => {
                if (response && response.err_code === "200") {
                    const userData = JSON.parse(response.mensaje);
                    sessionStorage.setItem('userData', JSON.stringify(userData));
                    this.isAuth.next(true);
                    if (userData.perfil === 'agente') {
                        this.router.navigate(['/loginAgent']);
                    }
                    else if (userData.perfil === 'admin' || userData.perfil === 'supervisor') {
                        this.router.navigate(['/dashboard']);
                    }
                    this.router.navigate(['/dashboard']);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Login failed', error);
                return throwError(() => error);
            })
        );
    }

    autoSignIn() {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            if (parsedData) {
                this.isAuth.next(true);
            }
        }
    }

    logout() {
        if (sessionStorage.getItem('loginAgent')) {
            this.loginAgentService.logout().subscribe({
                next: (response) => {
                    console.log('Logout agent successful', response);
                },
                error: (err) => {
                    console.error('Logout agent failed', err);
                }
            });
        }
        sessionStorage.removeItem('userData');
        this.isAuth.next(false);
        this.router.navigate(['/login']);
    }

    getUserData(): any {
        const userData = sessionStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
}
