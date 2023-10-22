import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { merge, Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, startWith, switchMap, tap } from 'rxjs/operators';

import { HistoryField, HistoryPage, HistoryRecord, HistoryRequestOptions, SortOrder } from '@api/history';
import { HistoryService } from '@api/history.service';
import { FormControl, FormGroup } from '@angular/forms';

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
  public searchColumns: readonly HistoryColumn[] = ['action', 'serial', 'tokentype', 'action_detail'];
  public columnNameMapping = {
    date: $localize`Date`,
    action: $localize`Action`,
    success: $localize`Success`,
    serial: $localize`Serial`,
    tokentype: $localize`Token type`,
    action_detail: $localize`Details`,
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public queryForm = new FormGroup({
    searchTerm: new FormControl(''),
    column: new FormControl<HistoryColumn>('action')
  });

  public queryTrigger$ = merge(this.queryForm.get('searchTerm').valueChanges.pipe(debounceTime(500), distinctUntilChanged()), 
  // delay(0) is needed to prevent calling loadHistory() with changes from the previous value
  this.queryForm.get('column').valueChanges.pipe(delay(0),distinctUntilChanged())
  )

  public get searchIsDirty() {
    return this.queryForm.value.column !== 'action'
      || this.queryForm.value.searchTerm !== '';
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

  clearSearch() {
    this.queryForm.patchValue({
      searchTerm: '',
      column: 'action'
    });
  }

  loadHistory(): Observable<HistoryPage> {
    const options: HistoryRequestOptions = {
      page: this.paginator.pageIndex,
      recordCount: this.paginator.pageSize,
      sortBy: <HistoryField>this.sort.active,
      sortOrder: <SortOrder>this.sort.direction,
      query: this.queryForm.value.searchTerm,
      queryType: <HistoryField>this.queryForm.value.column,
    };

    return this.historyService.getHistory(options).pipe(
      filter(history => !!history),
      tap(history => {
        this.dataSource = history.pageRecords;
      }));
  }

}
