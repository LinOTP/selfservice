
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { SessionService } from './session.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private sessionService: SessionService, private router: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        const isAuthenticated = this.sessionService.isLoggedIn();

        if (!isAuthenticated) {
            this.sessionService.handleLogout(true);
        }

        return isAuthenticated;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }
}
