import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { Subscription, merge } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs/operators';

import { FormControl, FormGroup } from '@angular/forms';
import { HistoryField, HistoryPage, HistoryRecord, HistoryRequestOptions, SortOrder } from '@api/history';
import { HistoryService } from '@api/history.service';

const historyColumns = ['success', 'date', 'action', 'serial', 'tokentype', 'action_detail', 'info'] as const;
type HistoryColumn = typeof historyColumns[number];

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    standalone: false
})
export class HistoryComponent implements OnInit, OnDestroy {
  loading = false;
  loaded = false;

  public columnsToDisplay: readonly HistoryColumn[] = historyColumns;
  public searchColumns: readonly HistoryColumn[] = ['action', 'serial', 'tokentype', 'action_detail'];
  public columnNameMapping = {
    date: $localize`Date`,
    action: $localize`Action`,
    success: $localize`Success`,
    serial: $localize`Serial`,
    tokentype: $localize`Token type`,
    action_detail: $localize`Details`,
    info: 'Info'
  };

  public queryForm = new FormGroup({
    searchTerm: new FormControl(''),
    column: new FormControl<HistoryColumn>('action')
  });

  private _history: HistoryPage | undefined
  get dataSource(): HistoryRecord[] {
    return this._history?.pageRecords ?? [];
  }
  get totalRecords(): number {
    return this._history?.totalRecords ?? 0;
  }

  private _requestedPage = 0
  private _loadedPage = 0
  get page() {
    return this._loadedPage
  }
  pageSize = 10

  sort: Sort = {
    active: 'date',
    direction: 'desc'
  }

  public get searchIsDirty() {
    return this.queryForm.value.searchTerm !== '';
  }

  private subscription: Subscription = new Subscription();

  constructor(
    private historyService: HistoryService,
  ) { }

  ngOnInit(): void {
    this.loadHistory();
    const searchTermChange$ = this.queryForm.get('searchTerm').valueChanges.pipe(debounceTime(500), distinctUntilChanged())
    const filterValueChange$ = this.queryForm.get('column').valueChanges.pipe(delay(0), distinctUntilChanged(), filter(() => {
      return !!this.queryForm.value.searchTerm
    }))
    const formChanges$ = merge(searchTermChange$, filterValueChange$).pipe(
      switchMap(() => {
        this._requestedPage = 0
        return this.getHistory()
      })
    )
    this.subscription.add(formChanges$.subscribe())
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  changeSort(sort: Sort) {
    this.sort = sort
    this._requestedPage = 0
    this.loadHistory()
  }

  changePage(event: Pick<PageEvent, "pageIndex" | "pageSize">) {
    this._requestedPage = event.pageSize === this.pageSize ? event.pageIndex : 0
    this.pageSize = event.pageSize
    this.loadHistory()
  }

  private getHistory() {
    const options: HistoryRequestOptions = {
      page: this._requestedPage,
      recordCount: this.pageSize,
      sortBy: <HistoryField>this.sort.active,
      sortOrder: <SortOrder>this.sort.direction,
      query: this.queryForm.value.searchTerm + '%',
      queryType: <HistoryField>this.queryForm.value.column,
    };

    this.loading = true;
    return this.historyService.getHistory(options).pipe(
      filter(history => !!history),
      tap(history => {
        this._history = history;
        this._loadedPage = history.page;
      }),
      finalize(() => {
        this.loading = false;
        this.loaded = true;
      })
    )
  }

  loadHistory() {
    this.getHistory().subscribe()
  }

}
