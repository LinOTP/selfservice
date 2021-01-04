import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { HistoryService } from '../api/history.service';
import { HistoryRequestOptions, HistoryRecord, SortOrder, HistoryField, HistoryPage } from '../api/history';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable } from 'rxjs';
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

  public queryForm: {
    searchTerm: string,
    column: HistoryColumn
  } = {
      searchTerm: '',
      column: 'action'
    };

  public queryTrigger$ = new BehaviorSubject({ ...this.queryForm });

  public get searchIsDirty() {
    return this.queryTrigger$.value.column !== 'action'
      || this.queryTrigger$.value.searchTerm !== '';
  }
  public get searchFormIsDirty() {
    return this.queryForm.column !== this.queryTrigger$.value.column
      || this.queryForm.searchTerm !== this.queryTrigger$.value.searchTerm;
  }

  constructor(
    private historyService: HistoryService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit() {
    merge(
      this.paginator.page,
      this.sort.sortChange.pipe(
        tap(() => this.paginator.pageIndex = 0)
      ),
      this.queryTrigger$.pipe(
        tap(() => this.paginator.pageIndex = 0)
      ),
    ).pipe(
      startWith({}),
      switchMap(() => this.loadHistory())
    ).subscribe(history => {
      this.paginator.pageIndex = history.page;
      this.paginator.length = history.totalRecords;
      this.cdr.detectChanges();
    });
  }

  submitSearch() {
    this.queryTrigger$.next({ ...this.queryForm });
  }

  clearSearch() {
    this.queryForm = {
      searchTerm: '',
      column: 'action'
    };
    this.submitSearch();
  }

  loadHistory(): Observable<HistoryPage> {
    const options: HistoryRequestOptions = {
      page: this.paginator.pageIndex,
      recordCount: this.paginator.pageSize,
      sortBy: <HistoryField>this.sort.active,
      sortOrder: <SortOrder>this.sort.direction,
      query: this.queryTrigger$.value.searchTerm,
      queryType: <HistoryField>this.queryTrigger$.value.column,
    };

    return this.historyService.getHistory(options).pipe(
      filter(history => !!history),
      tap(history => {
        this.dataSource = history.pageRecords;
      }));
  }

}
