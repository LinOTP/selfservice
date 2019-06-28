import { Token, TokenType, EnrollmentStatus } from '../app/api/token';

export class Fixtures {

  static get activeHotpToken(): Token {
    return new Token(1, 'Active-Hotp-Token-Serial', TokenType.HOTP, true, 'Description');
  }

  static get activeTotpToken(): Token {
    return new Token(1, 'Active-Totp-Token-Serial', TokenType.TOTP, true, 'Description');
  }

  static get activePushToken(): Token {
    return new Token(2, 'Active-PushToken-Serial', TokenType.PUSH, true, 'Description');
  }

  static get inactiveHotpToken(): Token {
    return new Token(3, 'Inactive-Hotp-Token-Serial', TokenType.HOTP, false, 'Description');
  }

  static get inactivePushToken(): Token {
    return new Token(2, 'Inactive-PushToken-Serial', TokenType.PUSH, false, 'Description');
  }

  static get inactiveQRToken(): Token {
    return new Token(2, 'Inactive-QRToken-Serial', TokenType.QR, false, 'QR token Description');
  }

  static get unpairedPushToken(): Token {
    const token = new Token(5, 'Paired-PushToken-Serial', TokenType.PUSH, true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get pairedPushToken(): Token {
    const token = new Token(5, 'Paired-PushToken-Serial', TokenType.PUSH, true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
    return token;
  }

  static get pairedQRToken(): Token {
    const token = new Token(5, 'Paired-QRToken-Serial', TokenType.QR, true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
    return token;
  }

  static get unpairedQRToken(): Token {
    const token = new Token(5, 'Unpaired-QRToken-Serial', TokenType.QR, true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get completedPushToken(): Token {
    const token = new Token(5, 'Paired-PushToken-Serial', TokenType.PUSH, true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get unknownToken(): Token {
    return new Token(5, 'Unknown-Serial', TokenType.UNKNOWN, true, 'Description');
  }

  static get completedQRToken(): Token {
    const token = new Token(5, 'Paired-QRToken-Serial', TokenType.QR, true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get tokens(): Token[] {
    return [
      this.activeHotpToken,
      this.activePushToken,
    ];
  }

  static get enrollmentResponse() {
    return {
      result: {
        value: false
      }
      ,
      detail: {
        googleurl: {
          value: 'testUrl',
        },
        lse_qr_url: {
          value: 'testUrl',
        },
        serial: 'testSerial',
      }
    };
  }

  static get activationResponse() {
    return {
      result: {
        value: true
      },
      detail: {
        transactionid: 1,
        message: 'QR_URL'
      }
    };
  }

  static get hmacTokenType() {
    return {
      type: TokenType.HOTP,
      name: 'test hmac',
      description: 'desc',
      icon: 'icon',
    };
  }

  static get pushTokenType() {
    return {
      type: TokenType.PUSH,
      name: 'test push',
      description: 'desc',
      icon: 'icon'
    };
  }

  static get unknownTokenType() {
    return {
      type: TokenType.UNKNOWN,
      name: 'test unknown',
      description: 'desc',
      icon: 'icon'
    };
  }

  static get enrolledToken() {
    return { serial: 'test serial', url: 'testUrl' };
  }
}
