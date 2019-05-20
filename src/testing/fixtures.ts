import { Token, TokenType } from '../app/api/token';

export class Fixtures {

  static get activeHotpToken(): Token {
    return new Token(1, 'Active-Hotp-Token-Serial', TokenType.HOTP, true, 'Description');
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
        transactionid: 1
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

  static get enrolledToken() {
    return { serial: 'test serial', url: 'testUrl' };
  }
}
