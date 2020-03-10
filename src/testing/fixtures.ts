import { Token, TokenType, EnrollmentStatus, TokenTypeDetails } from '../app/api/token';
import { Permission } from '../app/common/permissions';
import { UserSystemInfo, SystemInfo } from '../app/system.service';

export class Fixtures {

  static get tokenTypeDetails(): { [t in TokenType]: TokenTypeDetails } {
    return {
      pw: {
        type: TokenType.PASSWORD,
        name: 'password token',
        description: 'Personal text-based secret',
        icon: 'keyboard',
        // enrollmentPermission: Permission.ENROLLPASSWORD,
        enrollmentActionLabel: 'Enroll',
      },
      hmac: {
        type: TokenType.HOTP,
        name: 'soft token (event)',
        description: 'Event-based soft token (HOTP)',
        icon: 'cached',
        enrollmentPermission: Permission.ENROLLHOTP,
        enrollmentType: 'googleauthenticator',
        enrollmentActionLabel: 'Enroll',
      },
      totp: {
        type: TokenType.TOTP,
        name: 'soft token (time)',
        description: 'Time-based soft token (TOTP)',
        icon: 'timelapse',
        enrollmentPermission: Permission.ENROLLTOTP,
        enrollmentType: 'googleauthenticator_time',
        enrollmentActionLabel: 'Enroll',
      },
      push: {
        type: TokenType.PUSH,
        name: 'Push-Token',
        description: 'Confirm authentication requests on your Smartphone with the Authenticator app',
        icon: 'screen_lock_portrait',
        enrollmentPermission: Permission.ENROLLPUSH,
        activationPermission: Permission.ACTIVATEPUSH,
        enrollmentActionLabel: 'Enroll',
      },
      qr: {
        type: TokenType.QR,
        name: 'QR-Token',
        description: 'Use the Authenticator app to scan QR code authentication requests',
        icon: 'all_out',
        // enrollmentPermission: Permission.ENROLLQR,
        activationPermission: Permission.ACTIVATEQR,
        enrollmentActionLabel: 'Enroll',
      },
      motp: {
        type: TokenType.MOTP,
        name: 'mOTP token',
        description: 'Software-generated tokens from your mobile device',
        icon: 'stay_current_portrait',
      },
      assign: {
        type: TokenType.ASSIGN,
        name: 'Assign Token',
        description: 'Claim an existing token and link it to your user account',
        icon: 'link',
        enrollmentPermission: Permission.ASSIGN,
        enrollmentActionLabel: 'Assign',
      },
      unknown: {
        type: TokenType.UNKNOWN,
        name: 'Unknown Token',
        description: 'Unsupported token type',
        icon: 'apps',
      }
    };
  }

  static get activeHotpToken(): Token {
    return new Token(1, 'Active-Hotp-Token-Serial', this.tokenTypeDetails[TokenType.HOTP], true, 'Description');
  }

  static get activeTotpToken(): Token {
    return new Token(1, 'Active-Totp-Token-Serial', this.tokenTypeDetails[TokenType.TOTP], true, 'Description');
  }

  static get activePushToken(): Token {
    return new Token(2, 'Active-PushToken-Serial', this.tokenTypeDetails[TokenType.PUSH], true, 'Description');
  }

  static get inactiveHotpToken(): Token {
    return new Token(3, 'Inactive-Hotp-Token-Serial', this.tokenTypeDetails[TokenType.HOTP], false, 'Description');
  }

  static get inactivePushToken(): Token {
    return new Token(2, 'Inactive-PushToken-Serial', this.tokenTypeDetails[TokenType.PUSH], false, 'Description');
  }

  static get inactiveQRToken(): Token {
    return new Token(2, 'Inactive-QRToken-Serial', this.tokenTypeDetails[TokenType.QR], false, 'QR token Description');
  }

  static get unpairedPushToken(): Token {
    const token = new Token(5, 'Paired-PushToken-Serial', this.tokenTypeDetails[TokenType.PUSH], true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get pairedPushToken(): Token {
    const token = new Token(5, 'Paired-PushToken-Serial', this.tokenTypeDetails[TokenType.PUSH], true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
    return token;
  }

  static get pairedQRToken(): Token {
    const token = new Token(5, 'Paired-QRToken-Serial', this.tokenTypeDetails[TokenType.QR], true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
    return token;
  }

  static get unpairedQRToken(): Token {
    const token = new Token(5, 'Unpaired-QRToken-Serial', this.tokenTypeDetails[TokenType.QR], true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get completedPushToken(): Token {
    const token = new Token(5, 'Paired-PushToken-Serial', this.tokenTypeDetails[TokenType.PUSH], true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get unknownToken(): Token {
    return new Token(5, 'Unknown-Serial', this.tokenTypeDetails[TokenType.UNKNOWN], true, 'Description');
  }

  static get completedQRToken(): Token {
    const token = new Token(5, 'Paired-QRToken-Serial', this.tokenTypeDetails[TokenType.QR], true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get activeMotpToken(): Token {
    return new Token(1, 'Active-mOTP-Token-Serial', this.tokenTypeDetails[TokenType.MOTP], true, 'Description');
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

  static get systemInfo(): SystemInfo {
    return {
      realms: {
        ExampleRealm: {
          default: false,
          realmname: 'exampleRealm',
          entry: '',
          useridresolver: ['example-resolver']
        }
      },
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
  static get userservice_pre_context() {
    return {
      realms: '{\n  \"ExampleRealm\": {\n    \"default\": false,\n    \"realmname\": \"exampleRealm\",\n    \"entry\": \"\",\n  \
  \"useridresolver\": [\"example-resolver\"]\n  }\n}',
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
  static get userservice_context() {
    return {
      realms: '{\n  \"ExampleRealm\": {\n    \"default\": false,\n    \"realmname\": \"exampleRealm\",\n    \"entry\": \"\",\n  \
    \"useridresolver\": [\"example-resolver\"]\n  }\n}',
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
