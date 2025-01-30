import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environtment';

export const requestInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const isApiRequest = request.url.startsWith(environment.apiUrl);

  if (isApiRequest) {
    const isFormData = request.body instanceof FormData;
    
    const modifiedRequest = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${environment.apiKey}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      }
    });

    return next(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error completo:', error);
        return throwError(() => error);
      })
    );
  }

  return next(request);
};
