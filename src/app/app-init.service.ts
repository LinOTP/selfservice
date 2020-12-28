import { Injectable } from '@angular/core';
import { SessionService } from './auth/session.service';
import { LoginService } from './login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    private loginService: LoginService,
    private sessionService: SessionService,
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
  }

}
