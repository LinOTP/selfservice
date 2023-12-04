
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionService } from './session.service';

@Injectable()
export class UnauthenticatedGuard {

  constructor(
    private sessionService: SessionService,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAuthenticated = this.sessionService.isLoggedIn();

    return of(!isAuthenticated).pipe(
      tap(() => {
        if (isAuthenticated) {
          const route = next.queryParams?.redirect || '/home';

          this.router.navigate([route]);
        }
      })
    );
  }
}
