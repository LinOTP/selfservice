
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { LoginService } from '@app/login/login.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthGuard  {

    constructor(
        private loginService: LoginService,
        private sessionService: SessionService,
    ) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        const isAuthenticated = this.sessionService.isLoggedIn();

        if (!isAuthenticated) {
            this.loginService.handleLogout(true);
        }

        return isAuthenticated;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }
}
