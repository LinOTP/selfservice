
import { EnrollmentDetail } from '@api/enrollment.service';
import { HistoryField, HistoryPage, HistoryRequestOptions, HistoryResponse, SortOrder } from '@api/history';
import { ReplyMode } from '@api/test.service';
import { EnrollmentStatus, SelfserviceToken, TokenDisplayData, TokenType } from '@api/token';
import { SystemInfo, UserSystemInfo } from '@app/system.service';
import { Permission } from '@common/permissions';

export class Fixtures {

  static get tokenDisplayData(): { [t in TokenType | 'assign']: TokenDisplayData } {
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
        type: 'assign',
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

  static get activeHotpToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-Hotp-Token-Serial', this.tokenDisplayData[TokenType.HOTP], true, 'Description');
  }

  static get activeTotpToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-Totp-Token-Serial', this.tokenDisplayData[TokenType.TOTP], true, 'Description');
  }

  static get activePushToken(): SelfserviceToken {
    return new SelfserviceToken(2, 'Active-PushToken-Serial', this.tokenDisplayData[TokenType.PUSH], true, 'Description');
  }

  static get activeQRToken(): SelfserviceToken {
    return new SelfserviceToken(2, 'Active-QRToken-Serial', this.tokenDisplayData[TokenType.QR], true, 'Description');
  }

  static get inactiveHotpToken(): SelfserviceToken {
    return new SelfserviceToken(3, 'Inactive-Hotp-Token-Serial', this.tokenDisplayData[TokenType.HOTP], false, 'Description');
  }

  static get inactivePushToken(): SelfserviceToken {
    return new SelfserviceToken(2, 'Inactive-PushToken-Serial', this.tokenDisplayData[TokenType.PUSH], false, 'Description');
  }

  static get inactiveQRToken(): SelfserviceToken {
    return new SelfserviceToken(2, 'Inactive-QRToken-Serial', this.tokenDisplayData[TokenType.QR], false, 'QR token Description');
  }

  static get unpairedPushToken(): SelfserviceToken {
    const token = new SelfserviceToken(5, 'Paired-PushToken-Serial', this.tokenDisplayData[TokenType.PUSH], true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get pairedPushToken(): SelfserviceToken {
    const token = new SelfserviceToken(5, 'Paired-PushToken-Serial', this.tokenDisplayData[TokenType.PUSH], true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
    return token;
  }

  static get pairedQRToken(): SelfserviceToken {
    const token = new SelfserviceToken(5, 'Paired-QRToken-Serial', this.tokenDisplayData[TokenType.QR], true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.PAIRING_RESPONSE_RECEIVED;
    return token;
  }

  static get unpairedQRToken(): SelfserviceToken {
    const token = new SelfserviceToken(5, 'Unpaired-QRToken-Serial', this.tokenDisplayData[TokenType.QR], true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get completedPushToken(): SelfserviceToken {
    const token = new SelfserviceToken(5, 'Paired-PushToken-Serial', this.tokenDisplayData[TokenType.PUSH], true, 'Description');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get unknownToken(): SelfserviceToken {
    return new SelfserviceToken(5, 'Unknown-Serial', this.tokenDisplayData[TokenType.UNKNOWN], true, 'Description');
  }

  static get completedQRToken(): SelfserviceToken {
    const token = new SelfserviceToken(5, 'Paired-QRToken-Serial', this.tokenDisplayData[TokenType.QR], true, 'QR token Description');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get activeMotpToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-mOTP-Token-Serial', this.tokenDisplayData[TokenType.MOTP], true, 'Description');
  }

  static get activeSMSToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-SMS-Token-Serial', this.tokenDisplayData[TokenType.SMS], true, 'Description');
  }

  static get activeEmailToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-Email-Token-Serial', this.tokenDisplayData[TokenType.EMAIL], true, 'Description');
  }

  static get activePasswordToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-Password-Token-Serial', this.tokenDisplayData[TokenType.PASSWORD], true, 'Description');
  }

  static get activeYubicoToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-Yubico-Token-Serial', this.tokenDisplayData[TokenType.YUBICO], true, 'Description');
  }

  static get activeYubikeyToken(): SelfserviceToken {
    return new SelfserviceToken(1, 'Active-Yubico-Token-Serial', this.tokenDisplayData[TokenType.YUBICO], true, 'Description');
  }


  static get tokens(): SelfserviceToken[] {
    return [
      this.activeHotpToken,
      this.activePushToken,
    ];
  }

  static get enrollmentResponse() {
    return {
      googleurl: {
        value: 'testUrl',
      },
      lse_qr_url: {
        value: 'testUrl',
      },
      serial: 'testSerial',
    };
  }

  static get OATHEnrollmentResponse() {
    return {
      serial: 'testSerial',
      googleurl: {
        value: 'testUrl',
      },
      otpkey: {
        value: 'random value',
      }
    };
  }

  static get PasswordEnrollmentResponse(): EnrollmentDetail {
    return {
      serial: 'serial',
    };
  }

  static get emailEnrollmentResponse(): EnrollmentDetail {
    return {
      serial: 'testSerial',
    };
  }

  static get smsEnrollmentResponse(): EnrollmentDetail {
    return {
      serial: 'testSerial',
    };
  }

  static get mOTPEnrollmentResponse(): EnrollmentDetail {
    return {
      serial: 'testSerial',
    };
  }

  static get activationResponse() {
    return {
      transactionid: '1',
    };
  }

  static get activationResponseWithMessage() {
    return {
      transactionid: '1',
      message: 'QR_URL'
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
        privacy_notice_url: 'http://privacy',
        token_limits: {
          all_token: null,
          token_types: [],
        },
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
        token_limits: {
          all_token: null,
          token_types: [],
        },
      },
    };
  }

  static get userSystemInfo(): UserSystemInfo {
    return {
      actions: [],
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
        token_limits: {
          all_token: null,
          token_types: [],
        },
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
    const token = new SelfserviceToken(1, 'serial', Fixtures.tokenDisplayData[TokenType.UNKNOWN], true, 'desc');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get mockReadyDisabledToken() {
    const token = new SelfserviceToken(2, 'serial2', Fixtures.tokenDisplayData[TokenType.UNKNOWN], false, 'desc');
    token.enrollmentStatus = EnrollmentStatus.COMPLETED;
    return token;
  }

  static get mockUnreadyDisabledToken() {
    const token = new SelfserviceToken(3, 'serial3', Fixtures.tokenDisplayData[TokenType.UNKNOWN], false, 'desc');
    token.enrollmentStatus = EnrollmentStatus.UNPAIRED;
    return token;
  }

  static get mockTokenList(): SelfserviceToken[] {
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

export class HistoryFixtures {

  static get mockRequestOptions(): HistoryRequestOptions {
    return {
      page: 1,
      recordCount: 10,
      sortBy: HistoryField.SERIAL,
      sortOrder: SortOrder.DESCENDING,
      query: '',
      queryType: HistoryField.ACTION
    };
  }

  static get mockResponse(): HistoryResponse {
    return {
      page: 1,
      total: 22,
      rows: [
        {
          id: 1,
          cell: [
            '2020-11-17 19:52:35.619941',
            'userservice/history',
            '1',
            '',
            '',
            '',
            ''
          ]
        },
        {
          id: 2,
          cell: [
            '2020-11-17 11:28:28.058543',
            'userservice/usertokenlist',
            '0',
            '',
            '',
            '',
            ''
          ]
        },
        {
          id: 3,
          cell: [
            '2020-11-17 11:28:11.111613',
            'userservice/enroll',
            '1',
            'TOTP0001A063',
            '',
            '',
            'tokennum = 2'
          ]
        },
        {
          id: 4,
          cell: [
            '2020-11-17 19:52:35.619941',
            'userservice/history',
            '1',
            '',
            '',
            '',
            ''
          ]
        },
        {
          id: 5,
          cell: [
            '2020-11-17 11:28:28.058543',
            'userservice/usertokenlist',
            '0',
            '',
            '',
            '',
            ''
          ]
        },
        {
          id: 6,
          cell: [
            '2020-11-17 11:28:11.111613',
            'userservice/enroll',
            '1',
            'TOTP0001A063',
            '',
            '',
            'tokennum = 2'
          ]
        },
        {
          id: 7,
          cell: [
            '2020-11-17 19:52:35.619941',
            'userservice/history',
            '1',
            '',
            '',
            '',
            ''
          ]
        },
        {
          id: 8,
          cell: [
            '2020-11-17 11:28:28.058543',
            'userservice/usertokenlist',
            '0',
            '',
            '',
            '',
            ''
          ]
        },
        {
          id: 9,
          cell: [
            '2020-11-17 11:28:11.111613',
            'userservice/enroll',
            '1',
            'TOTP0001A063',
            '',
            '',
            'tokennum = 2'
          ]
        },
        {
          id: 10,
          cell: [
            '2020-11-17 19:52:35.619941',
            'userservice/history',
            '1',
            '',
            '',
            '',
            ''
          ]
        }
      ],
    };
  }

  static get mockPage(): HistoryPage {
    return {
      page: 0,
      totalRecords: 22,
      pageRecords: [
        {
          date: new Date('2020-11-17 19:52:35.619941'),
          action: 'userservice/history',
          success: true,
          serial: '',
          tokenType: null,
          actionDetail: ''
        },
        {
          date: new Date('2020-11-17 11:28:28.058543'),
          action: 'userservice/usertokenlist',
          success: false,
          serial: '',
          tokenType: null,
          actionDetail: ''
        },
        {
          date: new Date('2020-11-17 11:28:11.111613'),
          action: 'userservice/enroll',
          success: true,
          serial: 'TOTP0001A063',
          tokenType: null,
          actionDetail: 'tokennum = 2'
        },
        {
          date: new Date('2020-11-17 19:52:35.619941'),
          action: 'userservice/history',
          success: true,
          serial: '',
          tokenType: null,
          actionDetail: ''
        },
        {
          date: new Date('2020-11-17 11:28:28.058543'),
          action: 'userservice/usertokenlist',
          success: false,
          serial: '',
          tokenType: null,
          actionDetail: ''
        },
        {
          date: new Date('2020-11-17 11:28:11.111613'),
          action: 'userservice/enroll',
          success: true,
          serial: 'TOTP0001A063',
          tokenType: null,
          actionDetail: 'tokennum = 2'
        },
        {
          date: new Date('2020-11-17 19:52:35.619941'),
          action: 'userservice/history',
          success: true,
          serial: '',
          tokenType: null,
          actionDetail: ''
        },
        {
          date: new Date('2020-11-17 11:28:28.058543'),
          action: 'userservice/usertokenlist',
          success: false,
          serial: '',
          tokenType: null,
          actionDetail: ''
        },
        {
          date: new Date('2020-11-17 11:28:11.111613'),
          action: 'userservice/enroll',
          success: true,
          serial: 'TOTP0001A063',
          tokenType: null,
          actionDetail: 'tokennum = 2'
        },
        {
          date: new Date('2020-11-17 19:52:35.619941'),
          action: 'userservice/history',
          success: true,
          serial: '',
          tokenType: null,
          actionDetail: ''
        }
      ],
    };
  }

}
