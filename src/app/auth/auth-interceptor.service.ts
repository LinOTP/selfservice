import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from '../login/login.service';
import { NotificationService, Duration } from '../common/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  constructor(
    private loginService: LoginService,
    private notificationService: NotificationService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse, caught) => {
        if (error.status === 401) {
          this.loginService.handleLogout(true);
          this.notificationService.message(
            $localize`Your session timed out, please login again.`,
            Duration.LONG
          );
        } else if (String(error.status).startsWith('5')) {
          this.notificationService.message(
            $localize`Server error encountered, request failed.`,
            Duration.LONG
          );
        }
        return throwError(error);
      }));
  }

}
