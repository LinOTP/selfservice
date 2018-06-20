import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  constructor(
    private router: Router,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req)
      .catch((error: HttpErrorResponse, caught) => {
        if (error.status === 401) {
          console.log('Unauthorized api request: ');
          this.router.navigate(['/login']);
        }
        return Observable.throw(error);
      });
  }

}
