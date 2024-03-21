import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoginService } from '@app/login/login.service';
import { Duration, NotificationService } from '@common/notification.service';

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
          if (this.loginService.hasEverLoggedIn) {
            this.notificationService.errorMessage(
              $localize`Your session timed out, please login again.`,
              Duration.LONG
            );
          }
          return EMPTY;
        } else if (String(error.status).startsWith('5')) {
          this.notificationService.errorMessage(
            $localize`Server error encountered, request failed.`,
            Duration.LONG
          );
        }
        return throwError(() => error);
      }));
  }

}
