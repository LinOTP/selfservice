
export interface TokenType {
  type: string;
  name: string;
  description: string;
}

export const tokenTypes: TokenType[] = [
  {
    type: 'hmac',
    name: 'HOTP-Token',
    description: 'Event-based soft token (HOTP)'
  },
  {
    type: 'totp',
    name: 'TOTP-Token',
    description: 'Time-based soft token (TOTP)'
  },
  {
    type: 'push',
    name: 'Push-Token',
    description: 'KeyIdentity Push Token'
  },
];

export const unknownTokenType: TokenType = {
  type: 'unknown',
  name: 'Unkown Token',
  description: ''
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
