import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, filter, mergeMap, take, catchError, tap } from 'rxjs/operators';

import { EnrollToken, EnrollmentStatus } from './token';
import { TokenService } from './token.service';
import { SessionService } from '../auth/session.service';
import { UserInfo } from '../system.service';
import { LinOTPResponse, APIError } from './api';
import { NotificationService } from '../common/notification.service';
import { exponentialBackoffInterval } from '../common/exponential-backoff-interval/exponential-backoff-interval';

export interface EnrollmentDetail {
  serial: string;
  lse_qr_url?: {
    value: string;
  };
  otpkey?: { value: string };
  googleurl?: { value: string };
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


@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    enroll: 'enroll',
    assign: 'assign',
  };

  private validateCheck = '/validate/check'; // generate a challenge with a given serial
  private validateCheckStatus = '/validate/check_status'; // view challenge status

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) { }

  enroll(token: EnrollToken): Observable<EnrollmentDetail> {
    const body: { session: string, type: string, description?: string, otplen?: number, 'yubico.tokenid'?: string } = {
      ...token,
      session: this.sessionService.getSession(),
    };

    const details = this.tokenService.getTypeDetails(token.type);
    const enrollEndpoint = this.userserviceBase + this.userserviceEndpoints.enroll;

    if (details.enrollmentType) {
      body.type = details.enrollmentType;
    }

    return this.http.post<LinOTPResponse<boolean, EnrollmentDetail>>(enrollEndpoint, body)
      .pipe(
        tap(response => {
          if (!response?.result?.status
            || !response?.result?.value
            || !response?.detail) {
            throw new APIError(response);
          }
        }),
        map(response => response?.detail),
        catchError(this.handleError($localize`Token registration`, null))
      );
  }

  pairingPoll(serial: string): Observable<any> {
    return exponentialBackoffInterval(2000, 90000, 2).pipe(
      mergeMap(() => this.tokenService.getToken(serial)),
      filter(token => token.enrollmentStatus === EnrollmentStatus.PAIRING_RESPONSE_RECEIVED),
      take(1));
  }

  activate(serial: string, pin: string): Observable<LinOTPResponse<boolean, ActivationDetail>> {
    const userInfo: UserInfo = JSON.parse(localStorage.getItem('user'));
    const body = {
      serial: serial,
      data: serial,
      pass: pin,
      user: userInfo.username,
    };
    return this.http.post<LinOTPResponse<boolean, ActivationDetail>>(this.validateCheck, body)
      .pipe(
        tap(response => {
          if (!response.result.status) {
            throw new APIError(response);
          }
        }),
        catchError(this.handleError($localize`Token activation`, null))
      );
  }

  getChallengeStatus(transactionId: string, pin: string, serial: string): Observable<LinOTPResponse<boolean, ChallengeStatusDetail>> {
    const userInfo: UserInfo = JSON.parse(localStorage.getItem('user'));
    const body = {
      transactionid: transactionId,
      pass: pin,
      user: userInfo.username,
    };
    return this.http.post<LinOTPResponse<boolean, ChallengeStatusDetail>>(this.validateCheckStatus, body)
      .pipe(
        catchError(this.handleError($localize`Challenge status request`, null))
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
    return exponentialBackoffInterval(2000, 90000, 2).pipe(
      mergeMap(() => this.getChallengeStatus(transactionId, pin, serial)),
      filter(res => res.detail.transactions[transactionId].status !== 'open'),
      map(res => res.detail.transactions[transactionId]),
      catchError(() => of({})),
      take(1),
    );
  }

  assign(tokenSerial: string, description: string): Observable<{ success: boolean, message?: string }> {
    const tryAgainMessage = $localize`Please try again or contact an administrator.`;
    const bodyAssign = {
      serial: tokenSerial,
      description: description,
      session: this.sessionService.getSession()
    };
    const url = this.userserviceBase + this.userserviceEndpoints.assign;

    return this.http.post<LinOTPResponse<{ 'assign token': boolean }>>(url, bodyAssign)
      .pipe(
        map(response => {
          if (response?.result?.value) {
            return { success: response.result.value['assign token'] === true };
          } else if (response?.result?.error?.message) {
            let message = '';
            switch (response.result.error.message) {
              case 'The token is already assigned to another user.':
              case 'Der Token ist bereits einem anderen Benutzer zugewiesen.':
                message = $localize`The token is already assigned to you or to another user. Please contact an administrator.`;
                break;
              case 'The token you want to assign is  not contained in your realm!':
                message = $localize`The token you want to assign is not valid (wrong realm). Please contact an administrator.`;
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

  private handleError<T>(operation = $localize`An API request`, result?: T) {
    return (error: any): Observable<T> => {
      const defaultMessage = $localize`${operation} failed: Please try again.`;
      const errorMessages = {
        411: $localize`${operation} failed: You have reached the maximum number of tokens for your account.`,
        412: $localize`${operation} failed: You have reached the maximum number of tokens of this type.`,
        413: $localize`${operation} failed: You can not register a new token because your realm has reached the maximum token capacity.`,
      };

      this.notificationService.message(errorMessages[error?.response?.result?.error?.code] || defaultMessage);

      return of(result as T);
    };
  }
}
