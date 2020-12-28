import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, filter, mergeMap, take, catchError } from 'rxjs/operators';
import { NgxPermissionsService } from 'ngx-permissions';

import { SystemService, UserSystemInfo } from '../system.service';
import { Token } from '../api/token';
import { SessionService } from '../auth/session.service';
import { LinOTPResponse } from '../api/api';
import { TokenService } from '../api/token.service';
import { ReplyMode, TransactionDetail, StatusDetail } from '../api/test.service';
import { exponentialBackoffInterval } from '../common/exponential-backoff-interval/exponential-backoff-interval';

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

  private _loginChange$: BehaviorSubject<UserSystemInfo['user']> = new BehaviorSubject(this.userInfo());
  private _permissionLoad$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private systemService: SystemService,
    private tokenService: TokenService,
    private router: Router,
    private dialogRef: MatDialog,
    private permissionsService: NgxPermissionsService,
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
   * @memberof LoginService
   */
  login(loginOptions: LoginOptions): Observable<LoginResult> {
    const url = this.baseUrl + this.endpoints.login;

    const params: LoginOptions & { session?: string } = { ...loginOptions };

    if (!('username' in loginOptions)) {
      // Do send session only for follow-up login requests after the initial credentials are verified.
      // This ensures that no old and unrelated session is evaluated for a brand-new login attempt.
      params.session = this.sessionService.getSession();
    }

    return this.http.post<LinOTPResponse<boolean, LoginResponse>>(url, params)
      .pipe(
        filter(response => !!response?.result),
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
    return exponentialBackoffInterval(2000, 90000, 2).pipe(
      mergeMap(() =>
        this.http.get<LinOTPResponse<boolean, StatusDetail>>(url, { params })
      ),
      filter(res => res?.detail?.status !== 'open'),
      take(1),
      map(res => res?.detail?.valid_tan || res?.detail?.accept),
      tap(success => this.handleLogin(success)),
      catchError(this.handleError<any>('MFA login status poll', {})),
    );
  }

  /**
   * sends a logout request to the backend and processes all frontend related tasks
   *
   * The user is redirected to the login page without storing the current route.
   *
   * @returns {Observable<any>}
   * @memberof LoginService
   */
  public logout(): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.endpoints.logout)
      .pipe(
        map(response => response?.result?.value === true),
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
   * @memberof LoginService
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

        this._loginChange$.next(userSystemInfo.user);

        this.loadStoredPermissions();
      }),
      catchError(this.handleError('loadPermissions', undefined)),
    );
  }

  public userInfo(): UserSystemInfo['user'] | undefined {
    return JSON.parse(localStorage.getItem('user')) || undefined;
  }

  /**
   * Getter for the login change observable, which issues events when the login
   * state changes.
   *
   * @readonly
   * @type {Observable<UserSystemInfo['user']>} observable of the login state
   * @memberof LoginService
   */
  get loginChange$(): Observable<UserSystemInfo['user']> {
    return this._loginChange$.asObservable();
  }

  /**
   * Getter for the load permission observable, which issues events when
   * permissions are loaded
   *
   * @readonly
   * @type {Observable<boolean>} observable of permission load event
   * @memberof LoginService
   */
  get permissionLoad$(): Observable<boolean> {
    return this._permissionLoad$.asObservable();
  }

  /**
   * bootstraps permissions stored in localStorage.
   *
   * @memberof LoginService
   */
  public loadStoredPermissions() {
    const permissions = JSON.parse(localStorage.getItem('permissions'));
    if (permissions) {
      this._permissionLoad$.next(true);
      this.permissionsService.loadPermissions(permissions);
    }
  }

  /**
   * removes all permissions currently loaded.
   *
   * @memberof LoginService
   */
  public clearPermissions() {
    this.permissionsService.flushPermissions();
    this._permissionLoad$.next(false);
  }

  /**
   * Emits the login state and, if the user was successfully logged in, reloads their permissions.
   * @param success true when the user was successfully logged in, false otherwise
   * @memberof LoginService
   */
  public handleLogin(success: boolean) {
    localStorage.setItem('loginIsComplete', JSON.stringify(true));
    if (success) {
      this.refreshUserSystemInfo().subscribe();
    } else {
      this._loginChange$.next(undefined);
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
   * @memberof LoginService
   */
  public handleLogout(storeRoute: boolean) {
    localStorage.clear();
    this.clearPermissions();

    this.dialogRef.closeAll();

    const navigationExtras: NavigationExtras = {};
    if (storeRoute) {
      const navigationRoute = this.router.getCurrentNavigation()?.finalUrl?.toString();
      const currentRoute = this.router.url;

      // redirect to navigation target if app is trying to go somewhere or else to current route
      navigationExtras.queryParams = { 'redirect': navigationRoute || currentRoute };
    }
    this.router.navigate(['/login'], navigationExtras);

    this._loginChange$.next(undefined);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

}
