import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { SessionService } from '@app/auth/session.service';
import { LoginService } from '@app/login/login.service';
import { filter, switchMap, tap } from 'rxjs';
import { CustomContentService } from './custom-content/custom-content.service';
import { CustomPageComponent } from './custom-content/custom-page.component';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    private loginService: LoginService,
    private sessionService: SessionService,
    private router: Router, private customContentService:CustomContentService
  ) { }

  /**
   * method is called during APP_INITIALIZER phase to bootstrap background services.
   *
   * @memberof AppInitService
   */
  init() {
    if (this.sessionService.isLoggedIn()) {
      this.loginService.loadStoredPermissions();
      setTimeout(() => {
        this.loginService.refreshUserSystemInfo().subscribe();
      });
    }
    this.customContentService.loadContent();

    // waiting till custom page is loaded before bootstrapping the app
    // it solves problem with deep links for dynamic routes
    return new Promise<void>((resolve) => {
    this.customContentService.customContentLoaded$.pipe(
      filter(loaded => loaded),
      switchMap(() => {
          return this.customContentService.page$.pipe(
            tap(page => {
              if(page && page.content) {
                const pageRoute = {
                  component: CustomPageComponent,
                  path:page.route
                }
                this.router.resetConfig([pageRoute, ...this.router.config]);
              }
                resolve()
            }))
      })).subscribe()

  })
  }

}
