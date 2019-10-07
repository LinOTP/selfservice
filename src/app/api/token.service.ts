import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, interval } from 'rxjs';
import { map, filter, mergeMap, take, catchError, tap } from 'rxjs/operators';

import { Token, EnrollToken, EnrollmentStatus, TokenType, TokenTypeDetails } from './token';
import { SessionService } from '../auth/session.service';
import { Permission } from '../common/permissions';
import { I18n } from '@ngx-translate/i18n-polyfill';


interface LinOTPResponse<T> {
  result: {
    status: boolean,
    value: T,
  };
  detail?: any;
}

interface OATHEnrollmentData {
  init: boolean;
  setpin: boolean;
  oathtoken: {
    digits: number,
    img: string,
    url: string,
    counter: number,
    label: string,
    key: string,
    serial: string,
  };
}

@Injectable()
export class TokenService {
  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    tokens: 'usertokenlist',
    setpin: 'setpin',
    delete: 'delete',
    enroll: 'enroll',
    webprovision: 'webprovision',
    enable: 'enable',
    disable: 'disable',
  };

  private validateCheckS = '/validate/check_s'; // generate a challenge with a given serial
  private validateCheckStatus = '/validate/check_status'; // view challenge status

  get tokenTypeDetails(): TokenTypeDetails[] {
    return [
      {
        type: TokenType.PASSWORD,
        name: this.i18n('password token'),
        description: this.i18n('Personal text-based secret'),
        icon: 'keyboard',
        // enrollmentPermission: Permission.ENROLLPASSWORD,
      },
      {
        type: TokenType.HOTP,
        name: this.i18n('soft token (event)'),
        description: this.i18n('Event-based soft token (HOTP)'),
        icon: 'cached',
        enrollmentPermission: Permission.ENROLLHOTP,
        enrollmentType: 'googleauthenticator',
      },
      {
        type: TokenType.TOTP,
        name: this.i18n('soft token (time)'),
        description: this.i18n('Time-based soft token (TOTP)'),
        icon: 'timelapse',
        enrollmentPermission: Permission.ENROLLTOTP,
        enrollmentType: 'googleauthenticator_time',
      },
      {
        type: TokenType.PUSH,
        name: this.i18n('Push-Token'),
        description: this.i18n('Confirm authentication requests on your Smartphone with the Authenticator app'),
        icon: 'screen_lock_portrait',
        enrollmentPermission: Permission.ENROLLPUSH,
        activationPermission: Permission.ACTIVATEPUSH,
      },
      {
        type: TokenType.QR,
        name: this.i18n('QR-Token'),
        description: this.i18n('Use the Authenticator app to scan QR code authentication requests'),
        icon: 'all_out',
        // enrollmentPermission: Permission.ENROLLQR,
        activationPermission: Permission.ACTIVATEQR,
      },
    ];
  }

  private get unknownTokenType(): TokenTypeDetails {
    return {
      type: TokenType.UNKNOWN,
      name: this.i18n('Unknown Token'),
      description: this.i18n('Unsupported token type'),
      icon: 'apps',
    };
  }

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private i18n: I18n,
  ) { }

  private mapTokenResponse = (res: LinOTPResponse<any[]>) => {
    // TODO: Catch API Errors
    return res.result.value.map(token => {
      const t = new Token(
        token['LinOtp.TokenId'],
        token['LinOtp.TokenSerialnumber'],
        this.getTypeDetails(token['LinOtp.TokenType']),
        token['LinOtp.Isactive'],
        token['LinOtp.TokenDesc']
      );
      t.enrollmentStatus = token['Enrollment']['status'] === 'completed' ? 'completed' : token['Enrollment']['detail'];
      return t;
    });
  }

  public getTypeDetails(type: TokenType): TokenTypeDetails {
    return this.tokenTypeDetails.find(td => td.type === type.toLowerCase()) || this.unknownTokenType;
  }

  getTokens(): Observable<Token[]> {
    const url = this.userserviceBase + this.userserviceEndpoints.tokens;
    return this.http.get<LinOTPResponse<any[]>>(url, { params: { session: this.sessionService.getSession() } }).pipe(
      map(this.mapTokenResponse))
      .pipe(
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
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'delete token': number }>>(this.userserviceBase + this.userserviceEndpoints.delete, body)
      .pipe(
        catchError(this.handleError('deleteToken', null))
      );
  }

  setPin(token: Token, pin: string): Observable<boolean> {
    const url = this.userserviceBase + this.userserviceEndpoints.setpin;
    const body = {
      userpin: pin,
      serial: token.serial,
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'set userpin': number }>>(url, body)
      .pipe(
        map((response) => response && response.result && response.result.value['set userpin'] === 1),
        catchError(this.handleError('setTokenPin', false))
      );
  }

  enable(token: Token): Observable<boolean> {
    const url = this.userserviceBase + this.userserviceEndpoints.enable;
    const body = {
      serial: token.serial,
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'enable token': number }>>(url, body)
      .pipe(
        map((response) => response && response.result && response.result.value['enable token'] === 1),
        catchError(this.handleError('enable', false))
      );
  }

  disable(token: Token): Observable<boolean> {
    const url = this.userserviceBase + this.userserviceEndpoints.disable;
    const body = {
      serial: token.serial,
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'disable token': number }>>(url, body)
      .pipe(
        map((response) => response && response.result && response.result.value['disable token'] === 1),
        catchError(this.handleError('enable', false))
      );
  }

  enrollOATH(token: EnrollToken): Observable<LinOTPResponse<OATHEnrollmentData>> {
    const body: { session: string, type: string, description?: string } = {
      ...token,
      session: this.sessionService.getSession(),
    };

    const details = this.getTypeDetails(token.type);
    const enrollEndpoint = this.userserviceBase + this.userserviceEndpoints.webprovision;

    if (details.enrollmentType) {
      body.type = details.enrollmentType;
    }

    return this.http.post<LinOTPResponse<OATHEnrollmentData>>(enrollEndpoint, body)
      .pipe(
        catchError(this.handleError('enroll token', null))
      );
  }

  enroll(token: EnrollToken): Observable<LinOTPResponse<boolean>> {
    const body: { session: string, type: string, description?: string } = {
      ...token,
      session: this.sessionService.getSession(),
    };

    const details = this.getTypeDetails(token.type);
    const enrollEndpoint = this.userserviceBase + this.userserviceEndpoints.enroll;

    if (details.enrollmentType) {
      body.type = details.enrollmentType;
    }

    return this.http.post<LinOTPResponse<boolean>>(enrollEndpoint, body)
      .pipe(
        catchError(this.handleError('enroll token', null))
      );
  }

  pairingPoll(serial: string): Observable<any> {
    return interval(2000).pipe(
      mergeMap(() => this.getToken(serial)),
      filter(token => token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED),
      take(1));
  }

  activate(serial: string, pin: string): Observable<any> {
    const body = {
      serial: serial,
      data: serial,
      pass: pin,
    };
    return this.http.post(this.validateCheckS, body)
      .pipe(
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
        catchError(this.handleError('get challenge status', null))
      );
  }

  /**
   * Polls the backend for the state of a transaction secured by a given token and its pin.
   *
   * @param transactionId transaction identifier
   * @param pin token pin
   * @param serial token serial
   *
   * @returns a string-to-boolean mapping, representing whether the transaction was accepted or rejected in case of the Push token,
   *          or whether the TAN was valid, in case of a QR token.
   */
  challengePoll(transactionId: string, pin: string, serial: string):
    Observable<{ accept?: boolean, reject?: boolean, valid_tan?: boolean }> {
    return interval(2000).pipe(
      mergeMap(() => this.getChallengeStatus(transactionId, pin, serial)),
      filter(res => res.detail.transactions[transactionId].status !== 'open'),
      map(res => res.detail.transactions[transactionId]),
      catchError(() => of({})),
      take(1),
    );
  }

  testToken(tokenSerial: String, pin: String = '', otp: String): Observable<boolean> {
    const body = { serial: tokenSerial, pass: `${pin}${otp}` };

    return this.http.post<LinOTPResponse<boolean>>(this.validateCheckS, body)
      .pipe(
        map(response => response && response.result && response.result.value === true),
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
}
