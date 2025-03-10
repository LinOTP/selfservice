import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

import { Fixtures } from '@testing/fixtures';
import { TestingPage } from '@testing/page-helper';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { OperationsService } from '@api/operations.service';
import { EnrollmentStatus, SelfserviceToken } from '@api/token';
import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { TestDialogComponent } from '@app/test/test-dialog.component';
import { NotificationService } from '@common/notification.service';
import { ModifyTokenPermissions, Permission } from '@common/permissions';
import { CapitalizePipe } from '@common/pipes/capitalize.pipe';
import { ResyncDialogComponent } from '@common/resync-dialog/resync-dialog.component';
import { SetDescriptionDialogComponent } from '@common/set-description-dialog/set-description-dialog.component';
import { SetMOTPPinDialogComponent } from '@common/set-motp-pin-dialog/set-motp-pin-dialog.component';
import { SetPinDialogComponent } from '@common/set-pin-dialog/set-pin-dialog.component';

import { LockableTokenActionsService } from '@app/common/lockable-token-dialogs.service';
import { TokenVerifyCheckService } from '@app/token-list/token-verify-check.service';
import { TokenCardComponent } from './token-card.component';
import { QueryList } from "@angular/core";
import { MatMenuItem } from "@angular/material/menu";

class Page extends TestingPage<TokenCardComponent> {

  get header() { return this.query('mat-card-title'); }
  get subheader() { return this.query('mat-card-subtitle'); }

  openMenu() {
    this.query('mat-card-header button.mat-icon-button').click();
  }

}

