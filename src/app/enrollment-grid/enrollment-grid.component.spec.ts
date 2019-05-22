import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { EnrollmentGridComponent } from './enrollment-grid.component';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs/internal/observable/of';
import { NotificationService } from '../common/notification.service';
import { spyOnClass } from '../../testing/spyOnClass';
import { MatDialog } from '@angular/material';
import { TokenTypeDetails } from '../api/token';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { Fixtures } from '../../testing/fixtures';

describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;
  let notificationService: NotificationService;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let tokenUpdateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
      ],
      declarations: [
        EnrollmentGridComponent,
        NgxPermissionsAllowStubDirective,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        { provide: MatDialog, useValue: spyOnClass(MatDialog) }

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentGridComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.get(NotificationService);
    matDialog = TestBed.get(MatDialog);
    tokenUpdateSpy = spyOn(component.tokenUpdate, 'next');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the hotp dialog and  call the notification service if completed', fakeAsync(() => {
    generateHotpScenario(true);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledTimes(1);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should not notify the user if the enrollment was cancelled', fakeAsync(() => {
    generateHotpScenario(false);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(notificationService.message).not.toHaveBeenCalled();
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should open the push dialog and trigger the token list updater', fakeAsync(() => {
    matDialog.open.and.returnValue({ afterClosed: () => of({}) });

    const testToken: TokenTypeDetails = Fixtures.pushTokenType;
    component.startEnrollment(testToken);
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  function generateHotpScenario(returnValue: boolean) {
    matDialog.open.and.returnValue({ afterClosed: () => of({ result: returnValue }) });

    const testToken: TokenTypeDetails = Fixtures.hmacTokenType;
    component.startEnrollment(testToken);
  }
});
