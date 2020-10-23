import { Permission } from '../common/permissions';

export enum EnrollmentEndpointType {
  ENROLL = 'enroll',
  WEBPROVISION = 'webprovision',
}

export interface TokenTypeDetails {
  type: TokenType;
  name: string;
  description: string;
  icon: string; // material icon ligature string to use for this token type
  enrollmentPermission?: Permission;
  activationPermission?: Permission;
  enrollmentType?: string;
  enrollmentActionLabel?: string;
  authenticationPrompt?: string;
}

export enum TokenType {
  PASSWORD = 'pw',
  HOTP = 'hmac',
  TOTP = 'totp',
  PUSH = 'push',
  QR = 'qr',
  MOTP = 'motp',
  SMS = 'sms',
  EMAIL = 'email',
  YUBICO = 'yubico',
  YUBIKEY = 'yubikey',
  ASSIGN = 'assign', // virtual type for token assignment
  UNKNOWN = 'unknown', // fallback type
}

export class Token {
  enrollmentStatus: EnrollmentStatus;

  constructor(
    public id: number,
    public serial: string,
    public typeDetails: TokenTypeDetails,
    public enabled: boolean,
    public description?: string,
  ) { }
}

export enum EnrollmentStatus {
  UNPAIRED = 'unpaired',
  PAIRING_RESPONSE_RECEIVED = 'pairing_response_received',
  PAIRING_CHALLENGE_SENT = 'pairing_challenge_sent',
  COMPLETED = 'completed',
}

export interface EnrollToken {
  type: TokenType;
  description?: string;
  email_address?: string;
  phone?: string;
  otpkey?: string;
  otppin?: string;
  otplen?: number;
  'yubico.tokenid'?: string;
}

export const tokenTypeDetails: TokenTypeDetails[] = [
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
    enrollmentPermission: Permission.ENROLLYUBIKEY,
    enrollmentActionLabel: $localize`Register`,
    authenticationPrompt: $localize`Authenticate using your Yubikey token`,
  },
  {
    type: TokenType.ASSIGN,
    name: $localize`Assign token`,
    description: $localize`Claim an existing token and link it to your user account`,
    icon: 'link',
    enrollmentPermission: Permission.ASSIGN,
    enrollmentActionLabel: $localize`Assign`,
  }
];

export const unknownTokenTypeDetail: TokenTypeDetails = {
  type: TokenType.UNKNOWN,
  name: $localize`Unknown Token`,
  description: $localize`Unsupported token type`,
  icon: 'apps',
};
