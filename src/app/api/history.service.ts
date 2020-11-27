import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { HistoryRequestOptions, HistoryPage, HistoryResponse, mapCellToRecord } from './history';
import { NotificationService } from '../common/notification.service';


@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private notificationService: NotificationService,
  ) { }

  getHistory(options: HistoryRequestOptions): Observable<HistoryPage> {
    const url = '/userservice/history';
    const params = {
      session: this.sessionService.getSession(),
      page: `${options.page + 1}`, // because the backend starts counting at 1
      rp: `${options.recordCount}`,
      sortname: options.sortBy,
      sortorder: options.sortOrder,
      query: options.query,
      qtype: options.queryType
    };

    return this.http.get<HistoryResponse>(url, { params: params }).pipe(
      map(res => {
        return {
          page: (<number>res.page) - 1, // because the backend starts counting at 1
          totalRecords: res.total,
          pageRecords: res.rows.map(row => mapCellToRecord(row.cell)),
        };
      }),
      catchError(this.handleError($localize`fetching history failed`, null))
    );
  }

  handleError<T>(message, result?: T) {
    return (error: any): Observable<T> => {
      this.notificationService.message($localize`Error: ${message}. Please try again`);
      return of(result as T);
    };
  }
}
