import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    private permissionsService: NgxPermissionsService) {
  }

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

  logout() {
    return this.http.get<any>(this.baseUrl + this.endpoints.logout)
      .pipe(
        catchError(this.handleError('logout', false))
      );
  }

  private policiesToPermissions(policies: string[]): Permission[] {
    const permissions = [];

    policies.forEach(p => {
      if (PoliciesToPermissionsMapping.hasOwnProperty(p)) {
        permissions.push(PoliciesToPermissionsMapping[p]);
      }
    });

    return permissions;
  }

  private loadPermissions() {
    const endpoint = this.baseUrl + this.endpoints.context;
    const params = { params: { session: this.getSession() } };

    this.http.get(endpoint, params).pipe(
      map(response => response['actions']),
      map(this.policiesToPermissions),
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
