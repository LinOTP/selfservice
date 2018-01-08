
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Token } from './token';

@Injectable()
export class TokenService {
  private tokensUrl = '/api/tokens/';

  constructor(private http: HttpClient) {
  }

  getTokens(): Observable<Token[]> {
    return this.http.get<Token[]>(this.tokensUrl)
      .pipe(
      tap(tokens => console.log(`tokens fetched`)),
      catchError(this.handleError('getTokens', []))
      );
  }

  setPin(id, currentPin, newPin) {
    const body = {
      'pin': {
        'currentValue': currentPin,
        'newValue': newPin
      }
    };
    return this.http.put(this.tokensUrl + id + '/pin', body)
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
