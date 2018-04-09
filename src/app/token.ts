export class Token {
  enrollmentStatus: EnrollmentStatus

  constructor(
    public id: number,
    public serial: string,
    public type: string,
    public description?: string
  ) { }

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

