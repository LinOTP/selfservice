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
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';
import { TokenService } from '../api/token.service';
import { EnrollHotpDialogComponent } from '../enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { TestOTPDialogComponent } from '../test/test-otp/test-otp-dialog.component';

describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;
  let notificationService: NotificationService;
  let tokenService: jasmine.SpyObj<TokenService>;
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
        CapitalizePipe,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
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
    tokenService = TestBed.get(TokenService);
    matDialog = TestBed.get(MatDialog);
    tokenUpdateSpy = spyOn(component.tokenUpdate, 'next');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the hotp dialog and update the token list when completed', fakeAsync(() => {
    const token = Fixtures.activeHotpToken;
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { closeLabel: 'Test token' },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: token
    };
    matDialog.open.and.returnValues({ afterClosed: () => of(token.serial) }, { afterClosed: () => of(true) });
    tokenService.getToken.and.returnValue(of(token));
    component.openHotpDialog();
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(EnrollHotpDialogComponent, expectedEnrollDialogConfig);
    expect(tokenService.getToken).toHaveBeenCalledWith(token.serial);
    expect(matDialog.open).toHaveBeenCalledWith(TestOTPDialogComponent, expectedTestDialogConfig);
    expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should notify the user if there was an issue retrieving the token before the test', fakeAsync(() => {
    const token = Fixtures.activeHotpToken;
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { closeLabel: 'Test token' },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: token
    };
    matDialog.open.and.returnValue({ afterClosed: () => of('serial') });
    tokenService.getToken.and.returnValue(of(null));
    component.openHotpDialog();
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(notificationService.message).toHaveBeenCalledWith('There was a problem starting the token test, please try manually later.');
    expect(tokenUpdateSpy).not.toHaveBeenCalled();
  }));

  it('should not notify the user if the enrollment was cancelled', fakeAsync(() => {
    const token = Fixtures.activeHotpToken;
    const expectedEnrollDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { closeLabel: 'Test token' },
    };
    const expectedTestDialogConfig = {
      width: '650px',
      data: token
    };
    matDialog.open.and.returnValue({ afterClosed: () => of(null) });
    component.openHotpDialog();
    tick();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
    expect(notificationService.message).not.toHaveBeenCalled();
    expect(tokenUpdateSpy).not.toHaveBeenCalled();
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
