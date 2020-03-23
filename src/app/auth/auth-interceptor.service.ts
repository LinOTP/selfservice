import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from '../login/login.service';
import { NotificationService, Duration } from '../common/notification.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  constructor(
    private loginService: LoginService,
    private notificationService: NotificationService,
    private i18n: I18n,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse, caught) => {
        if (error.status === 401) {
          this.loginService.handleLogout(true);
          this.notificationService.message(
            this.i18n('Your session timed out, please login again.'),
            Duration.LONG
          );
        } else if (String(error.status).startsWith('5')) {
          this.notificationService.message(
            this.i18n('Server error encounterd, request failed.'),
            Duration.LONG
          );
        }
        return throwError(error);
      }));
  }

}
