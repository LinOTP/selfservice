import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie';

@Injectable()
export class AuthService {
  private _loginChangeEmitter: EventEmitter<boolean> = new EventEmitter();

  private baseUrl = `/userservice/`;
  private endpoints = {
    login: 'login',
    logout: 'logout'
  };

  options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  constructor(private http: HttpClient, private cookieService: CookieService) {
  }

  login(username: string, password: string): Observable<boolean> {
    const params = `login=${username}&password=${password}`;
    return this.http.post<{ result: { status: boolean, value: boolean } }>(this.baseUrl + this.endpoints.login, params, this.options)
      .map((response) => response && response.result && response.result.value === true)
      .pipe(
        tap(result => console.log(`login request finished`)),
        tap(result => this._loginChangeEmitter.emit(result)),
        catchError(this.handleError('login', false))
      );

  }

  logout() {
    return this.http.get<any>(this.baseUrl + this.endpoints.logout)
      .pipe(
        tap(tokens => console.log(`logout request finished`)),
        catchError(this.handleError('logout', false))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

  /*
   * TODO: Make a request to the backend to check wheither the cookie
   *       is still valid or not and convert function to an Observable
   *       to keep a channel open for later
   */
  isLoggedIn(): boolean {
    const session = this.getSession();
    return !!session;
  }

  getSession(): string {
    return this.cookieService.get('user_selfservice');
  }

  get loginChangeEmitter(): Observable<boolean> {
    return this._loginChangeEmitter.asObservable();
  }

}
