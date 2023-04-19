import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { MaterialModule } from '@app/material.module';

import { HistoryService } from '@api/history.service';
import { HistoryComponent } from './history.component';
import { spyOnClass, getInjectedStub } from '@testing/spyOnClass';
import { HistoryFixtures } from '@testing/fixtures';
import { of } from 'rxjs';
import { MockPipe } from '@testing/mock-pipe';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryField, HistoryRequestOptions, SortOrder } from '@api/history';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let historyService: jasmine.SpyObj<HistoryService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        HistoryComponent,
        NgxPermissionsAllowStubDirective,
        MockPipe(DatePipe),
      ],
      providers: [
        {
          provide: HistoryService,
          useValue: spyOnClass(HistoryService)
        },
      ],
      imports: [
        MaterialModule,
        FormsModule,
      ]
    })
      .compileComponents();
    historyService = getInjectedStub(HistoryService);
  });

  beforeEach(() => {
    historyService.getHistory.and.returnValue(of(HistoryFixtures.mockPage));
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadHistory', () => {
    it('should call the history service to load the history', fakeAsync(() => {
      component.loadHistory();
      tick();

      const options: HistoryRequestOptions = {
        page: component.paginator.pageIndex,
        recordCount: component.paginator.pageSize,
        sortBy: component.sort.active as HistoryField,
        sortOrder: component.sort.direction as SortOrder,
        query: component.queryForm.searchTerm,
        queryType: component.queryForm.column as HistoryField,
      };
      expect(historyService.getHistory).toHaveBeenCalledWith(options);

      expect(component.paginator.pageIndex).toEqual(HistoryFixtures.mockPage.page);
      expect(component.paginator.pageSize).toEqual(HistoryFixtures.mockPage.pageRecords.length);
    }));
  });

  it('submitSearch should set the page index to 0 and reload history', () => {
    component.paginator.pageIndex = 3;
    fixture.detectChanges();
    component.submitSearch();
    expect(component.paginator.pageIndex).toEqual(0);
    expect(historyService.getHistory).toHaveBeenCalled();
  });

  it('clearSearch should set the query to an empty string and reload history', () => {
    component.queryForm.searchTerm = 'test';
    component.queryForm.column = component.searchColumns[2];

    fixture.detectChanges();

    component.clearSearch();

    expect(component.queryForm.searchTerm).toEqual('');
    expect(component.queryForm.column).toEqual('action');
    expect(historyService.getHistory).toHaveBeenCalled();
  });

});
