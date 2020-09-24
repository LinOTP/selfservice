import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { Permission } from '../common/permissions';
import { Token, TokenType, TokenTypeDetails } from './token';
import { LinOTPResponse } from './api';


@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    tokens: 'usertokenlist',
    serialByOTP: 'getSerialByOtp',
  };

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) { }

  getTokens(): Observable<Token[]> {
    const url = this.userserviceBase + this.userserviceEndpoints.tokens;
    return this.http.get<LinOTPResponse<any[]>>(url, { params: { session: this.sessionService.getSession() } }).pipe(
      map(res => res.result.value.map(t => this.mapBackendToken(t))),
      catchError(this.handleError('getTokens', []))
    );
  }

  getToken(serial: string): Observable<Token> {
    return this.getTokens().pipe(
      map(tokens => tokens.find(t => t.serial === serial)),
    );
  }

  mapBackendToken(token: any): Token {
    const t = new Token(
      token['LinOtp.TokenId'],
      token['LinOtp.TokenSerialnumber'],
      this.getTypeDetails(token['LinOtp.TokenType']),
      token['LinOtp.Isactive'],
      token['LinOtp.TokenDesc']
    );
    t.enrollmentStatus = token['Enrollment']['status'] === 'completed' ? 'completed' : token['Enrollment']['detail'];
    return t;
  }


  get tokenTypeDetails(): TokenTypeDetails[] {
    return [{
      type: TokenType.PASSWORD,
      name: $localize`password token`,
      description: $localize`Personal text-based secret`,
      icon: 'keyboard',
      enrollmentPermission: Permission.ENROLLPASSWORD,
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Enter the token password`,
    },
    {
      type: TokenType.HOTP,
      name: $localize`soft token (event)`,
      description: $localize`Event-based soft token (HOTP)`,
      icon: 'cached',
      enrollmentPermission: Permission.ENROLLHOTP,
      enrollmentType: 'googleauthenticator',
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Enter OTP from event-based soft token`,
    },
    {
      type: TokenType.TOTP,
      name: $localize`soft token (time)`,
      description: $localize`Time-based soft token (TOTP)`,
      icon: 'timelapse',
      enrollmentPermission: Permission.ENROLLTOTP,
      enrollmentType: 'googleauthenticator_time',
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Enter OTP from time-based soft token`,
    },
    {
      type: TokenType.PUSH,
      name: $localize`Push-Token`,
      description: $localize`Confirm authentication requests on your smartphone with the Authenticator app`,
      icon: 'screen_lock_portrait',
      enrollmentPermission: Permission.ENROLLPUSH,
      activationPermission: Permission.ACTIVATEPUSH,
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Confirm the authentication using your smartphone`,
    },
    {
      type: TokenType.QR,
      name: $localize`QR-Token`,
      description: $localize`Use the Authenticator app to scan QR code authentication requests`,
      icon: 'qr_code',
      enrollmentPermission: Permission.ENROLLQR,
      activationPermission: Permission.ACTIVATEQR,
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Confirm the authentication by scanning a QR code`,
    },
    {
      type: TokenType.MOTP,
      name: $localize`mOTP token`,
      description: $localize`Generate OTPs from your mobile device given a secret password and a custom pin`,
      icon: 'stay_current_portrait',
      enrollmentPermission: Permission.ENROLLMOTP,
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Enter OTP from mOTP token`,
    },
    {
      type: TokenType.SMS,
      name: $localize`SMS token`,
      description: $localize`Receive an OTP via SMS`,
      icon: 'textsms',
      enrollmentPermission: Permission.ENROLLSMS,
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Enter OTP delivered via SMS`,
    },
    {
      type: TokenType.EMAIL,
      name: $localize`email token`,
      description: $localize`Receive an OTP via email`,
      icon: 'email',
      enrollmentPermission: Permission.ENROLLEMAIL,
      enrollmentActionLabel: $localize`Create`,
      authenticationPrompt: $localize`Enter OTP delivered via email`,
    },
    {
      type: TokenType.YUBICO,
      name: $localize`YubiCloud token`,
      description: $localize`Register your Yubikey to authenticate against the YubiCloud.`,
      icon: 'vpn_key', // TODO: we might want to use an official logo here
      enrollmentPermission: Permission.ENROLLYUBICO,
      enrollmentActionLabel: $localize`Register`,
      authenticationPrompt: $localize`Authenticate using your Yubikey token (YubiCloud)`,
    },
    {
      type: TokenType.ASSIGN,
      name: $localize`Assign token`,
      description: $localize`Claim an existing token and link it to your user account`,
      icon: 'link',
      enrollmentPermission: Permission.ASSIGN,
      enrollmentActionLabel: $localize`Assign`,
    }];
  }

  get unknownTokenType(): TokenTypeDetails {
    return {
      type: TokenType.UNKNOWN,
      name: $localize`Unknown Token`,
      description: $localize`Unsupported token type`,
      icon: 'apps',
    };
  }

  getTypeDetails(type: TokenType): TokenTypeDetails {
    return this.tokenTypeDetails.find(td => td.type === type.toLowerCase()) || this.unknownTokenType;
  }

  getEnrollableTypes(): TokenTypeDetails[] {
    return this.tokenTypeDetails.filter(t => t.enrollmentPermission);
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

  /**
   * Request a token's serial from the backend given an OTP generated by that token.
   *
   * @param {string} otp the otp generated by the token
   * @returns {Observable<string>} an observable of the token serial
   * @memberof TokenService
   */
  getSerialByOTP(otp: string): Observable<string> {
    const url = this.userserviceBase + this.userserviceEndpoints.serialByOTP;
    const params = {
      session: this.sessionService.getSession(),
      otp,
    };
    return this.http.get<LinOTPResponse<{ serial: string }>>(url, { params }).pipe(
      map(t => t.result.value.serial))
      .pipe(
        catchError(this.handleError('getSerialByOTP', null))
      );
  }
}
