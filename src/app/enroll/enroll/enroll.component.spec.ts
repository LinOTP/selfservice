import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';


import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { LoginService } from '@app/login/login.service';
import { NotificationService } from '@common/notification.service';

import { AssignTokenDialogComponent } from '@app/enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollEmailDialogComponent } from '@app/enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollMOTPDialogComponent } from '@app/enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollOATHDialogComponent } from '@app/enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollPasswordDialogComponent } from '@app/enroll/enroll-password-dialog/enroll-password-dialog.component';
import { EnrollPushQRDialogComponent } from '@app/enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { EnrollSMSDialogComponent } from '@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollYubicoDialogComponent } from '@app/enroll/enroll-yubico/enroll-yubico-dialog.component';
import { TokenListComponent } from '@app/token-list/token-list.component';

import { TokenType } from '@app/api/token';
import { BootstrapBreakpointService } from '@app/bootstrap-breakpoints.service';
import { EnrollComponent } from './enroll.component';

[
  {
    type: TokenType.HOTP,
    enrollmentComponent: EnrollOATHDialogComponent,
  },
  {
    type: TokenType.TOTP,
    enrollmentComponent: EnrollOATHDialogComponent,
  },
  {
    type: TokenType.MOTP,
    enrollmentComponent: EnrollMOTPDialogComponent,
  },
  {
    type: TokenType.PASSWORD,
    enrollmentComponent: EnrollPasswordDialogComponent,
  },
  {
    type: TokenType.PUSH,
    enrollmentComponent: EnrollPushQRDialogComponent,
  },
  {
    type: TokenType.QR,
    enrollmentComponent: EnrollPushQRDialogComponent,
  },
  {
    type: TokenType.SMS,
    enrollmentComponent: EnrollSMSDialogComponent,
  },
  {
    type: TokenType.EMAIL,
    enrollmentComponent: EnrollEmailDialogComponent,
  },
  {
    type: TokenType.YUBICO,
    enrollmentComponent: EnrollYubicoDialogComponent,
  },
  {
    type: 'assign',
    enrollmentComponent: AssignTokenDialogComponent,
  },
].forEach(tokenUnderTest =>
  describe(`EnrollComponent on navigate to /tokens/enroll/${tokenUnderTest.type}`, () => {
    let component: EnrollComponent;
    let fixture: ComponentFixture<EnrollComponent>;

    let notificationService: jasmine.SpyObj<NotificationService>;
    let loginService: jasmine.SpyObj<LoginService>;

    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([
            { path: 'tokens', component: TokenListComponent, },
            { path: 'tokens/enroll/:type', component: EnrollComponent, },
          ]),
        ],
        declarations: [
          EnrollComponent,
        ],
        providers: [
          {
            provide: NotificationService,
            useValue: spyOnClass(NotificationService)
          },
          {
            provide: MatDialog,
            useValue: spyOnClass(MatDialog),
          },
          {
            provide: LoginService,
            useValue: spyOnClass(LoginService),
          },
          {
            provide: ActivatedRoute,
            useValue: { params: of({ type: tokenUnderTest.type }) }
          },
          {
            provide: BootstrapBreakpointService,
            useValue: {
              breakpoint$: of(5),
              currentBreakpoint: 5
            }
          }
        ]
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(EnrollComponent);
      component = fixture.componentInstance;

      loginService = getInjectedStub(LoginService);
      notificationService = getInjectedStub(NotificationService);
      dialog = getInjectedStub(MatDialog);

      loginService.hasPermission$.and.returnValue(of(true));
    });

    it('should open the enrollment dialog and update the token list when completed', fakeAsync(() => {
      tick();
      dialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof tokenUnderTest.enrollmentComponent>);
      spyOn(component, 'leave');

      fixture.detectChanges();

      const expectedEnrollDialogConfig = {
        width: '850px',
        minWidth: '770px',
        autoFocus: false,
        disableClose: true,
        data: {
          tokenType: tokenUnderTest.type,
        },
      };

      tick();

      expect(dialog.open).toHaveBeenCalledWith(tokenUnderTest.enrollmentComponent, expectedEnrollDialogConfig);
      expect(notificationService.errorMessage).not.toHaveBeenCalled();
      expect(component.leave).toHaveBeenCalled();
    }));
  })
);

describe(`EnrollComponent on navigate to /tokens/enroll/someUnknownType`, () => {
  let component: EnrollComponent;
  let fixture: ComponentFixture<EnrollComponent>;

  let notificationService: jasmine.SpyObj<NotificationService>;

  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'tokens', component: TokenListComponent, },
          { path: 'tokens/enroll/:type', component: EnrollComponent, },
        ]),
      ],
      declarations: [
        EnrollComponent,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService)
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog),
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService),
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ type: 'someUnknownType' }) }
        },
        {
          provide: BootstrapBreakpointService,
          useValue: {
            breakpoint$: of(5),
            currentBreakpoint: 5
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollComponent);
    component = fixture.componentInstance;

    notificationService = getInjectedStub(NotificationService);
    dialog = getInjectedStub(MatDialog);

  });

  it('should not open the enrollment dialog nor update the token list, and notify the user', fakeAsync(() => {
    tick();
    spyOn(component, 'leave');

    fixture.detectChanges();

    tick();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: Cannot enroll token of unknown type "someUnknownType".');
    expect(component.leave).toHaveBeenCalled();
  }));
});

