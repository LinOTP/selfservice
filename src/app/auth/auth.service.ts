import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

  options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

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
        map((response) => response && response.result && response.result.value === true),
        tap(isLoggedin => {
          this._loginChangeEmitter.emit(isLoggedin);
          if (isLoggedin) {
            this.loadPermissions();
          }
        }),
        catchError(this.handleError('login', false)),
      );

  }

  /**
   * sends a logout request to the backend and processes all frontend related tasks
   *
   * loginChangeEmitter is updated, all persistent data cleared and the user is redirected to the login screen.
   *
   * @returns {Observable<any>}
   * @memberof AuthService
   */
  public logout(): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.endpoints.logout)
      .pipe(
        map(response => response && response.result && response.result.value === true),
        tap(result => {
          if (result) {
            this.permissionsService.flushPermissions();

            this.router.navigate(['/login']);

            this._loginChangeEmitter.emit(false);
          }
        }),
        catchError(this.handleError('logout', false))
      );
  }

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

  private loadPermissions() {
    const endpoint = this.baseUrl + this.endpoints.context;
    const params = { params: { session: this.getSession() } };

    this.http.get(endpoint, params).pipe(
      map(response => response['actions']),
      map(AuthService.mapPoliciesToPermissions),
      catchError(this.handleError('loadPermissions', [])),
    ).subscribe(
      permissions => this.permissionsService.loadPermissions(permissions)
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
