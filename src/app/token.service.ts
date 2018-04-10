
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/interval';
import { catchError, tap } from 'rxjs/operators';

import { Token, EnrollToken, EnrollmentStatus } from './token';
import { AuthService } from './auth.service';

@Injectable()
export class TokenService {
  private baseUrl = `/userservice/`;
  private endpoints = {
    tokens: 'usertokenlist',
    setpin: 'setpin',
    delete: 'delete',
    enroll: 'enroll',
  };

  private validateCheck = '/validate/check'; // with whatever you want
  private validateCheckS = '/validate/check_s'; // with serial
  private validateCheckT = '/validate/check_t'; // with transaction

  private _tokentypes: { type: string, name: string, description: string }[] = [
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
    return this.http.get<any>(`${this.baseUrl + this.endpoints.tokens}`, { params: { session: this.authService.getSession() } })
      .map(this.mapTokenResponse)
      .pipe(
        tap(tokens => console.log(`tokens fetched`)),
        catchError(this.handleError('getTokens', []))
      );
  }

  getToken(serial: string): Observable<Token> {
    return this.getTokens()
      .map(
        tokens => tokens.find(t => t.serial === serial)
      );
  }

  deleteToken(serial: string): Observable<any> {
    const body = {
      serial: serial,
      session: this.authService.getSession()
    };

    return this.http.post<any>(this.baseUrl + this.endpoints.delete, body)
      .pipe(
        tap(response => console.log(`token ${serial} deleted`)),
        catchError(this.handleError('deleteToken', null))
      );
  }

  setPin(token: Token, pin: string): Observable<boolean> {
    const body = {
      userpin: pin,
      serial: token.serial,
      session: this.authService.getSession()
    };

    return this.http.post<{ result: { status: boolean, value: boolean } }>(this.baseUrl + this.endpoints.setpin, body)
      .map((response) => response && response.result && response.result.value['set userpin'] === 1)
      .pipe(
        tap(tokens => console.log(`pin set`)),
        catchError(this.handleError('setTokenPin', false))
      );
  }

  enroll(params: EnrollToken) {
    const body = { ...params, session: this.authService.getSession() };

    return this.http.post(this.baseUrl + this.endpoints.enroll, body)
      .pipe(
        tap(token => console.log(`token enrolled`)),
        catchError(this.handleError('enroll token', null))
      );
  }

  pairingPoll(serial: string): Observable<any> {
    return Observable.interval(3000)
      .mergeMap(val => this.getToken(serial))
      .filter(token => token.enrollmentStatus === EnrollmentStatus.pairing_response_received)
      .take(1);
  }

  activate(serial: string, pin: string): Observable<any> {
    const body = {
      serial: serial,
      data: 'BlaBlub',
      pass: pin,
    };
    return this.http.post(this.validateCheckS, body)
      .pipe(
        tap(token => console.log(`activation challenge created`)),
        catchError(this.handleError('activate token', null))
      );
  }

  getChallengeStatus(transactionId: string, pin: string): Observable<any> {
    const body = {
      transactionid: transactionId,
      pass: pin,
    };
    return this.http.post(this.validateCheckT, body)
      .pipe(
        tap(status => console.log(`challenge status is ${status}`)),
        catchError(this.handleError('get challenge status', null))
      );
  }

  challengePoll(transactionId: string, pin: string): Observable<any> {
    return Observable.interval(3000)
      .mergeMap(val => this.getChallengeStatus(transactionId, pin))
      .pipe(
        tap(res => console.log(res)),
    )
      .filter(response => false)
      .take(1);
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
  constructor(private ts: TokenService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Token[]> {
    return this.ts.getTokens().take(1);
  }
}

@Injectable()
export class TokenDetailResolver implements Resolve<Token> {
  constructor(private ts: TokenService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Token> {
    const serial = route.paramMap.get('serial');

    return this.ts.getToken(serial).take(1).map(token => {
      if (token) {
        return token;
      } else { // no token with such serial
        this.router.navigate(['/tokens']);
        return null;
      }
    });
  }
}
