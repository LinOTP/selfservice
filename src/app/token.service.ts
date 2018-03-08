
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/take';
import { catchError, tap } from 'rxjs/operators';

import { Token, EnrollToken } from './token';
import { AuthService } from './auth.service';

@Injectable()
export class TokenService {
  private baseUrl = `/api/userservice/`;
  private endpoints = {
    tokens: 'usertokenlist',
    setpin: 'setpin',
    delete: 'delete',
    enroll: 'enroll',
  };

  private options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  private mapTokenResponse = (res: { result: { value: any[] } }) => {
    // TODO: Catch API Errors
    return res.result.value.map(token => {
      return new Token(
        token['LinOtp.TokenId'],
        token['LinOtp.TokenSerialnumber'],
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

  getToken(id: number): Observable<Token> {
    return this.getTokens()
      .map(
        tokens => tokens.find(t => t.id === id)
      );
  }

  deleteToken(serial: string): Observable<any> {
    const body = `serial=${serial}&session=${this.authService.getSession()}`;
    return this.http.post<any>(this.baseUrl + this.endpoints.delete, body, this.options)
      .pipe(
        tap(response => console.log(`token ${serial} deleted`)),
        catchError(this.handleError('deleteToken', null))
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

  enroll(params: EnrollToken) {
    const body = { ...params, session: this.authService.getSession() };

    return this.http.post(this.baseUrl + this.endpoints.enroll, body)
      .pipe(
        tap(token => console.log(`token enrolled`)),
        catchError(this.handleError('enroll token', null))
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

@Injectable()
export class TokenListResolver implements Resolve<Token[]> {
  constructor(private ts: TokenService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Token[]> {
    return this.ts.getTokens().take(1);
  }
}

@Injectable()
export class TokenDetailResolver implements Resolve<Token> {
  constructor(private ts: TokenService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Token> {
    const id = Number(route.paramMap.get('id'));

    return this.ts.getToken(id).take(1).map(token => {
      if (token) {
        return token;
      } else { // id not found
        this.router.navigate(['/tokens']);
        return null;
      }
    });
  }
}
