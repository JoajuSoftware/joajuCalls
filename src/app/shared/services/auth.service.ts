import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../environments/environtment";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    public isAuth = new BehaviorSubject<boolean>(false);
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

    signOut() {
        sessionStorage.removeItem('userData');
        this.isAuth.next(false);
        this.router.navigate(['/login']);
    }

    getUserData(): any {
        const userData = sessionStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
}
