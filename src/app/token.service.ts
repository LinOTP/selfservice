
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/reduce';
import { catchError, tap } from 'rxjs/operators';

import { Token } from './token';
import { AuthService } from './auth.service';

@Injectable()
export class TokenService {
  private baseUrl = `/api/userservice/`;
  private endpoints = {
    tokens: 'usertokenlist',
    setpin: 'setpin'
  };

  private options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  private mapTokenResponse = (res: { result: { value: any[] } }) => {
    //TODO: Catch API Errors
        return res.result.value.map(token => {
          return new Token(
            token['LinOtp.TokenId'],
            token['LinOtp.TokenType'],
            token['LinOtp.TokenDesc']
          );
        });
  }

  getTokens(): Observable<Token[]> {
    return this.http.get<any>(`${this.baseUrl + this.endpoints.tokens}`, { params: { session: this.authService.getSession() } })
      .map(this.mapTokenResponse)
      .pipe(
        tap(tokens => console.log(`tokens fetched`)),
        catchError(this.handleError('getTokens', []))
      );
  }

  getToken(id: string): Observable<Token> {
    return this.getTokens()
      .map(
        tokens => tokens.find(t => t.id === id)
      );
  }

  setPin(id, pin) {
    const body = `userpin=${pin}&serial=${id}&session=${this.authService.getSession()}`;
    return this.http.post(this.baseUrl + this.endpoints.setpin, body, this.options)
      .pipe(
        tap(tokens => console.log(`pin set`)),
        catchError(this.handleError('setTokenPin', null))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

}
