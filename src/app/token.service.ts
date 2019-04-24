import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { Observable, of, interval } from 'rxjs';
import { map, filter, mergeMap, take, catchError, tap } from 'rxjs/operators';


import { Token, EnrollToken, EnrollmentStatus, TokenType } from './token';
import { AuthService } from './auth/auth.service';
import { NotificationService } from './core/notification.service';

@Injectable()
export class TokenService {
  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    tokens: 'usertokenlist',
    setpin: 'setpin',
    delete: 'delete',
    enroll: 'enroll',
  };

  private validateCheckS = '/validate/check_s'; // generate a challenge with a given serial
  private validateCheckStatus = '/validate/check_status'; // view challenge status

  private _tokentypes: TokenType[] = [
    {
      type: 'hmac',
      name: 'HOTP-Token',
      description: 'Event-based soft token (HOTP)'
    },
    {
      type: 'totp',
      name: 'TOTP-Token',
      description: 'Time-based soft token (TOTP)'
    },
    {
      type: 'push',
      name: 'Push-Token',
      description: 'KeyIdentity Push Token'
    },
  ];

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  private mapTokenResponse = (res: { result: { value: any[] } }) => {
    // TODO: Catch API Errors
    return res.result.value.map(token => {
      const t = new Token(
        token['LinOtp.TokenId'],
        token['LinOtp.TokenSerialnumber'],
        token['LinOtp.TokenType'],
        token['LinOtp.TokenDesc']
      );
      t.enrollmentStatus = token['Enrollment']['status'] === 'completed' ? 'completed' : token['Enrollment']['detail'];
      return t;
    });
  }

  getTokens(): Observable<Token[]> {
    const url = this.userserviceBase + this.userserviceEndpoints.tokens;
    return this.http.get<any>(url, { params: { session: this.authService.getSession() } }).pipe(
      map(this.mapTokenResponse))
      .pipe(
        tap(() => console.log(`tokens fetched`)),
        catchError(this.handleError('getTokens', []))
      );
  }

  getToken(serial: string): Observable<Token> {
    return this.getTokens().pipe(
      map(tokens => tokens.find(t => t.serial === serial)),
    );
  }

  deleteToken(serial: string): Observable<any> {
    const body = {
      serial: serial,
      session: this.authService.getSession()
    };

    return this.http.post<any>(this.userserviceBase + this.userserviceEndpoints.delete, body)
      .pipe(
        tap(() => console.log(`token ${serial} deleted`)),
        catchError(this.handleError('deleteToken', null))
      );
  }

  setPin(token: Token, pin: string): Observable<boolean> {
    const url = this.userserviceBase + this.userserviceEndpoints.setpin;
    const body = {
      userpin: pin,
      serial: token.serial,
      session: this.authService.getSession()
    };

    return this.http.post<{ result: { status: boolean, value: boolean } }>(url, body)
      .pipe(
        map((response) => response && response.result && response.result.value['set userpin'] === 1),
        tap(() => console.log(`pin set`)),
        catchError(this.handleError('setTokenPin', false))
      );
  }

  enroll(params: EnrollToken) {
    const body = { ...params, session: this.authService.getSession() };

    return this.http.post(this.userserviceBase + this.userserviceEndpoints.enroll, body)
      .pipe(
        tap(() => console.log(`token enrolled`)),
        catchError(this.handleError('enroll token', null))
      );
  }

  pairingPoll(serial: string): Observable<any> {
    return interval(2000).pipe(
      mergeMap(() => this.getToken(serial)),
      filter(token => token.enrollmentStatus === EnrollmentStatus.pairing_response_received),
      take(1));
  }

  activate(serial: string, pin: string): Observable<any> {
    const body = {
      serial: serial,
      data: 'BlaBlub',
      pass: pin,
    };
    return this.http.post(this.validateCheckS, body)
      .pipe(
        tap(() => console.log(`activation challenge created`)),
        catchError(this.handleError('activate token', null))
      );
  }

  getChallengeStatus(transactionId: string, pin: string, serial: string): Observable<any> {
    const body = {
      transactionid: transactionId,
      pass: pin,
      serial: serial,
    };
    return this.http.post(this.validateCheckStatus, body)
      .pipe(
        tap(() => console.log(`challenge status returned`)),
        catchError(this.handleError('get challenge status', null))
      );
  }

  challengePoll(transactionId: string, pin: string, serial: string): Observable<boolean> {
    return interval(2000).pipe(
      mergeMap(() => this.getChallengeStatus(transactionId, pin, serial)),
      filter(res => res.detail.transactions[transactionId].status !== 'open'),
      map(res => res.detail.transactions[transactionId].accept === true),
      catchError(() => of(false)),
      take(1),
    );
  }

  testToken(tokenSerial: String, pin: String, otp: String) {
    const body = { serial: tokenSerial, pass: `${pin}${otp}` };

    return this.http.post(this.validateCheckS, body)
      .pipe(
        tap(token => console.log(`token test submitted`)),
        catchError(this.handleError('test token', null))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

  get tokenTypes() {
    return this._tokentypes;
  }

}

@Injectable()
export class TokenListResolver implements Resolve<Token[]> {
  constructor(
    private ts: TokenService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Token[]> {
    return this.ts.getTokens().pipe(
      take(1),
    );
  }
}

@Injectable()
export class TokenDetailResolver implements Resolve<Token> {
  constructor(
    private ts: TokenService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Token> {
    const serial = route.paramMap.get('serial');

    return this.ts.getToken(serial).pipe(
      take(1),
      map(token => {
        if (token) {
          return token;
        } else { // no token with such serial
          this.notificationService.message('Token not found');
          this.router.navigate(['/tokens']);
          return null;
        }
      }),
    );
  }
}
