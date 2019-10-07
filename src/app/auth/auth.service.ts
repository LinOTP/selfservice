import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

import { NgxPermissionsService } from 'ngx-permissions';
import { Permission } from '../common/permissions';
import { SystemService } from '../system.service';
import { NavigationExtras, Router } from '@angular/router';



@Injectable()
export class AuthService {
  public _loginChangeEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private cookieService: CookieService,
    private permissionsService: NgxPermissionsService,
    private systemService: SystemService,
    private router: Router,
  ) { }

  /**
   * requests the permissions for the currently logged in user.
   *
   * This is done by evaluating the selfservice context that provides the
   * policy actions. They get mapped to the frontend permissions and are loaded
   * into the NgxPermissionsService.
   *
   * @returns {Observable<Permission[]>}
   * @memberof AuthService
   */
  public refreshPermissions(): Observable<Permission[]> {
    return this.systemService.getUserSystemInfo().pipe(
      map(systemInfo => systemInfo.permissions),
      tap(permissions => {
        localStorage.setItem('permissions', JSON.stringify(permissions));
        this.permissionsService.loadPermissions(permissions);
      }),
      catchError(this.handleError('loadPermissions', [])),
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

  /*
   * TODO: Make a request to the backend to check wheither the cookie
   *       is still valid or not and convert function to an Observable
   *       to keep a channel open for later
   */
  isLoggedIn(): boolean {
    const session = this.getSession();
    return !!session;
  }

  getSession(): string {
    return this.cookieService.get('user_selfservice');
  }

  /**
* handles a closed login session to clear up the frontend state
*
* - loginChangeEmitter is updated
* - all persistent data is cleared
* - the user is redirected to the login screen.
*   If the parameter `storeCurrentRoute` is set to true, the current router url
*   will be stored so that the application returns to the current view once the
*   user logs back in.
*
* @param {boolean} storeCurrentRoute
* @memberof AuthService
*/
  public handleLogout(storeCurrentRoute: boolean) {
    localStorage.removeItem('permissions');
    this.permissionsService.flushPermissions();

    const navigationExtras: NavigationExtras = {};
    if (storeCurrentRoute) {
      navigationExtras.queryParams = { 'redirect': this.router.url };
    }
    this.router.navigate(['/login'], navigationExtras);

    this._loginChangeEmitter.emit(false);
  }

  /**
   * Getter for the login change emitter, which issues events when the login
   * state changes.
   *
   * @readonly
   * @type {Observable<boolean>} observable of the login state
   * @memberof AuthService
   */
  get loginChangeEmitter(): Observable<boolean> {
    return this._loginChangeEmitter.asObservable();
  }

  /**
   * Emits the login state and, if the user was successfully logged in, reloads their permissions.
   * @param success true when the user was successfully logged in, false otherwise
   * @memberof AuthService
   */
  public handleLogin(success: boolean) {
    this._loginChangeEmitter.emit(success);
    if (success) {
      this.refreshPermissions().subscribe();
    }
  }

}
