import { Permission } from '@common/permissions';

export enum TokenType {
  PASSWORD = "pw",
  HOTP = "hmac",
  TOTP = "totp",
  PUSH = "push",
  QR = "qr",
  MOTP = "motp",
  SMS = "sms",
  EMAIL = "email",
  YUBICO = "yubico",
  YUBIKEY = "yubikey",
  FORWARD = "forward",
  UNKNOWN = "unknown"
}

export enum EnrollmentEndpointType {
  ENROLL = 'enroll',
  WEBPROVISION = 'webprovision',
}

export interface TokenDisplayData {
  type: TokenType | 'assign';
  name: string;
  description: string;
  icon: string; // material icon ligature string to use for this token type
  enrollmentPermission?: Permission;
  activationPermission?: Permission;
  enrollmentType?: string;
  enrollmentActionLabel?: string;
  authenticationPrompt?: string;
}

export class SelfserviceToken {
  private _enrollmentStatus: EnrollmentStatus;
  get enrollmentStatus() {
    return this._enrollmentStatus;
  }
  set enrollmentStatus(status: EnrollmentStatus) {
    this._enrollmentStatus = status;
  }

  get id() {
    return this.token['LinOtp.TokenId'];
  }
  get serial() {
    return this.token['LinOtp.TokenSerialnumber'];
  }

  private _typeDetails: TokenDisplayData;
  get typeDetails() {
    return this._typeDetails;
  }

  get enabled() {
    return this.token['LinOtp.Isactive'];
  }
  get description() {
    return this.token['LinOtp.TokenDesc'];
  }

  get verified() {
    // we use lastAuthSuccess as verify flag. it is only filled when token timestamps are enabled in configuration
    return !!this.token['LinOtp.LastAuthSuccess']
  }

  get tokenType() {
    return this.token['LinOtp.TokenType'];
  }

  get phone() {
    return this.token['LinOtp.TokenInfo'].phone;
  }

  get email() {
    return this.token['LinOtp.TokenInfo'].email_address;
  }

  constructor(
    private token: LinOtpToken
  ) {
    this._typeDetails = getTokenDisplayData(token['LinOtp.TokenType'].toLowerCase() as TokenType);
    this._enrollmentStatus = token['Enrollment']['status'] === 'completed' ? 'completed' : token['Enrollment']['detail'];
  }
}

export enum EnrollmentStatus {
  // 1. step
  UNPAIRED = 'unpaired', // push token created but not paired
  PAIRING_URL_SENT = 'pairing_url_sent', // qr token created but not paired
  // 2. step
  PAIRING_RESPONSE_RECEIVED = 'pairing_response_received', // qr and push token paired but activation not started
  // 3. step
  PAIRING_CHALLENGE_SENT = 'pairing_challenge_sent', // qr and push token pairing challenge triggered
  // enrollment completed
  COMPLETED = 'completed', // qr and push token activation challenge is answered and token is fully operational now
}

export interface EnrollmentOptions {
  type: TokenType | 'assign';
  description?: string;
  email_address?: string;
  phone?: string;
  otpkey?: string;
  pin?: string; // the general token pin
  otppin?: string // motppin of mOTP-Token
  otplen?: number;
  'yubico.tokenid'?: string;
}

export const tokenDisplayData: TokenDisplayData[] = [
  {
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
    enrollmentType: 'hmac',
    enrollmentActionLabel: $localize`Create`,
    authenticationPrompt: $localize`Enter OTP from event-based soft token`,
  },
  {
    type: TokenType.TOTP,
    name: $localize`soft token (time)`,
    description: $localize`Time-based soft token (TOTP)`,
    icon: 'timelapse',
    enrollmentPermission: Permission.ENROLLTOTP,
    enrollmentType: 'totp',
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
    type: TokenType.YUBIKEY,
    name: $localize`Yubikey token`,
    description: $localize`Authenticate with a Yubikey hardware token.`,
    icon: 'vpn_key', // TODO: we might want to use an official logo here
    authenticationPrompt: $localize`Authenticate using your Yubikey token`,
  },
  {
    type: TokenType.FORWARD,
    name: $localize`forwarding token`,
    description: $localize`Forward the authentication request to another token.`,
    icon: 'shortcut',
    authenticationPrompt: $localize`Authenticate using your forwarded token`,
  },
  {
    type: 'assign',
    name: $localize`Assign token`,
    description: $localize`Claim an existing token and link it to your user account`,
    icon: 'link',
    enrollmentPermission: Permission.ASSIGN,
    enrollmentActionLabel: $localize`Assign`,
  }
];

export const unknownTokenTypeDetail: TokenDisplayData = {
  type: TokenType.UNKNOWN,
  name: $localize`Unknown Token`,
  description: $localize`Unsupported token type`,
  icon: 'apps',
};


export function getTokenDisplayData(type: TokenType): TokenDisplayData {
  return tokenDisplayData.find(d => d.type === type) || unknownTokenTypeDetail;
}

export type LinOtpToken = {
  'LinOtp.TokenId': number;
  'LinOtp.TokenDesc': string;
  'LinOtp.TokenSerialnumber': string;
  'LinOtp.TokenType': LinOtpTokenType;
  'LinOtp.TokenInfo': { [key: string]: string };
  'LinOtp.IdResolver': string;
  'LinOtp.IdResClass': string;
  'LinOtp.Userid': string;
  'LinOtp.OtpLen': number;
  'LinOtp.MaxFail': number;
  'LinOtp.Isactive': boolean;
  'LinOtp.FailCount': number;
  'LinOtp.Count': number;
  'LinOtp.CountWindow': number;
  'LinOtp.SyncWindow': number;
  'LinOtp.CreationDate': string;
  'LinOtp.LastAuthSuccess': string;
  'LinOtp.LastAuthMatch': string;
  'LinOtp.RealmNames': string[];
  Enrollment: {
    status: LinOtpTokenEnrollmentStatus;
  }
}

export type LinOtpTokenEnrollmentStatus = 'completed' | 'unpaired' | 'pairing_url_sent' | 'pairing_response_received' | 'pairing_challenge_sent';
export type LinOtpTokenType = 'pw' | 'forward' | 'hmac' | 'totp' | 'push' | 'qr' | 'motp' | 'sms' | 'email' | 'yubico' | 'yubikey' | 'unknown';
