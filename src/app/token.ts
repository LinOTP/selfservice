
export interface TokenType {
  type: string;
  name: string;
  description: string;
  icon: string; // material icon ligature string to use for this token type
}

export const tokenTypes: TokenType[] = [
  {
    type: 'hmac',
    name: 'HOTP-Token',
    description: 'Event-based soft token (HOTP)',
    icon: 'cached',
  },
  {
    type: 'totp',
    name: 'TOTP-Token',
    description: 'Time-based soft token (TOTP)',
    icon: 'timelapse',
  },
  {
    type: 'push',
    name: 'KeyIdentity Push Token',
    description: 'Confirm authentication requests on your Smartphone with the Authenticator app',
    icon: 'screen_lock_portrait',
  },
  {
    type: 'qr',
    name: 'KeyIdentity QR Token',
    description: 'Use the Authenticator app to scan QR code authentication requests.',
    icon: 'all_out',
  },
];

export const unknownTokenType: TokenType = {
  type: 'unknown',
  name: 'Unkown Token',
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
