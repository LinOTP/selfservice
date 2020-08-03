import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { NgxPermissionsService } from 'ngx-permissions';

import { Observable, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';

import { SystemService, UserSystemInfo } from '../system.service';
import { Token, EnrollmentStatus } from '../api/token';
import { TokenService } from '../api/token.service';
import { SessionService } from '../auth/session.service';

export interface LoginOptions {
  username: string;
  password: string;
  realm?: string;
  otp?: string;
}

interface LoginResponse {
  needsSecondFactor: boolean;
  success: boolean;
  tokens?: Token[];
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl = `/userservice/`;
  private endpoints = {
    login: 'login',
    logout: 'logout',
    tokens: 'usertokenlist',
  };

  public _loginChangeEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private tokenService: TokenService,
    private systemService: SystemService,
    private permissionsService: NgxPermissionsService,
    private router: Router,
    private dialogRef: MatDialog,
  ) { }

  /**
 * Sends a login request to the backend and acts based on the response.
 *
 * If the username and password are correct, but a 2nd factor is required for a successful login
 * (i.e. mfa_login policy is set), we request a list of tokens for the user, then trigger a second
 * factor transaction for the first available token on the list.
 *
 * Should the user have no tokens for a second factor authentication, the backend does not send an
 * empty list. Instead, depending on whether the policy mfa_passOnNoToken was set, it either sends
 * a successful authentication message or a failed one.
 *
 * If the login was successful, the user's permissions are loaded before finishing the login.
 *
 * @param {LoginOptions} loginOptions An object containing username, password and realm, if applicable.
 * @returns {Observable<LoginResponse>} An object with the state of login success, and whether a second step is required.
 * @memberof AuthService
 */
  login(loginOptions: LoginOptions): Observable<LoginResponse> {
    const url = this.baseUrl + this.endpoints.login;
    const secondFactorMessage = 'credential verified - additional authentication parameter required';

    const params = {
      login: loginOptions.username,
      password: loginOptions.password,
      realm: loginOptions.realm,
      otp: loginOptions.otp,
    };

    if (params.realm === undefined) {
      delete params.realm;
    }
    if (params.otp === undefined) {
      delete params.otp;
    }

    interface FirstStepResponseType {
      detail: {
        message: string;
      };
      result: {
        status: boolean;
        value: boolean;
      };
    }

    return this.http.post<FirstStepResponseType>(url, params)
      .pipe(
        map(rsp => {
          return {
            needsSecondFactor: !!rsp && !!rsp.detail && !!rsp.detail.message && rsp.detail.message === secondFactorMessage,
            success: !!rsp && !!rsp.result && !!rsp.result.value && rsp.result.value === true
          };
        }),
        tap(loginState => this.handleLogin(loginState.success)),
        switchMap(loginState => loginState.needsSecondFactor ?
          this.getAvailableSecondFactors().pipe(
            map(tokens => {
              return { needsSecondFactor: true, success: false, tokens: tokens };
            })) :
          of(loginState)
        ),
        catchError(this.handleError('login', { needsSecondFactor: null, success: false })),
      );
  }

  /**
   * Returns the tokens available for second factor authentication
   *
   * @returns {Observable<Token[]>} list of tokens, or null if an error occurred.
   * @memberof AuthService
   */
  getAvailableSecondFactors(): Observable<Token[]> {
    return this.tokenService.getTokens().pipe(
      map(tokens => tokens.filter(t => t.enabled && t.enrollmentStatus === EnrollmentStatus.COMPLETED))
    );
  }

  /**
   * Inform the backend of the token that the user intends to use in the 2nd login step.
   *
   * @param {string} username identifies the user attempting 2nd factor authentication
   * @param {string} serial identifies the token to be used during authentication
   * @returns {boolean} true when the http request was successful, false otherwise
   */
  requestSecondFactorTransaction(username: string, serial: string): Observable<boolean> {
    const url = this.baseUrl + this.endpoints.login;
    const body = {
      serial: serial,
      data: `Selfservice+Login+Request User:+${username}`,
      content_type: 0,
      session: this.sessionService.getSession()
    };
    return this.http.post<{ result: { status: boolean } }>(url, body).pipe(
      map(res => res.result.status),
      catchError(this.handleError('requestSecondFactorTransaction', false))
    );
  }

  /**
   * Sent the OTP generated by the second factor token specified at the end of the first step.
   *
   * @param {string} otp OTP generated by the second factor and entered by the user.
   */
  loginSecondStep(otp: string): Observable<boolean> {
    const url = this.baseUrl + this.endpoints.login;
    const params = { otp: otp, session: this.sessionService.getSession() };

    return this.http.post<{ result: { status: boolean, value: boolean } }>(url, params)
      .pipe(
        map(response => response && response.result && response.result.value === true),
        tap(success => this.handleLogin(success))
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
   * requests the permissions for the currently logged in user.
   *
   * This is done by evaluating the selfservice context that provides the
   * policy actions. They get mapped to the frontend permissions and are loaded
   * into the NgxPermissionsService.
   *
   * @returns {Observable<Permission[]>}
   * @memberof AuthService
   */
  public refreshUserSystemInfo(): Observable<UserSystemInfo> {
    return this.systemService.getUserSystemInfo().pipe(
      tap(userSystemInfo => {
        localStorage.setItem('permissions', JSON.stringify(userSystemInfo.permissions));
        localStorage.setItem('realm', JSON.stringify(userSystemInfo.user.realm));
        localStorage.setItem('user', JSON.stringify(userSystemInfo.user));
        localStorage.setItem('imprint', JSON.stringify(userSystemInfo.imprint));
        localStorage.setItem('linotpVersion', JSON.stringify(userSystemInfo.version));
        localStorage.setItem('settings', JSON.stringify(userSystemInfo.settings));

        this.permissionsService.loadPermissions(userSystemInfo.permissions);
      }),
      catchError(this.handleError('loadPermissions', undefined)),
    );
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
      this.refreshUserSystemInfo().subscribe();
    }
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
    localStorage.clear();
    this.permissionsService.flushPermissions();

    this.dialogRef.closeAll();

    const navigationExtras: NavigationExtras = {};
    if (storeCurrentRoute) {
      navigationExtras.queryParams = { 'redirect': this.router.url };
    }
    this.router.navigate(['/login'], navigationExtras);

    this._loginChangeEmitter.emit(false);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

}
