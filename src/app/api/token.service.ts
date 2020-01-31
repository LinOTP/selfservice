import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, interval } from 'rxjs';
import { map, filter, mergeMap, take, catchError } from 'rxjs/operators';

import { Token, EnrollToken, EnrollmentStatus, TokenType, TokenTypeDetails } from './token';
import { SessionService } from '../auth/session.service';
import { Permission } from '../common/permissions';
import { I18n } from '@ngx-translate/i18n-polyfill';


interface LinOTPResponse<T> {
  result?: {
    status: boolean,
    value: T,
    error?: {
      message: string,
    };
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

@Injectable({
  providedIn: 'root'
})
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
    reset: 'reset',
    resync: 'resync',
    assign: 'assign',
    setDescription: 'setdescription',
    verify: 'verify',
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
        enrollmentActionLabel: this.i18n('Enroll'),
      },
      {
        type: TokenType.HOTP,
        name: this.i18n('soft token (event)'),
        description: this.i18n('Event-based soft token (HOTP)'),
        icon: 'cached',
        enrollmentPermission: Permission.ENROLLHOTP,
        enrollmentType: 'googleauthenticator',
        enrollmentActionLabel: this.i18n('Enroll'),
      },
      {
        type: TokenType.TOTP,
        name: this.i18n('soft token (time)'),
        description: this.i18n('Time-based soft token (TOTP)'),
        icon: 'timelapse',
        enrollmentPermission: Permission.ENROLLTOTP,
        enrollmentType: 'googleauthenticator_time',
        enrollmentActionLabel: this.i18n('Enroll'),
      },
      {
        type: TokenType.PUSH,
        name: this.i18n('Push-Token'),
        description: this.i18n('Confirm authentication requests on your Smartphone with the Authenticator app'),
        icon: 'screen_lock_portrait',
        enrollmentPermission: Permission.ENROLLPUSH,
        activationPermission: Permission.ACTIVATEPUSH,
        enrollmentActionLabel: this.i18n('Enroll'),
      },
      {
        type: TokenType.QR,
        name: this.i18n('QR-Token'),
        description: this.i18n('Use the Authenticator app to scan QR code authentication requests'),
        icon: 'all_out',
        // enrollmentPermission: Permission.ENROLLQR,
        activationPermission: Permission.ACTIVATEQR,
        enrollmentActionLabel: this.i18n('Enroll'),
      },
      {
        type: TokenType.ASSIGN,
        name: this.i18n('Assign Token'),
        description: this.i18n('Claim an existing token and link it to your user account'),
        icon: 'link',
        enrollmentPermission: Permission.ASSIGN,
        enrollmentActionLabel: this.i18n('Assign'),
      }
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

  /**
   * Sends a verification request for an OTP-based token.
   *
   * @param tokenSerial the serial of the token to be verified
   * @param otp the OTP for the verification transaction
   *
   * @returns an observable of a boolean, true if the verification was successful and false otherwise
   */
  testToken(tokenSerial: String, otp: String): Observable<boolean> {
    const url = this.userserviceBase + this.userserviceEndpoints.verify;
    const body = {
      session: this.sessionService.getSession(),
      serial: tokenSerial,
      otp: otp,
    };

    return this.http.post<LinOTPResponse<boolean>>(url, body)
      .pipe(
        map(response => response && response.result && response.result.value === true),
        catchError(this.handleError('test token', null))
      );
  }

  resetFailcounter(tokenSerial: String): Observable<boolean> {
    const body = {
      serial: tokenSerial,
      session: this.sessionService.getSession()
    };
    const url = this.userserviceBase + this.userserviceEndpoints.reset;

    return this.http.post<LinOTPResponse<{ 'reset Failcounter': number }>>(url, body)
      .pipe(
        map(response => response && response.result && response.result.value && response.result.value['reset Failcounter'] === 1),
        catchError(this.handleError('reset failcounter', false))
      );
  }

  resync(tokenSerial: String, OTP1: string, OTP2: string): Observable<boolean> {
    const body = {
      serial: tokenSerial,
      otp1: OTP1,
      otp2: OTP2,
      session: this.sessionService.getSession()
    };
    const url = this.userserviceBase + this.userserviceEndpoints.resync;

    return this.http.post<LinOTPResponse<{ 'resync Token': boolean }>>(url, body)
      .pipe(
        map(response => response && response.result && response.result.value && response.result.value['resync Token'] === true),
        catchError(this.handleError('resync', false))
      );
  }

  assign(tokenSerial: string): Observable<{ success: boolean, message?: string }> {
    const tryAgainMessage = this.i18n('Please try again or contact an administrator.');
    const bodyAssign = {
      serial: tokenSerial,
      session: this.sessionService.getSession()
    };
    const url = this.userserviceBase + this.userserviceEndpoints.assign;

    return this.http.post<LinOTPResponse<{ 'assign token': boolean }>>(url, bodyAssign)
      .pipe(
        map(response => {
          if (response && response.result && response.result.value) {
            return { success: response.result.value['assign token'] === true };
          } else if (response && response.result.error && response.result.error.message) {
            let message = '';
            switch (response.result.error.message) {
              case 'The token is already assigned to another user.':
              case 'Der Token ist bereits einem anderen Benutzer zugewiesen.':
                message = this.i18n('The token is already assigned to you or to another user. Please contact an administrator.');
                break;
              case 'The token you want to assign is  not contained in your realm!':
                message = this.i18n('The token you want to assign is not valid (wrong realm). Please contact an administrator.');
                break;
              default:
                message = tryAgainMessage;
            }
            return { success: false, message: message };
          } else {
            return { success: false, message: tryAgainMessage };
          }
        }),
        catchError(this.handleError('assign', { success: false })
        )
      );
  }

  setDescription(tokenSerial: string, description: string): Observable<{ success: boolean, message?: string }> {
    const bodyAssign = {
      serial: tokenSerial,
      description: description,
      session: this.sessionService.getSession()
    };
    const url = this.userserviceBase + this.userserviceEndpoints.setDescription;

    return this.http.post<LinOTPResponse<{ 'assign token': boolean }>>(url, bodyAssign)
      .pipe(
        map(response => {
          if (response && response.result && response.result.value) {
            return { success: response.result.value['set description'] > 0 };
          }
        }),
        catchError(this.handleError('assign', { success: false })
        )
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
