import { Token, TokenType, EnrollmentStatus } from '../app/api/token';
import { Permission } from '../app/common/permissions';
import { UserSystemInfo } from '../app/system.service';

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

  static get OATHEnrollmentResponse() {
    return {
      result: {
        status: true,
        value: {
          init: true,
          oathtoken: {
            url: 'testUrl',
            serial: 'testSerial',
            key: 'random value',
          }
        }
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

  static get enrolledToken() {
    return { serial: 'testSerial', url: 'testUrl', seed: 'random value' };
  }

  static get permissionList(): Permission[] {
    return [
      Permission.ENROLLPASSWORD,
      Permission.ENROLLPUSH,
      Permission.ACTIVATEPUSH,
      Permission.ENROLLQR,
      Permission.ACTIVATEQR,
      Permission.ENROLLHOTP,
      Permission.ENROLLTOTP,
      Permission.DELETE,
      Permission.SETPIN,
      Permission.ENABLE,
      Permission.DISABLE,
    ];
  }

  static get policyActionList(): string[] {
    return [
      'enrollPW',
      'enrollPUSH',
      'activate_PushToken',
      'enrollQR',
      'activate_QRToken',
      'webprovisionGOOGLE',
      'webprovisionGOOGLEtime',
      'delete',
      'setOTPPIN',
      'enable',
      'disable',
    ];
  }

  static get userSystemInfo(): UserSystemInfo {
    return {
      realms: {
        ExampleRealm: {
          default: false,
          realmname: 'exampleRealm',
          entry: '',
          useridresolver: ['example-resolver']
        }
      },
      permissions: this.permissionList,
      imprint: '',
      user: '',
      realm: '',
      autoassign: false,
      licenseinfo: '',
      default_realm: '',
      mfa_login: false,
      realm_box: false,
      mfa_3_fields: false,
      version: '',
      autoenroll: false,
    };
  }
}

export class ExampleAPIResponses {
  static get userservice_context() {
    return {
      realms: '{\n  \"ExampleRealm\": {\n    \"default\": false,\n    \"realmname\": \"exampleRealm\",\n    \"entry\": \"\",\n    \"useridresolver\": [\"example-resolver\"]\n  }\n}',
      actions: Fixtures.policyActionList,
      imprint: '',
      user: '',
      realm: '',
      autoassign: false,
      licenseinfo: '',
      default_realm: '',
      mfa_login: false,
      realm_box: false,
      mfa_3_fields: false,
      version: '',
      autoenroll: false,
    };
  }
}
