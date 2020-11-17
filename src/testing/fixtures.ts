import { Token, TokenType, EnrollmentStatus, TokenTypeDetails } from '../app/api/token';
import { Permission } from '../app/common/permissions';
import { UserSystemInfo, SystemInfo } from '../app/system.service';
import { LinOTPResponse } from '../app/api/api';
import { ReplyMode } from '../app/api/test.service';

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
      yubico: {
        type: TokenType.YUBICO,
        name: 'YubiCloud token',
        description: 'Register your Yubikey to authenticate against the YubiCloud.',
        icon: 'vpn_key', // TODO: we might want to use an official logo here
        enrollmentPermission: Permission.ENROLLYUBICO,
        enrollmentActionLabel: 'Register',
      },
      yubikey: {
        type: TokenType.YUBIKEY,
        name: `Yubikey token`,
        description: `Authenticate with a Yubikey hardware token.`,
        icon: 'vpn_key', // TODO: we might want to use an official logo here
        authenticationPrompt: `Authenticate using your Yubikey token`,
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
      sms: {
        type: TokenType.SMS,
        name: 'SMS token',
        description: 'Receive an OTP via SMS',
        icon: 'stay_current_portrait',
      },
      email: {
        type: TokenType.EMAIL,
        name: 'email token',
        description: 'Receive an OTP via email',
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

  static get activeSMSToken(): Token {
    return new Token(1, 'Active-SMS-Token-Serial', this.tokenTypeDetails[TokenType.SMS], true, 'Description');
  }

  static get activeEmailToken(): Token {
    return new Token(1, 'Active-Email-Token-Serial', this.tokenTypeDetails[TokenType.EMAIL], true, 'Description');
  }

  static get activePasswordToken(): Token {
    return new Token(1, 'Active-Password-Token-Serial', this.tokenTypeDetails[TokenType.PASSWORD], true, 'Description');
  }

  static get activeYubicoToken(): Token {
    return new Token(1, 'Active-Yubico-Token-Serial', this.tokenTypeDetails[TokenType.YUBICO], true, 'Description');
  }

  static get activeYubikeyToken(): Token {
    return new Token(1, 'Active-Yubico-Token-Serial', this.tokenTypeDetails[TokenType.YUBICO], true, 'Description');
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
        value: true,
      },
      detail: {
        serial: 'testSerial',
        googleurl: {
          value: 'testUrl',
        },
        otpkey: {
          value: 'random value',
        }
      }
    };
  }

  static get PasswordEnrollmentResponse() {
    return {
      result: {
        status: true,
        value: true,
      },
      detail: {
        serial: 'serial',
      },
    };
  }

  static get emailEnrollmentResponse(): LinOTPResponse<boolean, { serial: string }> {
    return {
      result: {
        status: true,
        value: true,
      },
      detail: {
        serial: 'testSerial',
      }
    };
  }

  static get smsEnrollmentResponse() {
    return this.emailEnrollmentResponse;
  }

  static get mOTPEnrollmentResponse() {
    return this.emailEnrollmentResponse;
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
      copyright: 'copyright',
      version: 'LinOTP 3.0.1b',
      realms: {
        ExampleRealm: {
          default: false,
          realmname: 'exampleRealm',
          entry: '',
          useridresolver: ['example-resolver']
        }
      },
      settings: {
        autoassign: false,
        default_realm: '',
        mfa_login: false,
        realm_box: false,
        mfa_3_fields: false,
        autoenroll: false,
        footer_text: 'footer text',
        imprint_url: 'http://imprint',
        privacy_notice_url: 'http://privacy'
      },
    };
  }

  static get outdatedSystemInfo(): SystemInfo {
    return {
      copyright: '',
      version: 'LinOTP 2.12.2',
      realms: {
        ExampleRealm: {
          default: false,
          realmname: 'exampleRealm',
          entry: '',
          useridresolver: ['example-resolver']
        }
      },
      settings: {
        autoassign: false,
        default_realm: '',
        mfa_login: false,
        realm_box: false,
        mfa_3_fields: false,
        autoenroll: false,
      },
    };
  }

  static get userSystemInfo(): UserSystemInfo {
    return {
      copyright: '',
      version: '',
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
      user: {
        username: 'username',
        userid: 'userid',
        description: 'description',
        phone: 'phone',
        mobile: 'mobile',
        email: 'email',
        givenname: 'givenname',
        surname: 'surname',
        gender: 'gender',
        realm: 'realm',
      },
      settings: {
        autoassign: false,
        default_realm: '',
        mfa_login: false,
        realm_box: false,
        mfa_3_fields: false,
        autoenroll: false,
      },
    };
  }

  static get transactionDetail() {
    return {
      replyMode: [ReplyMode.OFFLINE],
      transactionId: 'txid',
      transactionData: 'txdata',
      message: 'message'
    };
  }

  static get transactionDetailOnline() {
    return {
      replyMode: [ReplyMode.ONLINE],
      transactionId: 'txid',
      transactionData: 'txdata',
      message: 'message'
    };
  }
}

