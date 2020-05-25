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


