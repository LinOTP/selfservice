export class Token {
  id: string;
  type: string;
  description: string;

  constructor(id: string, type: string, description: string) {
    this.id = id;
    this.type = type;
    this.description = description;
  }
}
