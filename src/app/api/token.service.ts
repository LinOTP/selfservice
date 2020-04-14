import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { Permission } from '../common/permissions';
import { Token, TokenType, TokenTypeDetails } from './token';


export interface LinOTPResponse<T, U = undefined> {
  result?: {
    status: boolean,
    value: T,
    error?: {
      message: string,
    };
  };
  detail?: U;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private userserviceBase = `/userservice/`;
  private userserviceEndpoints = {
    tokens: 'usertokenlist',
  };

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private i18n: I18n,
  ) { }

  getTokens(): Observable<Token[]> {
    const url = this.userserviceBase + this.userserviceEndpoints.tokens;
    return this.http.get<LinOTPResponse<any[]>>(url, { params: { session: this.sessionService.getSession() } }).pipe(
      map(t => this.mapTokenResponse(t)))
      .pipe(
        catchError(this.handleError('getTokens', []))
      );
  }

  getToken(serial: string): Observable<Token> {
    return this.getTokens().pipe(
      map(tokens => tokens.find(t => t.serial === serial)),
    );
  }

  mapTokenResponse(res: LinOTPResponse<any[]>) {
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


  get tokenTypeDetails(): TokenTypeDetails[] {
    return [{
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
      enrollmentActionLabel: this.i18n('Create'),
    },
    {
      type: TokenType.TOTP,
      name: this.i18n('soft token (time)'),
      description: this.i18n('Time-based soft token (TOTP)'),
      icon: 'timelapse',
      enrollmentPermission: Permission.ENROLLTOTP,
      enrollmentType: 'googleauthenticator_time',
      enrollmentActionLabel: this.i18n('Create'),
    },
    {
      type: TokenType.PUSH,
      name: this.i18n('Push-Token'),
      description: this.i18n('Confirm authentication requests on your Smartphone with the Authenticator app'),
      icon: 'screen_lock_portrait',
      enrollmentPermission: Permission.ENROLLPUSH,
      activationPermission: Permission.ACTIVATEPUSH,
      enrollmentActionLabel: this.i18n('Create'),
    },
    {
      type: TokenType.QR,
      name: this.i18n('QR-Token'),
      description: this.i18n('Use the Authenticator app to scan QR code authentication requests'),
      icon: 'all_out',
      enrollmentPermission: Permission.ENROLLQR,
      activationPermission: Permission.ACTIVATEQR,
      enrollmentActionLabel: this.i18n('Create'),
    },
    {
      type: TokenType.MOTP,
      name: this.i18n('mOTP token'),
      description: this.i18n('Generate OTPs from your mobile device given a secret password and a custom pin'),
      icon: 'stay_current_portrait',
    },
    {
      type: TokenType.SMS,
      name: this.i18n('SMS token'),
      description: this.i18n('Receive an OTP via SMS'),
      icon: 'textsms',
    },
    {
      type: TokenType.EMAIL,
      name: this.i18n('e-mail token'),
      description: this.i18n('Receive an OTP via e-mail'),
      icon: 'email',
    },
    {
      type: TokenType.ASSIGN,
      name: this.i18n('Assign token'),
      description: this.i18n('Claim an existing token and link it to your user account'),
      icon: 'link',
      enrollmentPermission: Permission.ASSIGN,
      enrollmentActionLabel: this.i18n('Assign'),
    }];
  }

  get unknownTokenType(): TokenTypeDetails {
    return {
      type: TokenType.UNKNOWN,
      name: this.i18n('Unknown Token'),
      description: this.i18n('Unsupported token type'),
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
}
