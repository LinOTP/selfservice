import { Injectable } from '@angular/core';
import { LoginService } from './login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    private loginService: LoginService,
  ) { }

  /**
   * method is called during APP_INITIALIZER phase to bootstrap background services.
   *
   * @memberof AppInitService
   */
  init() {
    this.loginService.loadStoredPermissions();
  }

}
