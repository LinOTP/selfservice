
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { LoginService } from '../login/login.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

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
