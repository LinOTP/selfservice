import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SessionService } from './session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  constructor(
    private sessionService: SessionService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse, caught) => {
        if (error.status === 401) {
          this.sessionService.handleLogout(true);
        }
        return throwError(error);
      }));
  }

}
