import { Injectable, EventEmitter } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { SessionService } from '../auth/session.service';
import { SystemService } from '../system.service';
import { Observable, of } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, tap, switchMap, catchError } from 'rxjs/operators';

export interface LoginOptions {
  username: string;
  password: string;
  realm?: string;
}

interface LoginResponse {
  needsSecondFactor: boolean;
  success: boolean;
  hasTokens?: boolean;
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

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
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
      realm: loginOptions.realm
    };

    if (params.realm === undefined) {
      delete params.realm;
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
        tap(loginState => this.sessionService.handleLogin(loginState.success)),
        switchMap(loginState => loginState.needsSecondFactor ?
          this.getSecondFactorSerial().pipe(
            switchMap(serial => serial === '' ?
              of({ needsSecondFactor: true, success: false, hasTokens: false }) :
              this.requestSecondFactorTransaction(loginOptions.username, serial).pipe(
                map(() => {
                  return { needsSecondFactor: true, success: false, hasTokens: true };
                })
              )
            )
          ) :
          of(loginState)
        ),
        catchError(this.handleError('login', { needsSecondFactor: null, success: false })),
      );
  }

  /**
   * Returns the serial of the token to be used for second factor authentication
   *
   * @returns {Observable<string>} token serial, empty string if no tokens available and null if an error occurred.
   * @memberof AuthService
   */
  private getSecondFactorSerial(): Observable<string> {
    const url = this.baseUrl + this.endpoints.tokens;
    const body = { active: 'true', session: this.sessionService.getSession() };
    interface SecondStepResponseType {
      result: {
        status: boolean;
        value: {
          'LinOtp.TokenSerialnumber': string;
        }[];
      };
    }
    return this.http.post<SecondStepResponseType>(url, body)
      .pipe(
        switchMap(response => response.result.value.length > 0 ?
          of(response.result.value[0]['LinOtp.TokenSerialnumber']) :
          of('')
        ),
        catchError(this.handleError('getAvailableSecondFactors', null)),
      );
  }

  /**
   * Inform the backend of the token that the user intends to use in the 2nd login step.
   *
   * @param {string} username identifies the user attempting 2nd factor authentication
   * @param {string} serial identifies the token to be used during authentication
   */
  private requestSecondFactorTransaction(username: string, serial: string): Observable<any> {
    const url = this.baseUrl + this.endpoints.login;
    const body = {
      serial: serial,
      data: `Selfservice+Login+Request User:+${username}`,
      content_type: 0,
      session: this.sessionService.getSession()
    };
    return this.http.post(url, body).pipe(
      catchError(this.handleError('requestSecondFactorTransaction', null))
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
        tap(success => this.sessionService.handleLogin(success))
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
            this.sessionService.handleLogout(false);
          }
        }),
        catchError(this.handleError('logout', false))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

}
