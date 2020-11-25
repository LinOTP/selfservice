import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { HistoryService } from '../api/history.service';
import { HistoryRequestOptions, HistoryRecord, SortOrder, HistoryField, HistoryPage } from '../api/history';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { startWith, switchMap, tap, filter } from 'rxjs/operators';

const historyColumns = ['success', 'date', 'action', 'serial', 'tokentype', 'action_detail', 'info'] as const;
type HistoryColumn = typeof historyColumns[number];

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements AfterViewInit {

  public dataSource: HistoryRecord[];
  public columnsToDisplay: readonly HistoryColumn[] = historyColumns;
  public searchColumns: readonly HistoryColumn[] = ['action', 'serial', 'tokentype', 'action_detail', 'info'];
  public columnNameMapping = {
    date: $localize`Date`,
    action: $localize`Action`,
    success: $localize`Success`,
    serial: $localize`Serial`,
    tokentype: $localize`Token type`,
    action_detail: $localize`Details`,
    info: $localize`Info`,
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public query = '';
  public queryType: HistoryColumn = 'action';
  public queryTrigger$ = new Subject();
  public lastSubmittedQuery = '';

  constructor(
    private historyService: HistoryService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit() {
    merge(
      this.paginator.page,
      this.sort.sortChange,
      this.queryTrigger$,
    ).pipe(
      startWith({}),
      switchMap(() => this.loadHistory())
    ).subscribe(history => {
      this.paginator.pageIndex = history.page;
      this.paginator.length = history.totalRecords;
      this.cdr.detectChanges();
    });

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
  }

  submitSearch() {
    this.paginator.pageIndex = 0;
    this.queryTrigger$.next();
  }

  clearSearch() {
    this.query = '';
    this.queryTrigger$.next();
  }

  loadHistory(): Observable<HistoryPage> {
    const options: HistoryRequestOptions = {
      page: this.paginator.pageIndex,
      recordCount: this.paginator.pageSize,
      sortBy: <HistoryField>this.sort.active,
      sortOrder: <SortOrder>this.sort.direction,
      query: this.query,
      queryType: <HistoryField>this.queryType,
    };
    this.lastSubmittedQuery = this.query;

    return this.historyService.getHistory(options).pipe(
      filter(history => !!history),
      tap(history => {
        this.dataSource = history.pageRecords;
      }));
  }

}
