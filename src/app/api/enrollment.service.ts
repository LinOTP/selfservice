import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Observable, of, interval } from 'rxjs';
import { map, filter, mergeMap, take, catchError } from 'rxjs/operators';

import { EnrollToken, EnrollmentStatus } from './token';
import { LinOTPResponse, TokenService } from './token.service';
import { SessionService } from '../auth/session.service';

export interface PushEnrollmentDetail {
  lse_qr_url: {
    value: string;
  };
  serial: string;
}

interface ActivationDetail {
  transactionid: string;
  message: string;
}

interface ChallengeStatusDetail {
  transactions: {
    [transactionId: string]: {
      status: string;
    }
  };
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
export class EnrollmentService {
  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    enroll: 'enroll',
    webprovision: 'webprovision',
    assign: 'assign',
  };

  private validateCheckS = '/validate/check_s'; // generate a challenge with a given serial
  private validateCheckStatus = '/validate/check_status'; // view challenge status

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private i18n: I18n,
    private tokenService: TokenService,
  ) { }

  enrollOATH(token: EnrollToken): Observable<LinOTPResponse<OATHEnrollmentData>> {
    const body: { session: string, type: string, description?: string } = {
      ...token,
      session: this.sessionService.getSession(),
    };

    const details = this.tokenService.getTypeDetails(token.type);
    const enrollEndpoint = this.userserviceBase + this.userserviceEndpoints.webprovision;

    if (details.enrollmentType) {
      body.type = details.enrollmentType;
    }

    return this.http.post<LinOTPResponse<OATHEnrollmentData>>(enrollEndpoint, body)
      .pipe(
        catchError(this.handleError('enroll token', null))
      );
  }

  enroll<T>(token: EnrollToken): Observable<LinOTPResponse<boolean, T>> {
    const body: { session: string, type: string, description?: string } = {
      ...token,
      session: this.sessionService.getSession(),
    };

    const details = this.tokenService.getTypeDetails(token.type);
    const enrollEndpoint = this.userserviceBase + this.userserviceEndpoints.enroll;

    if (details.enrollmentType) {
      body.type = details.enrollmentType;
    }

    return this.http.post<LinOTPResponse<boolean, T>>(enrollEndpoint, body)
      .pipe(
        catchError(this.handleError('enroll token', null))
      );
  }

  pairingPoll(serial: string): Observable<any> {
    return interval(2000).pipe(
      mergeMap(() => this.tokenService.getToken(serial)),
      filter(token => token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED),
      take(1));
  }

  activate(serial: string, pin: string): Observable<LinOTPResponse<boolean, ActivationDetail>> {
    const body = {
      serial: serial,
      data: serial,
      pass: pin,
    };
    return this.http.post<LinOTPResponse<boolean, ActivationDetail>>(this.validateCheckS, body)
      .pipe(
        catchError(this.handleError('activate token', null))
      );
  }

  getChallengeStatus(transactionId: string, pin: string, serial: string): Observable<LinOTPResponse<boolean, ChallengeStatusDetail>> {
    const body = {
      transactionid: transactionId,
      pass: pin,
      serial: serial,
    };
    return this.http.post<LinOTPResponse<boolean, ChallengeStatusDetail>>(this.validateCheckStatus, body)
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


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }
}
