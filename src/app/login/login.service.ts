import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { NgxPermissionsService } from 'ngx-permissions';

import { Observable, of, interval } from 'rxjs';
import { map, tap, filter, mergeMap, take, catchError } from 'rxjs/operators';

import { SystemService, UserSystemInfo } from '../system.service';
import { Token } from '../api/token';
import { SessionService } from '../auth/session.service';
import { LinOTPResponse } from '../api/api';
import { TokenService } from '../api/token.service';
import { ReplyMode, TransactionDetail } from '../api/test.service';

export interface LoginOptions {
  username?: string;
  password?: string;
  realm?: string;
  otp?: string;
  serial?: string;
  transactionId?: string;
}

interface LoginResponse {
  tokenList?: Token[];
  transactionId?: string;
  transactionData?: string;
  message?: string;
  replyMode?: ReplyMode[];
}

interface LoginResult {
  success: boolean;
  tokens?: Token[];
  challengedata?: TransactionDetail;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl = `/userservice/`;
  private endpoints = {
    login: 'login',
    logout: 'logout',
  };

  public _loginChangeEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private systemService: SystemService,
    private tokenService: TokenService,
    private permissionsService: NgxPermissionsService,
    private router: Router,
    private dialogRef: MatDialog,
  ) { }

  /**
 * Sends a login request to the backend and returns the state of the login process.
 *
 * Authentication is triggered by submitting at least a username and a password. Optionally a realm
 * can also be sent. Should the policies mfa_login and mfa_3_fields be set, an OTP can also be sent
 * on the first request. The response will have value set to true if login was successful.
 *
 * When the policy mfa_login is set, and a second factor is required to login, a detail field is
 * returned with the next step. Either the user has only one token, or many, or none at all.
 *
 * In case there is only token, the next step is to provide the OTP for that token, and the detail
 * field contains the challenge data required to generate/provide the OTP.
 *
 * If there is more than one token available, we resend a login request with the serial of the
 * desired 2nd factor. The response will be the same as the case with one token.
 *
 * Should the user have no tokens for a second factor authentication, the backend does not send an
 * empty list. Instead, depending on whether the policy mfa_passOnNoToken was set, it either sends
 * a successful authentication message or a failed one.
 *
 * If the sent OTP was correct, the login is successful. Otherwise it fails and the login process
 * must be restarted from the first step.
 *
 * When the login is successful, the user's permissions are loaded before finishing the login.
 *
 * @param {LoginOptions} loginOptions An object containing username, password and realm, if applicable.
 * @returns {Observable<LoginResponse>} An object with the state of login success, and whether a second step is required.
 * @memberof AuthService
 */
  login(loginOptions: LoginOptions): Observable<LoginResult> {
    const url = this.baseUrl + this.endpoints.login;

    const session = this.sessionService.getSession();
    const params = session ? { ...loginOptions, session } : loginOptions;

    return this.http.post<LinOTPResponse<boolean, LoginResponse>>(url, params)
      .pipe(
        filter(response => !!response && !!response.result),
        map(response => {
          const details = response.detail;
          if (!details) {
            return { success: response.result.value };
          }

          if (details.tokenList) {
            return {
              success: false,
              tokens: details.tokenList.map(t => this.tokenService.mapBackendToken(t)),
            };
          }

          const challengedata = {
            transactionId: details.transactionId,
            transactionData: details.transactionData,
            message: details.message,
            replyMode: details.replyMode
          };

          return { success: false, challengedata };
        }),
        tap(loginState => this.handleLogin(loginState.success)),
        catchError(this.handleError('login', { success: false })),
      );
  }

  statusPoll(transactionId: string): Observable<boolean> {
    const url = this.baseUrl + this.endpoints.login;
    const params = {
      transactionid: transactionId,
      session: this.sessionService.getSession()
    };
    return interval(2000).pipe(
      mergeMap(() =>
        this.http.get<LinOTPResponse<boolean, { valid_tan: boolean, accept: boolean }>>(url, { params })
      ),
      map(res => res.result.value && res.detail && (res.detail.valid_tan || res.detail.accept)),
      filter(res => res),
      catchError(this.handleError<any>('MFA login status poll', {})),
      take(1),
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
