import { Permission } from '../common/permissions';

export interface TokenTypeDetails {
  type: TokenType;
  name: string;
  description: string;
  icon: string; // material icon ligature string to use for this token type
  enrollmentPermission?: Permission;
  activationPermission?: Permission;
}

export enum TokenType {
  PASSWORD = 'pw',
  HOTP = 'hmac',
  TOTP = 'totp',
  PUSH = 'push',
  QR = 'qr',
  UNKNOWN = 'unknown',
}

export const tokenTypeDetails: TokenTypeDetails[] = [
  {
    type: TokenType.PASSWORD,
    name: 'password token',
    description: 'Personal text-based secret',
    icon: 'keyboard',
    enrollmentPermission: Permission.ENROLLPASSWORD,
  },
  {
    type: TokenType.HOTP,
    name: 'soft token (event)',
    description: 'Event-based soft token (HOTP)',
    icon: 'cached',
    enrollmentPermission: Permission.ENROLLHOTP,
  },
  {
    type: TokenType.TOTP,
    name: 'soft token (time)',
    description: 'Time-based soft token (TOTP)',
    icon: 'timelapse',
    enrollmentPermission: Permission.ENROLLTOTP,
  },
  {
    type: TokenType.PUSH,
    name: 'Push-Token',
    description: 'Confirm authentication requests on your Smartphone with the Authenticator app',
    icon: 'screen_lock_portrait',
    enrollmentPermission: Permission.ENROLLPUSH,
    activationPermission: Permission.ENROLLPUSH,
  },
  {
    type: TokenType.QR,
    name: 'QR-Token',
    description: 'Use the Authenticator app to scan QR code authentication requests',
    icon: 'all_out',
    enrollmentPermission: Permission.ENROLLQR,
    activationPermission: Permission.ACTIVATEQR,
  },
];

export const unknownTokenType: TokenTypeDetails = {
  type: TokenType.UNKNOWN,
  name: 'Unknown Token',
  description: '',
  icon: 'apps',
};

export function getTypeDetails(type: TokenType): TokenTypeDetails {
  return tokenTypeDetails.find(td => td.type === type) || unknownTokenType;
}

export class Token {
  enrollmentStatus: EnrollmentStatus;

  public typeDetails: TokenTypeDetails;

  constructor(
    public id: number,
    public serial: string,
    public type: TokenType,
    public enabled: boolean,
    public description?: string,
  ) {
    this.typeDetails = getTypeDetails(this.type);
  }
}

export enum EnrollmentStatus {
  UNPAIRED = 'unpaired',
  PAIRING_RESPONSE_RECEIVED = 'pairing_response_received',
  PAIRING_CHALLENGE_SENT = 'pairing_challenge_sent',
  COMPLETED = 'completed',
}

export interface EnrollToken {
  type: TokenType;
  description: string;
}


