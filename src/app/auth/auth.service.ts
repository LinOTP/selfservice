import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

import { NgxPermissionsService } from 'ngx-permissions';
import { Permission } from '../common/permissions';
import { SystemService } from '../system.service';

export interface LoginOptions {
  username: string;
  password: string;
  realm?: string;
}
@Injectable()
export class AuthService {
  private _loginChangeEmitter: EventEmitter<boolean> = new EventEmitter();

  private baseUrl = `/userservice/`;
  private endpoints = {
    login: 'login',
    logout: 'logout',
  };

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private permissionsService: NgxPermissionsService,
    private router: Router,
    private systemService: SystemService,
  ) { }

  /**
   * sends a login request to the backend and acts based on the response
   *
   * if the login was successful, the users permissions are loaded before finishing the login.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Observable<boolean>}
   * @memberof AuthService
   */
  login(loginOptions: LoginOptions): Observable<boolean> {
    const url = this.baseUrl + this.endpoints.login;

    const params = {
      login: loginOptions.username,
      password: loginOptions.password,
      realm: loginOptions.realm
    };

    if (params.realm === undefined) {
      delete params.realm;
    }

    return this.http.post<{ result: { status: boolean, value: boolean } }>(url, params)
      .pipe(
        map(response => response && response.result && response.result.value === true),
        tap(isLoggedin => this._loginChangeEmitter.emit(isLoggedin)),
        switchMap(isLoggedin => isLoggedin ? // refresh permissions (but only if login was successful)
          this.refreshPermissions().pipe(map(() => isLoggedin)) :
          of(isLoggedin)
        ),
        catchError(this.handleError('login', false)),
      );
  }

  /**
   * sends a logout request to the backend and processes all frontend related tasks
   *
   * The user is redirected to the login page without storing the current route.
   *
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  public logout(): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.endpoints.logout)
      .pipe(
        map(response => response && response.result && response.result.value === true),
        tap(logoutSuccess => {
          if (logoutSuccess) {
            this.handleLogout(false);
          }
        }),
        catchError(this.handleError('logout', false))
      );
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

  get loginChangeEmitter(): Observable<boolean> {
    return this._loginChangeEmitter.asObservable();
  }

}