export class ExampleAPIResponses {
  static get userservice_pre_context() {
    return {
      result: {
        status: true,
        value: true,
      },
      detail: {
        copyright: '',
        version: '',
        realms: {
          ExampleRealm: {
            default: false,
            realmname: 'exampleRealm',
            entry: '',
            useridresolver: ['example-resolver']
          }
        },
        settings: {
          autoassign: false,
          default_realm: '',
          mfa_login: false,
          realm_box: false,
          mfa_3_fields: false,
          autoenroll: false,
        },
      }
    };
  }
  static get userservice_context() {
    return {
      result: {
        status: true,
        value: true,
      },
      detail: {
        copyright: '',
        version: '',
        realms: {
          ExampleRealm: {
            default: false,
            realmname: 'exampleRealm',
            entry: '',
            useridresolver: ['example-resolver']
          }
        },
        settings: {
          autoassign: false,
          default_realm: '',
          mfa_login: false,
          realm_box: false,
          mfa_3_fields: false,
          autoenroll: false,
        },
        actions: Fixtures.policyActionList,
      },
    };
  }
}

export class TokenListFixtures {

  static get mockReadyEnabledToken() {
    const token = new Token(1, 'serial', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], true, 'desc');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get mockReadyDisabledToken() {
    const token = new Token(2, 'serial2', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], false, 'desc');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get mockUnreadyDisabledToken() {
    const token = new Token(3, 'serial3', Fixtures.tokenTypeDetails[TokenType.UNKNOWN], false, 'desc');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get mockTokenList(): Token[] {
    return [this.mockReadyEnabledToken, this.mockReadyDisabledToken, this.mockUnreadyDisabledToken];
  }

  static get mockTokenListFromBackend() {
    return [
      {
        'LinOtp.TokenId': this.mockReadyEnabledToken.id,
        'LinOtp.TokenSerialnumber': this.mockReadyEnabledToken.serial,
        'LinOtp.TokenType': this.mockReadyEnabledToken.typeDetails.type,
        'LinOtp.TokenDesc': this.mockReadyEnabledToken.description,
        'LinOtp.Isactive': this.mockReadyEnabledToken.enabled,
        'Enrollment': { 'status': this.mockReadyEnabledToken.enrollmentStatus }
      },
      {
        'LinOtp.TokenId': this.mockReadyDisabledToken.id,
        'LinOtp.TokenSerialnumber': this.mockReadyDisabledToken.serial,
        'LinOtp.TokenType': this.mockReadyDisabledToken.typeDetails.type,
        'LinOtp.TokenDesc': this.mockReadyDisabledToken.description,
        'LinOtp.Isactive': this.mockReadyDisabledToken.enabled,
        'Enrollment': { 'status': this.mockReadyDisabledToken.enrollmentStatus }
      },
      {
        'LinOtp.TokenId': this.mockUnreadyDisabledToken.id,
        'LinOtp.TokenSerialnumber': this.mockUnreadyDisabledToken.serial,
        'LinOtp.TokenType': this.mockUnreadyDisabledToken.typeDetails.type,
        'LinOtp.TokenDesc': this.mockUnreadyDisabledToken.description,
        'LinOtp.Isactive': this.mockUnreadyDisabledToken.enabled,
        'Enrollment': { 'status': 'not completed', 'detail': this.mockUnreadyDisabledToken.enrollmentStatus }
      }
    ];
  }

  static get mockGetTokensResponse() {
    return {
      result: {
        value: this.mockTokenListFromBackend
      }
    };
  }
}
