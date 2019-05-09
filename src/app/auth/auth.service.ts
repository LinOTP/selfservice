import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

import { NgxPermissionsService } from 'ngx-permissions';
import { Permission, PoliciesToPermissionsMapping } from '../permissions';

@Injectable()
export class AuthService {
  private _loginChangeEmitter: EventEmitter<boolean> = new EventEmitter();

  private baseUrl = `/userservice/`;
  private endpoints = {
    login: 'login',
    logout: 'logout',
    context: 'context',
  };

  private options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };


  /**
   * maps backend LinOTP policy actions to the available frontend permissions
   *
   * @private
   * @param {string[]} policies
   * @returns {Permission[]}
   * @memberof AuthService
   */
  private static mapPoliciesToPermissions(policies: string[]): Permission[] {
    return policies
      .filter(p => PoliciesToPermissionsMapping.hasOwnProperty(p))
      .map(p => PoliciesToPermissionsMapping[p]);
  }

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private permissionsService: NgxPermissionsService,
    private router: Router,
  ) { }

  login(username: string, password: string): Observable<boolean> {
    const url = this.baseUrl + this.endpoints.login;
    const params = `login=${username}&password=${password}`;
    return this.http.post<{ result: { status: boolean, value: boolean } }>(url, params, this.options)
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
    const endpoint = this.baseUrl + this.endpoints.context;
    const params = { params: { session: this.getSession() } };

    return this.http.get(endpoint, params).pipe(
      map(response => response['actions']),
      map(AuthService.mapPoliciesToPermissions),
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