describe('TokenCardComponent', () => {
  let component: TokenCardComponent;
  let fixture: ComponentFixture<TokenCardComponent>;

  let notificationService: jasmine.SpyObj<NotificationService>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let operationsService: jasmine.SpyObj<OperationsService>;
  let loginService: jasmine.SpyObj<LoginService>;
  const hasPermissionSubject = new BehaviorSubject(true);
  let tokenUpdateSpy: jasmine.Spy;
  let page: Page;
  let expectedDialogConfig;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NgxPermissionsAllowStubDirective,
      ],
      declarations: [
        TokenCardComponent,
        CapitalizePipe,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService)
        },
        {
          provide: MatDialog,
          useValue: spyOnClass(MatDialog)
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService),
        },
        {
          provide: TokenVerifyCheckService,
          useValue: {
            init: () => { },
            isVerificationRequiredForToken: () => false
          }
        }

      ]
    }).overrideComponent(TokenCardComponent, {
      set: {
        providers: [
          {
            provide: LockableTokenActionsService,
            useValue: new LockableTokenActionsServiceStub()
          }
        ]
      }
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenCardComponent);
    component = fixture.componentInstance;
    component.token = Fixtures.activePushToken;

    notificationService = getInjectedStub(NotificationService);
    operationsService = getInjectedStub(OperationsService);
    operationsService.deleteToken.and.returnValue(of(false));
    loginService = getInjectedStub(LoginService);
    loginService.hasPermission$.and.returnValue(hasPermissionSubject.asObservable());
    matDialog = getInjectedStub(MatDialog);
    tokenUpdateSpy = spyOn(component.tokenUpdate, 'next');

    fixture.detectChanges();

    page = new Page(fixture);
    expectedDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { serial: component.token.serial, type: component.token.typeDetails.type },
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from permission subscriptions on component destroy', () => {
    expect((component as any).subscriptions.length).toEqual(2);
    const activeSubscriptions: Subscription[] = [...(component as any).subscriptions];
    expect(activeSubscriptions[0].closed).toEqual(false);
    expect(activeSubscriptions[1].closed).toEqual(false);

    component.ngOnDestroy();

    expect((component as any).subscriptions.length).toEqual(0);
    expect(activeSubscriptions[0].closed).toEqual(true);
    expect(activeSubscriptions[1].closed).toEqual(true);
  });

  it('should mark the token as synchronizable if it is a HOTP or TOTP token', () => {
    [Fixtures.activeHotpToken, Fixtures.activeTotpToken].forEach(token => {

      fixture = TestBed.createComponent(TokenCardComponent);
      component = fixture.componentInstance;
      component.token = token;
      fixture.detectChanges();
      expect(component.isSynchronizeable).toEqual(true);
    });
  });

  it('should mark the token as non-synchronizable if it is not a HOTP or TOTP token', () => {
    [
      Fixtures.activeEmailToken,
      Fixtures.activeSMSToken,
      Fixtures.activeYubicoToken,
      Fixtures.activeYubikeyToken,
      Fixtures.activeMotpToken,
      Fixtures.activePasswordToken,
      Fixtures.activePushToken,
      Fixtures.activeQRToken,
    ].forEach(token => {
      fixture = TestBed.createComponent(TokenCardComponent);
      component = fixture.componentInstance;
      component.token = token;
      fixture.detectChanges();
      expect(component.isSynchronizeable).not.toEqual(true);
    });
  });

  it('renders the token as a card', () => {
    component.token = Fixtures.activeHotpToken;
    fixture.detectChanges();
    const capitalizePipe = new CapitalizePipe();

    expect(page.header.innerText).toEqual(capitalizePipe.transform(component.token.typeDetails.name));
    expect(page.subheader.innerText).toEqual(component.token.description);
  });

  it('menuHasItems should emit true when menu items are present and false when no menu items are present', fakeAsync(() => {
    const filledList: QueryList<MatMenuItem> = new QueryList();
    filledList.reset([{} as any]);
    const emptyList: QueryList<MatMenuItem> = new QueryList();
    emptyList.reset([]);
    component.menuItems = filledList;
    tick(0);
    component.menuHasItems.subscribe(hasItems => {
      expect(hasItems).toBe(true);
    });
    component.menuItems = emptyList;
    tick(0);
    component.menuHasItems.subscribe(hasItems => {
      expect(hasItems).toBe(false);
    });
    flush()
  }));

  it('should load permissions', () => {
    expect(component.Permission).toBe(Permission);
    expect(component.ModifyTokenPermissions).toBe(ModifyTokenPermissions);
  });

  it('should load enrollment status', () => {
    expect(component.EnrollmentStatus).toBe(EnrollmentStatus);
  });

  describe('set token pin', () => {

    it('should set pin of token and notify user after success', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<SetPinDialogComponent>);

      component.token = Fixtures.activeHotpToken;
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('PIN set');
    }));

    it('should not notify user if set pin was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<SetPinDialogComponent>);

      component.token = Fixtures.activeHotpToken;
      component.setPin();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

  describe('set mOTP token pin', () => {

    it('should set mOTP pin of an mOTP token and notify user after success', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<SetMOTPPinDialogComponent>);

      component.token = Fixtures.activeMotpToken;
      component.setMOTPPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('mOTP PIN set');
    }));

    it('should not notify user if set pin was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<SetMOTPPinDialogComponent>);

      component.token = Fixtures.activeMotpToken;
      component.setMOTPPin();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

  describe('token deletion', () => {

    it('should notify user of deletion', fakeAsync(() => {
      getLockableTokenActionsService(component).getDeleteConfirmation = () => of(true);

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Token deleted');
    }));

    it('should not notify user if deletion is cancelled', fakeAsync(() => {
      getLockableTokenActionsService(component).getDeleteConfirmation = () => of(false);

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

    it('should issue an update event after deletion', fakeAsync(() => {
      getLockableTokenActionsService(component).getDeleteConfirmation = () => of(true);

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('enable', () => {

    it('should notify user after success and emit token list update', fakeAsync(() => {
      operationsService.enable.and.returnValue(of(true));

      component.token = Fixtures.inactiveHotpToken;
      component.enable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Token enabled');
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not emit token list update after failure', fakeAsync(() => {
      operationsService.enable.and.returnValue(of(false));

      component.token = Fixtures.inactiveHotpToken;
      component.enable();
      tick();

      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('disable', () => {

    it('should notify user after success and emit token list update', fakeAsync(() => {
      hasPermissionSubject.next(true);
      getLockableTokenActionsService(component).getDisableConfirmation = () => of(true);
      component.token = Fixtures.activeHotpToken;
      tick();

      component.disable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Token disabled');
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not emit token list update after failure', fakeAsync(() => {
      hasPermissionSubject.next(true);
      getLockableTokenActionsService(component).getDisableConfirmation = () => of(false);
      component.token = Fixtures.activeHotpToken;
      tick();

      component.disable();
      tick();

      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));

    it('without enable permissions should disable if the user confirmed the action', fakeAsync(() => {
      hasPermissionSubject.next(false);
      getLockableTokenActionsService(component).getDisableConfirmation = () => of(true);
      component.token = Fixtures.activeHotpToken;
      tick();

      component.disable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Token disabled');
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('without enable permissions should not disable if the user did not confirmed the action', fakeAsync(() => {
      hasPermissionSubject.next(false);
      getLockableTokenActionsService(component).getDisableConfirmation = () => of(false);
      component.token = Fixtures.activeHotpToken;
      tick();

      component.disable();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));

  });

  describe('unassign token', () => {
    it('should notify user of successful unassignment', fakeAsync(() => {
      getLockableTokenActionsService(component).getUnassignConfirmation = () => of(true);

      component.token = Fixtures.activeHotpToken;
      component.unassign();
      tick();

      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Token unassigned');
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not update token list on failed unassignment', fakeAsync(() => {
      getLockableTokenActionsService(component).getUnassignConfirmation = () => of(false);

      component.token = Fixtures.activeHotpToken;
      component.unassign();
      tick();

      expect(tokenUpdateSpy).toHaveBeenCalledTimes(0);
    }));

    it('should not notify user if unassignment is cancelled', fakeAsync(() => {
      getLockableTokenActionsService(component).getUnassignConfirmation = () => of(false);

      component.token = Fixtures.activeHotpToken;
      component.unassign();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('activate', () => {
    it('should open a Push token activation dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<ActivateDialogComponent>);
      expectedDialogConfig.data.serial = Fixtures.pairedPushToken.serial;
      expectedDialogConfig.data.type = Fixtures.pairedPushToken.typeDetails.type;
      expectedDialogConfig.data.token = Fixtures.pairedPushToken;

      component.token = Fixtures.pairedPushToken;
      component.activate();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(ActivateDialogComponent, expectedDialogConfig);
    }));

    it('should open a Push token activation dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<ActivateDialogComponent>);
      expectedDialogConfig.data.serial = Fixtures.pairedQRToken.serial;
      expectedDialogConfig.data.type = Fixtures.pairedQRToken.typeDetails.type;
      expectedDialogConfig.data.token = Fixtures.pairedQRToken;

      component.token = Fixtures.pairedQRToken;
      component.activate();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(ActivateDialogComponent, expectedDialogConfig);
    }));
  });

  describe('pendingActions', () => {
    it('should be true if activation is pending', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.pairedPushToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActions()).toEqual(true);
    }));

    it('should be false if token is unpaired', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.unpairedPushToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActions()).toEqual(false);
    }));

    it('should be false if the token has been activated', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.completedPushToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActions()).toEqual(false);
    }));

    it('should be false if the token activation permission is not granted', fakeAsync(() => {
      hasPermissionSubject.next(false);
      component.token = Fixtures.pairedPushToken;
      tick();

      expect(component.canActivate).toEqual(false);
      expect(component.pendingActions()).toEqual(false);
    }));
  });

  describe('pendingActivate', () => {
    it('should be true if push token is paired', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.pairedPushToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActivate()).toEqual(true);
    }));

    it('should be true if QR token is paired', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.pairedQRToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActivate()).toEqual(true);
    }));

    it('should be false if push token is not in paired state', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.completedPushToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActivate()).toEqual(false);
    }));

    it('should be false if QR token is not in paired state', fakeAsync(() => {
      hasPermissionSubject.next(true);
      component.token = Fixtures.completedQRToken;
      tick();

      expect(component.canActivate).toEqual(true);
      expect(component.pendingActivate()).toEqual(false);
    }));

    it('should be false if push token activation permission is not granted', fakeAsync(() => {
      hasPermissionSubject.next(false);
      component.token = Fixtures.pairedPushToken;
      tick();

      expect(component.canActivate).toEqual(false);
      expect(component.pendingActivate()).toEqual(false);
    }));

    it('should be false if QR token activation permission is not granted', fakeAsync(() => {
      hasPermissionSubject.next(false);
      component.token = Fixtures.pairedQRToken;
      tick();

      expect(component.canActivate).toEqual(false);
      expect(component.pendingActivate()).toEqual(false);
    }));
  });

  describe('isPush', () => {
    it('should be true if token is of type push', () => {
      component.token = Fixtures.completedPushToken;
      expect(component.isPush()).toEqual(true);
    });

    it('should be false if token is notof type push', () => {
      component.token = Fixtures.activeHotpToken;
      expect(component.isPush()).toEqual(false);
    });
  });

  describe('testToken', () => {
    it('should open the TestDialogComponent', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<TestDialogComponent>);
      component.token = Fixtures.activeHotpToken;
      fixture.detectChanges();

      const expectedConfig = {
        width: '850px',
        autoFocus: false,
        disableClose: true,
        data: { serial: component.token.serial, type: component.token.typeDetails.type, token: component.token },
      };

      component.testToken();

      expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedConfig);
    }));
  });

  describe('resetFailcounter', () => {

    it('should display a success message if failcounter is reset', () => {
      operationsService.resetFailcounter.and.returnValue(of(true));
      const message = 'Failcounter reset';

      component.resetFailcounter();

      expect(operationsService.resetFailcounter).toHaveBeenCalledWith(component.token.serial);
      expect(notificationService.message).toHaveBeenCalledWith(message);
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    });

    it('should not do anything if the failcounter could not be reset', () => {
      operationsService.resetFailcounter.and.returnValue(of(false));
      component.resetFailcounter();

      expect(operationsService.resetFailcounter).toHaveBeenCalledWith(component.token.serial);
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    });
  });

  describe('resync', () => {

    it('should display a success message if token is synchronized', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<ResyncDialogComponent>);

      component.token = Fixtures.activeHotpToken;
      component.resync();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Token synchronized');
    }));

    it('should not notify user if resync was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<ResyncDialogComponent>);

      component.token = Fixtures.activeHotpToken;
      component.resync();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

  describe('setDescription', () => {

    it('should display a success message if token description is set and reload the token list', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<SetDescriptionDialogComponent>);

      component.token = Fixtures.activeHotpToken;
      component.setDescription();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Description changed');
      expect(component.tokenUpdate.next).toHaveBeenCalled();
    }));

    it('should not notify user if resync was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<SetDescriptionDialogComponent>);

      component.token = Fixtures.activeHotpToken;
      component.setDescription();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

});


function getLockableTokenActionsService(component: TokenCardComponent): LockableTokenActionsService {
  return component['lockableTokenActionsService'] as LockableTokenActionsService;
}


class LockableTokenActionsServiceStub {

  getDisableConfirmation(token: SelfserviceToken, canEnable: boolean): Observable<any> {
    return of(true);
  }

  getDeleteConfirmation(token: SelfserviceToken): Observable<any> {
    return of(true);
  }

  getUnassignConfirmation(token: SelfserviceToken): Observable<any> {
    return of(true);
  }
}