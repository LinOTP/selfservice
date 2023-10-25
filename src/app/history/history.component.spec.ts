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

import { delay } from 'rxjs/operators';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let historyService: jasmine.SpyObj<HistoryService>;

  describe('loadHistory', () => {
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

    it('should call the history service to load the history', fakeAsync(() => {
      component.loadHistory();
      tick();

      const options: HistoryRequestOptions = {
        page: component.page,
        recordCount: component.pageSize,
        sortBy: component.sort.active as HistoryField,
        sortOrder: component.sort.direction as SortOrder,
        query: component.queryForm.value.searchTerm + "%",
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

    it('submitSearch should set the page index to 0 and reload history', fakeAsync(() => {
      component.changePage({ pageIndex: 3, pageSize: component.pageSize });
      fixture.detectChanges();
      component.queryForm.get('column').patchValue('serial');
      tick(0);
      expect(component.page).toEqual(0);
      expect(historyService.getHistory).toHaveBeenCalled();
    }));
  });

  describe("component tests", () => {
    let historyProvider: HistoryProviderMock
    let cut: HistoryComponent

    beforeEach(() => {
      historyProvider = new HistoryProviderMock()
      cut = new HistoryComponent(historyProvider as any)
    })

    it("should correctly set loading and loaded states", fakeAsync(() => {
      expect(cut.loading).toBeFalse()
      expect(cut.loaded).toBeFalse()
      cut.ngOnInit()
      expect(cut.loading).toBeTrue()
      expect(cut.loaded).toBeFalse()
      tick(10)
      expect(cut.loading).toBeFalse()
      expect(cut.loaded).toBeTrue()
    }))

    it("should load data on page change", fakeAsync(() => {
      expect(cut.page).toBe(0)
      cut.ngOnInit()
      tick(10)
      historyProvider.options = undefined

      cut.changePage({ pageIndex: 1, pageSize: cut.pageSize })
      tick(10)
      expect(historyProvider.options.page).toEqual(1)
    }))
    it("should load data on page size change", fakeAsync(() => {
      cut.ngOnInit()
      tick(10)
      expect(cut.pageSize).toBe(10)

      cut.changePage({ pageIndex: 0, pageSize: 20 })
      tick(10)

      expect(cut.pageSize).toBe(20)
    }));

    it("should change page to 0 on page size change", fakeAsync(() => {
      cut.ngOnInit()
      tick(10)
      expect(cut.page).toBe(0)

      cut.changePage({ pageIndex: 1, pageSize: 20 })
      tick(10)

      expect(cut.page).toBe(0)
    }))

    it("should change page to 0 on sort change", fakeAsync(() => {
      cut.ngOnInit()
      tick(10)
      cut.changePage({ pageIndex: 1, pageSize: 10 })
      tick(10)
      expect(cut.page).toBe(1)

      cut.changeSort({ active: "serial", direction: "asc" })
      tick(10)

      expect(cut.page).toBe(0)
    }))

    it("should change to 0 on search", fakeAsync(() => {
      cut.ngOnInit()
      tick(10)
      cut.changePage({ pageIndex: 1, pageSize: 10 })
      tick(10)
      expect(cut.page).toBe(1)

      cut.queryForm.get("searchTerm").patchValue("test")
      tick(510)

      expect(cut.page).toBe(0)
    }))

    it("should not make request on column change if search term is empty", fakeAsync(() => {
      cut.ngOnInit()
      tick(10)
      cut.changePage({ pageIndex: 1, pageSize: 10 })
      tick(10)
      expect(cut.page).toBe(1)

      spyOn(historyProvider, "getHistory")
      cut.queryForm.get("column").patchValue("serial")
      tick(10)

      expect(historyProvider.getHistory).not.toHaveBeenCalled()
    }))
  })

  describe("Template tests", () => {

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
            useClass: HistoryProviderMock
          },
        ],
        imports: [MaterialModule, ReactiveFormsModule],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(HistoryComponent);
      component = fixture.componentInstance;
    });

    it("should show loading spinner", fakeAsync(() => {
      fixture.detectChanges()
      let spinner = fixture.nativeElement.querySelector("mat-spinner")
      let table = fixture.nativeElement.querySelector("table")
      let paginator = fixture.nativeElement.querySelector("mat-paginator")
      expect(spinner).toBeTruthy()
      expect(table).toBeFalsy()
      expect(paginator).toBeFalsy()
      tick(10)
      fixture.detectChanges()
      spinner = fixture.nativeElement.querySelector("mat-spinner")
      table = fixture.nativeElement.querySelector("table")
      paginator = fixture.nativeElement.querySelector("mat-paginator")
      expect(spinner).toBeFalsy()
      expect(table).toBeTruthy()
      expect(paginator).toBeTruthy()
    }))

    it("should show progress bar when loading more data", fakeAsync(() => {
      fixture.detectChanges()
      tick(10)
      fixture.detectChanges()
      let progressBar = fixture.nativeElement.querySelector("mat-progress-bar")
      expect(progressBar.style.visibility).toBe("hidden")

      component.loading = true
      fixture.detectChanges()
      progressBar = fixture.nativeElement.querySelector("mat-progress-bar")
      expect(progressBar.style.visibility).toBe("visible")
    }))

  })

});

class HistoryProviderMock {
  options: HistoryRequestOptions | undefined
  getHistory(options: HistoryRequestOptions) {
    this.options = options
    return of({ ...HistoryFixtures.mockPage, page: options.page }).pipe(delay(5))
  }
}