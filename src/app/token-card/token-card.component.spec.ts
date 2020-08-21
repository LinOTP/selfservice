import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { of } from 'rxjs/internal/observable/of';

import { Fixtures } from '../../testing/fixtures';
import { spyOnClass } from '../../testing/spyOnClass';
import { TestingPage } from '../../testing/page-helper';
import { I18nMock } from '../../testing/i18n-mock-provider';

import { MaterialModule } from '../material.module';
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';
import { NotificationService } from '../common/notification.service';
import { Permission, ModifyTokenPermissions } from '../common/permissions';
import { OperationsService } from '../api/operations.service';
import { EnrollmentStatus } from '../api/token';

import { ActivateDialogComponent } from '../activate/activate-dialog.component';
import { TestDialogComponent } from '../test/test-dialog.component';
import { TokenCardComponent } from './token-card.component';
import { DialogComponent } from '../common/dialog/dialog.component';

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
  let tokenUpdateSpy: jasmine.Spy;

  let page: Page;
  let expectedDialogConfig;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      declarations: [
        TokenCardComponent,
        NgxPermissionsAllowStubDirective,
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
        I18nMock,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenCardComponent);
    component = fixture.componentInstance;
    component.token = Fixtures.activeHotpToken;

    notificationService = TestBed.get(NotificationService);
    operationsService = TestBed.get(OperationsService);
    operationsService.deleteToken.and.returnValue(of({}));
    matDialog = TestBed.get(MatDialog);
    tokenUpdateSpy = spyOn(component.tokenUpdate, 'next');

    fixture.detectChanges();

    page = new Page(fixture);
    expectedDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { token: component.token },
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the token as a card', () => {
    component.token = Fixtures.activeHotpToken;
    fixture.detectChanges();
    const capitalizePipe = new CapitalizePipe();

    expect(page.header.innerText).toEqual(capitalizePipe.transform(component.token.typeDetails.name));
    expect(page.subheader.innerText).toEqual(component.token.description);
  });

  it('should load permissions', () => {
    expect(component.Permission).toBe(Permission);
    expect(component.ModifyTokenPermissions).toBe(ModifyTokenPermissions);
  });

  it('should load enrollment status', () => {
    expect(component.EnrollmentStatus).toBe(EnrollmentStatus);
  });

  describe('set token pin', () => {

    it('should set pin of token and notify user after success', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.setPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('PIN set');
    }));

    it('should not notify user if set pin was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.token = Fixtures.activeHotpToken;
      component.setPin();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

  describe('set mOTP token pin', () => {

    it('should set mOTP pin of an mOTP token and notify user after success', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeMotpToken;
      component.setMOTPPin();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('mOTP PIN set');
    }));

    it('should not notify user if set pin was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.token = Fixtures.activeMotpToken;
      component.setMOTPPin();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

  describe('token deletion', () => {

    it('should notify user of deletion', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Token deleted');
    }));

    it('should not notify user if deletion is cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

    it('should issue an update event after deletion', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));


    it('should delete the token if confirmed', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(operationsService.deleteToken).toHaveBeenCalledWith(Fixtures.activeHotpToken.serial);
    }));

    it('should not delete the token if confirmation is cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.delete();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(operationsService.deleteToken).not.toHaveBeenCalled();
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

    it('should notify user after failure and not emit token list update', fakeAsync(() => {
      operationsService.enable.and.returnValue(of(false));

      component.token = Fixtures.inactiveHotpToken;
      component.enable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Error: Could not enable token');
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('disable', () => {

    it('should notify user after success and emit token list update', fakeAsync(() => {
      operationsService.disable.and.returnValue(of(true));

      component.token = Fixtures.activeHotpToken;
      component.disable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Token disabled');
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should notify user after failure and not emit token list update', fakeAsync(() => {
      operationsService.disable.and.returnValue(of(false));

      component.token = Fixtures.activeHotpToken;
      component.disable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Error: Could not disable token');
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('unassign token', () => {
    const config = {
      width: '35em',
      data:
      {
        title: 'Unassign token?',
        text: 'You won\'t be able to use this token to authenticate yourself anymore.',
        confirmationLabel: 'unassign'
      }
    };

    it('should notify user of successful unassignment', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });
      operationsService.unassignToken.and.returnValue(of(true));

      component.token = Fixtures.activeHotpToken;
      component.unassign();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, config);
      expect(operationsService.unassignToken).toHaveBeenCalledWith(Fixtures.activeHotpToken.serial);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Token unassigned');
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should notify user of failed unassignment', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });
      operationsService.unassignToken.and.returnValue(of(false));

      component.token = Fixtures.activeHotpToken;
      component.unassign();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, config);
      expect(operationsService.unassignToken).toHaveBeenCalledWith(Fixtures.activeHotpToken.serial);
      expect(notificationService.message).toHaveBeenCalled();
      expect(tokenUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not notify user if unassignment is cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.token = Fixtures.activeHotpToken;
      component.unassign();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(DialogComponent, config);
      expect(notificationService.message).not.toHaveBeenCalled();
      expect(tokenUpdateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('activate', () => {
    it('should open a Push token activation dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) });
      expectedDialogConfig.data.token = Fixtures.pairedPushToken;
      expectedDialogConfig.data.activate = true;

      component.token = Fixtures.pairedPushToken;
      component.activate();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(ActivateDialogComponent, expectedDialogConfig);
    }));

    it('should open a Push token activation dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) });
      expectedDialogConfig.data.token = Fixtures.pairedQRToken;
      expectedDialogConfig.data.activate = true;

      component.token = Fixtures.pairedQRToken;
      component.activate();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(ActivateDialogComponent, expectedDialogConfig);
    }));
  });

  describe('pendingActions', () => {
    it('should be true if activation is pending', () => {
      component.token = Fixtures.pairedPushToken;
      expect(component.pendingActions()).toEqual(true);
    });

    it('should be true if token is unpaired', () => {
      component.token = Fixtures.unpairedPushToken;
      expect(component.pendingActions()).toEqual(true);
    });

    it('should be false if the token has been activated', () => {
      component.token = Fixtures.completedPushToken;
      expect(component.pendingActions()).toEqual(false);
    });
  });


  describe('pendingDelete', () => {
    it('should be true if push token is unpaired', () => {
      component.token = Fixtures.unpairedPushToken;
      expect(component.pendingDelete()).toEqual(true);
    });

    it('should be true if QR token is unpaired', () => {
      component.token = Fixtures.unpairedQRToken;
      expect(component.pendingDelete()).toEqual(true);
    });

    it('should be false if push token has been activated ', () => {
      component.token = Fixtures.completedPushToken;
      expect(component.pendingDelete()).toEqual(false);
    });

    it('should be false if QR token has been activated ', () => {
      component.token = Fixtures.completedQRToken;
      expect(component.pendingDelete()).toEqual(false);
    });
  });

  describe('pendingActivate', () => {
    it('should be true if push token is paired', () => {
      component.token = Fixtures.pairedPushToken;
      expect(component.pendingActivate()).toEqual(true);
    });

    it('should be true if QR token is paired', () => {
      component.token = Fixtures.pairedQRToken;
      expect(component.pendingActivate()).toEqual(true);
    });

    it('should be false if push token is not in paired state', () => {
      component.token = Fixtures.completedPushToken;
      expect(component.pendingActivate()).toEqual(false);
    });

    it('should be false if QR token is not in paired state', () => {
      component.token = Fixtures.completedQRToken;
      expect(component.pendingActivate()).toEqual(false);
    });
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
    it('should open the TestOTPDialogComponent', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) });
      component.token = Fixtures.activeHotpToken;
      fixture.detectChanges();

      const expectedConfig = {
        width: '850px',
        autoFocus: false,
        disableClose: true,
        data: { token: component.token },
      };

      component.testToken();

      expect(matDialog.open).toHaveBeenCalledWith(TestDialogComponent, expectedConfig);
      expect(tokenUpdateSpy).toHaveBeenCalled();
    }));
  });

  describe('resetFailcounter', () => {

    it('should display a success message if failcounter is reset', () => {
      operationsService.resetFailcounter.and.returnValue(of(true));
      const message = 'Failcounter successfully reset';

      component.resetFailcounter();

      expect(operationsService.resetFailcounter).toHaveBeenCalledWith(component.token.serial);
      expect(notificationService.message).toHaveBeenCalledWith(message);
    });

    it('should display a failure message if failcounter could not be reset', () => {
      operationsService.resetFailcounter.and.returnValue(of(false));
      const message = 'Error: could not reset failcounter. Please try again or contact your administrator.';

      component.resetFailcounter();

      expect(operationsService.resetFailcounter).toHaveBeenCalledWith(component.token.serial);
      expect(notificationService.message).toHaveBeenCalledWith(message);
    });
  });

  describe('resync', () => {

    it('should display a success message if token is synchronized', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.resync();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Token synchronized');
    }));

    it('should not notify user if resync was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.token = Fixtures.activeHotpToken;
      component.resync();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

  describe('setDescription', () => {

    it('should display a success message if token description is set and reload the token list', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.setDescription();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledTimes(1);
      expect(notificationService.message).toHaveBeenCalledWith('Description changed');
      expect(component.tokenUpdate.next).toHaveBeenCalled();
    }));

    it('should not notify user if resync was cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.token = Fixtures.activeHotpToken;
      component.setDescription();
      tick();

      expect(notificationService.message).not.toHaveBeenCalled();
    }));

  });

});
