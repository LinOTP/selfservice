import { Permission } from './permissions';

export interface TokenType {
  type: string;
  name: string;
  description: string;
  icon: string; // material icon ligature string to use for this token type
  enrollmentPermission?: Permission;
  activationPermission?: Permission;
}

export const tokenTypes: TokenType[] = [
  {
    type: 'pw',
    name: 'Password token',
    description: 'Personal text-based secret',
    icon: 'keyboard',
    enrollmentPermission: Permission.ENROLLPASSWORD,
  },
  {
    type: 'hmac',
    name: 'Soft token (event)',
    description: 'Event-based soft token (HOTP)',
    icon: 'cached',
    enrollmentPermission: Permission.ENROLLHOTP,
  },
  {
    type: 'totp',
    name: 'Soft token (time)',
    description: 'Time-based soft token (TOTP)',
    icon: 'timelapse',
    enrollmentPermission: Permission.ENROLLTOTP,
  },
  {
    type: 'push',
    name: 'Push-Token',
    description: 'Confirm authentication requests on your Smartphone with the Authenticator app',
    icon: 'screen_lock_portrait',
    enrollmentPermission: Permission.ENROLLPUSH,
    activationPermission: Permission.ENROLLPUSH,
  },
  {
    type: 'qr',
    name: 'QR-Token',
    description: 'Use the Authenticator app to scan QR code authentication requests',
    icon: 'all_out',
    enrollmentPermission: Permission.ENROLLQR,
    activationPermission: Permission.ACTIVATEQR,
  },
];

export const unknownTokenType: TokenType = {
  type: 'unknown',
  name: 'Unknown Token',
  description: '',
  icon: 'apps',
};

export class Token {
  enrollmentStatus: EnrollmentStatus;

  public typeDetails: TokenType;

  constructor(
    public id: number,
    public serial: string,
    public type: string,
    public description?: string
  ) {
    this.type = this.type.toLowerCase();
    this.typeDetails = tokenTypes.find(tt => tt.type === this.type) || unknownTokenType;
  }

}

export class EnrollmentStatus {
  public static unpaired = 'unpaired';
  public static pairing_response_received = 'pairing_response_received';
  public static pairing_challenge_sent = 'pairing_challenge_sent';
  public static completed = 'completed';
}

export interface EnrollToken {
  type: string;
  description: string;
}
