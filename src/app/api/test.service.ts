import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Observable, of, interval } from 'rxjs';
import { map, catchError, filter, mergeMap, take } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { LinOTPResponse } from './api';

export enum ReplyMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export interface TransactionDetail {
  reply_mode: ReplyMode[];
  transactionid?: string;
  transactiondata?: string; // content of QR code
  message?: string;        // user facing message
}

export interface StatusDetail {
  'received_count': number;
  'received_tan': boolean;
  'valid_tan': boolean;
  'message': string;
  'status': string;
  'accept': boolean;
  'reject': boolean;
}

export interface TestOptions {
  serial: String;
  otp?: String;
  transactionid?: String;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    verify: 'verify',
  };

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private i18n: I18n,
  ) { }

  /**
   * Sends a verification request for a token. There are two usage scenarios:
   * 1) If an OTP is sent, the return object contains a `value` key set to true or false, depending on whether the verification was
   *    successful or not.
   * 2) If no OTP is sent, the value is false and the return object additionally contains information on how to proceed with the
   *    authentication.
   *
   * @param tokenSerial the serial of the token to be verified
   * @param otp the OTP for the verification transaction. Optional parameter.
   *
   * @returns If the backend does not require further verification steps, this method returns an observable of a boolean, true if the
   *          verification was successful, otherwise false.
   *          Alernatively, it will instead return a TransactionDetail observable if further verification steps are required.
   */
  testToken(options: TestOptions): Observable<boolean | TransactionDetail> {
    const url = this.userserviceBase + this.userserviceEndpoints.verify;
    const body: TestOptions & { session: string } = {
      session: this.sessionService.getSession(),
      serial: options.serial,
    };

    if (options.otp) {
      body.otp = options.otp;
    }

    if (options.transactionid) {
      body.transactionid = options.transactionid;
    }

    return this.http.post<LinOTPResponse<boolean, TransactionDetail>>(url, body)
      .pipe(
        filter(response => !!response),
        map(response => {
          if (!response.result || !response.result.status) {
            throw new Error('Failure during token test.');
          }
          return response.detail ? response.detail : response.result.value;
        }),
        catchError(this.handleError('test token', null))
      );
  }

  statusPoll(transactionId: string): Observable<StatusDetail> {
    const url = this.userserviceBase + this.userserviceEndpoints.verify;
    const params = {
      transactionid: transactionId,
      session: this.sessionService.getSession()
    };
    return interval(2000).pipe(
      mergeMap(() =>
        this.http.get<LinOTPResponse<boolean, StatusDetail>>(url, { params })),
      filter(res => res.detail.status !== 'open'),
      map(res => res.detail),
      catchError(this.handleError<any>('test token status poll', {})),
      take(1),
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
