import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  private permissionLoad$ = new BehaviorSubject(false);

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
    if (permissions) {
      this.permissionLoad$.next(true);
      this.permissionsService.loadPermissions(permissions);
    }
  }

  public clearPermissions() {
    this.permissionsService.flushPermissions();
    this.permissionLoad$.next(false);
  }

  public getPermissionLoad$(): Observable<boolean> {
    return this.permissionLoad$.asObservable();
  }

}
