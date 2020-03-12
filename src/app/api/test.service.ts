import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { LinOTPResponse } from './token.service';

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
   * 1) If an OTP is sent, the return object contains a `result` key set to true or false, depending on whether the verification was
   *    successful or not.
   * 2) If no OTP is sent, the return object additionally contains a challenge, to be used in a subsequent authentication step.
   *
   * @param tokenSerial the serial of the token to be verified
   * @param otp the OTP for the verification transaction. Optional parameter.
   *
   * @returns an observable of a boolean, true if the verification was successful and false otherwise
   */
  testToken(tokenSerial: String, otp?: String): Observable<boolean> {
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }
}
