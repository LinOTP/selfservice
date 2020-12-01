import { Injectable } from '@angular/core';

import { CookieService } from 'ngx-cookie';

@Injectable()
export class SessionService {

  constructor(
    private cookieService: CookieService,
  ) { }

  /*
   * TODO: Make a request to the backend to check wheither the cookie
   *       is still valid or not and convert function to an Observable
   *       to keep a channel open for later
   */
  isLoggedIn(): boolean {
    return !!this.getSession() && !!localStorage.getItem('loginIsComplete');
  }

  getSession(): string {
    return this.cookieService.get('user_selfservice');
  }

}
