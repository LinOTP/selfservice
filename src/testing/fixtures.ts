import { Token } from '../app/token';

export class Fixtures {

  static get activeHotpToken(): Token {
    return new Token(1, 'Active-Hotp-Token-Serial', 'hotp', 'Description');
  }

  static get activePushToken(): Token {
    return new Token(2, 'Active-PushToken-Serial', 'push', 'Description');
  }

  static get tokens(): Token[] {
    return [
      this.activeHotpToken,
      this.activePushToken,
    ];
  }

}
