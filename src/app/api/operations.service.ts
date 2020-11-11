import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { Token, TokenType } from './token';
import { TokenService } from './token.service';
import { LinOTPResponse } from './api';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    setpin: 'setpin',
    setMOTPPin: 'setmpin',
    delete: 'delete',
    enable: 'enable',
    disable: 'disable',
    reset: 'reset',
    resync: 'resync',
    setDescription: 'setdescription',
    unassign: 'unassign',
  };

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private tokenService: TokenService,
  ) { }

  deleteToken(serial: string): Observable<boolean> {
    const body = {
      serial: serial,
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'delete token': number }>>(this.userserviceBase + this.userserviceEndpoints.delete, body)
      .pipe(
        map((response) => response?.result?.value?.['delete token'] === 1),
        catchError(this.tokenService.handleError('deleteToken', false))
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
        map((response) => response?.result?.value?.['set userpin'] === 1),
        catchError(this.tokenService.handleError('setTokenPin', false))
      );
  }

  setMOTPPin(token: Token, pin: string): Observable<boolean> {
    if (token.typeDetails.type !== TokenType.MOTP) {
      return of(false);
    }

    const url = this.userserviceBase + this.userserviceEndpoints.setMOTPPin;
    const body = {
      pin: pin,
      serial: token.serial,
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'set userpin': number }>>(url, body)
      .pipe(
        map((response) => response?.result?.value?.['set userpin'] === 1),
        catchError(this.tokenService.handleError('setMOTPPin', false))
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
        map((response) => response?.result?.value?.['enable token'] === 1),
        catchError(this.tokenService.handleError('enable', false))
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
        map((response) => response?.result?.value?.['disable token'] === 1),
        catchError(this.tokenService.handleError('enable', false))
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
        map(response => response?.result?.value?.['reset Failcounter'] === 1),
        catchError(this.tokenService.handleError('reset failcounter', false))
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
        map(response => response?.result?.value?.['resync Token'] === true),
        catchError(this.tokenService.handleError('resync', false))
      );
  }

  setDescription(tokenSerial: string, description: string): Observable<boolean> {
    const bodyAssign = {
      serial: tokenSerial,
      description: description,
      session: this.sessionService.getSession()
    };
    const url = this.userserviceBase + this.userserviceEndpoints.setDescription;

    return this.http.post<LinOTPResponse<{ 'assign token': boolean }>>(url, bodyAssign)
      .pipe(
        map(response => {
          if (response?.result?.value['set description'] > 0) {
            return true;
          }
        }),
        catchError(this.tokenService.handleError('assign', false)
        )
      );
  }

  unassignToken(serial: string): Observable<boolean> {
    const body = {
      serial: serial,
      session: this.sessionService.getSession()
    };

    return this.http.post<LinOTPResponse<{ 'unassign token': boolean }>>(this.userserviceBase + this.userserviceEndpoints.unassign, body)
      .pipe(
        map(response => response?.result?.value?.['unassign token'] || false),
        catchError(this.tokenService.handleError('unassignToken', false))
      );
  }

}