describe(`EnrollComponent on navigate to /tokens/enroll/yubikey`, () => {
  let component: EnrollComponent;
  let fixture: ComponentFixture<EnrollComponent>;

  let loginService: jasmine.SpyObj<LoginService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'tokens', component: TokenListComponent, },
          { path: 'tokens/enroll/:type', component: EnrollComponent, },
        ]),
      ],
      declarations: [
        EnrollComponent,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService)
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog),
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService),
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ type: TokenType.YUBIKEY }) }
        },
        {
          provide: BootstrapBreakpointService,
          useValue: {
            breakpoint$: of(5),
            currentBreakpoint: 5
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollComponent);
    component = fixture.componentInstance;

    loginService = getInjectedStub(LoginService);
    notificationService = getInjectedStub(NotificationService);
    dialog = getInjectedStub(MatDialog);

    loginService.hasPermission$.and.returnValue(of(true));
  });

  it('should not open the enrollment dialog nor update the token list, and notify the user', fakeAsync(() => {
    tick();
    spyOn(component, 'leave');

    fixture.detectChanges();

    tick();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(notificationService.errorMessage).toHaveBeenCalledWith('Error: The selected token type cannot be added at the moment.');
    expect(component.leave).toHaveBeenCalled();
  }));
});


[
  {
    type: TokenType.HOTP,
    enrollmentComponent: EnrollOATHDialogComponent,
  },
  {
    type: TokenType.TOTP,
    enrollmentComponent: EnrollOATHDialogComponent,
  },
  {
    type: TokenType.MOTP,
    enrollmentComponent: EnrollMOTPDialogComponent,
  },
  {
    type: TokenType.PASSWORD,
    enrollmentComponent: EnrollPasswordDialogComponent,
  },
  {
    type: TokenType.PUSH,
    enrollmentComponent: EnrollPushQRDialogComponent,
  },
  {
    type: TokenType.QR,
    enrollmentComponent: EnrollPushQRDialogComponent,
  },
  {
    type: TokenType.SMS,
    enrollmentComponent: EnrollSMSDialogComponent,
  },
  {
    type: TokenType.EMAIL,
    enrollmentComponent: EnrollEmailDialogComponent,
  },
  {
    type: TokenType.YUBICO,
    enrollmentComponent: EnrollYubicoDialogComponent,
  },
  {
    type: 'assign',
    enrollmentComponent: AssignTokenDialogComponent,
  },
].forEach(tokenUnderTest =>
  describe(`EnrollComponent on navigate to /tokens/enroll/${tokenUnderTest.type}`, () => {
    let component: EnrollComponent;
    let fixture: ComponentFixture<EnrollComponent>;

    let notificationService: jasmine.SpyObj<NotificationService>;
    let loginService: jasmine.SpyObj<LoginService>;

    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([
            { path: 'tokens', component: TokenListComponent, },
            { path: 'tokens/enroll/:type', component: EnrollComponent, },
          ]),
        ],
        declarations: [
          EnrollComponent,
        ],
        providers: [
          {
            provide: NotificationService,
            useValue: spyOnClass(NotificationService)
          },
          {
            provide: MatDialog,
            useValue: spyOnClass(MatDialog),
          },
          {
            provide: LoginService,
            useValue: spyOnClass(LoginService),
          },
          {
            provide: ActivatedRoute,
            useValue: { params: of({ type: tokenUnderTest.type }) }
          },
          {
            provide: BootstrapBreakpointService,
            useValue: {
              breakpoint$: of(5),
              currentBreakpoint: 5
            }
          }
        ]
      })
        .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(EnrollComponent);
      component = fixture.componentInstance;

      loginService = getInjectedStub(LoginService);
      notificationService = getInjectedStub(NotificationService);
      dialog = getInjectedStub(MatDialog);

      loginService.hasPermission$.and.returnValue(of(false));
    });

    it(`should not open the enrollment dialog and not update the token list if the user
        does not have the right enrollment permission`, fakeAsync(() => {
      tick();
      spyOn(component, 'leave');

      fixture.detectChanges();

      tick();

      expect(dialog.open).not.toHaveBeenCalled();
      expect(notificationService.errorMessage).toHaveBeenCalledWith(
        `Error: You are not allowed to enroll tokens of type "${tokenUnderTest.type}".`
      );
      expect(component.leave).toHaveBeenCalled();
    }));
  })
);
