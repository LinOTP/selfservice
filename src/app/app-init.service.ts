import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    private permissionsService: NgxPermissionsService
  ) { }

  /**
   * method is called during APP_INITIALIZER phase to bootstrap background services.
   *
   * @memberof AppInitService
   */
  init() {
    this.loadStoredPermissions();
  }

  /**
   * bootstraps permissions stored in localStorage.
   *
   * @memberof AppInitService
   */
  public loadStoredPermissions() {
    const permissions = JSON.parse(localStorage.getItem('permissions'));
    this.permissionsService.loadPermissions(
      permissions || [] // fall back to an empty permission set if no permissions are set.
    );
  }
}
