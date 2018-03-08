export class Token {

  constructor(
    public id: number,
    public serial: string,
    public type: string,
    public description?: string
  ) { }

}

export interface EnrollToken {
  type: string;
  description: string;
}

