import { DatePipe } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { of } from 'rxjs';

import { HistoryFixtures } from '@testing/fixtures';
import { MockPipe } from '@testing/mock-pipe';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { HistoryField, HistoryRequestOptions, SortOrder } from '@api/history';
import { HistoryService } from '@api/history.service';
import { MaterialModule } from '@app/material.module';

import { HistoryComponent } from './history.component';

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
          useValue: spyOnClass(HistoryService),
        },
      ],
      imports: [
        MaterialModule,
        ReactiveFormsModule
      ],
    }).compileComponents();
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
        page: component.page,
        recordCount: component.pageSize,
        sortBy: component.sort.active as HistoryField,
        sortOrder: component.sort.direction as SortOrder,
        query: component.queryForm.value.searchTerm,
        queryType: component.queryForm.value.column as HistoryField,
      };
      expect(historyService.getHistory).toHaveBeenCalledWith(options);

      expect(component.page).toEqual(
        HistoryFixtures.mockPage.page,
      );
      expect(component.pageSize).toEqual(
        HistoryFixtures.mockPage.pageRecords.length,
      );
    }));
  });

  it('submitSearch should set the page index to 0 and reload history', fakeAsync(() => {
    component.changePage({ pageIndex: 3, pageSize: component.pageSize });
    fixture.detectChanges();
    component.queryForm.get('column').patchValue('serial');
    tick(0);
    expect(component.page).toEqual(0);
    expect(historyService.getHistory).toHaveBeenCalled();
  }));

  it('clearSearch should set the query to an empty string and reload history', () => {
    component.queryForm.patchValue({
      searchTerm: 'test',
      column: component.searchColumns[2],
    });

    fixture.detectChanges();

    component.clearSearch();

    expect(component.queryForm.value.searchTerm).toEqual('');
    expect(component.queryForm.value.column).toEqual('action');
    expect(historyService.getHistory).toHaveBeenCalled();
  });
});
