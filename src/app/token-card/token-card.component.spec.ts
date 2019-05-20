import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Fixtures } from '../../testing/fixtures';
import { spyOnClass } from '../../testing/spyOnClass';
import { TestingPage } from '../../testing/page-helper';

import { of } from 'rxjs/internal/observable/of';

import { MatDialog } from '@angular/material';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { TokenCardComponent } from './token-card.component';
import { MaterialModule } from '../material.module';
import { NotificationService } from '../common/notification.service';
import { TokenService } from '../api/token.service';
import { Permission, ModifyTokenPermissions } from '../common/permissions';
import { EnrollmentStatus } from '../api/token';
import { ActivatePushDialogComponent } from '../activate/activate-push/activate-push-dialog.component';
import { componentNeedsResolution } from '@angular/core/src/metadata/resource_loading';

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
  let tokenService: jasmine.SpyObj<TokenService>;

  let page: Page;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
      ],
      declarations: [
        TokenCardComponent,
        NgxPermissionsAllowStubDirective,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService)
        },
        { provide: MatDialog, useValue: spyOnClass(MatDialog) }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenCardComponent);
    component = fixture.componentInstance;
    component.token = Fixtures.activeHotpToken;

    notificationService = TestBed.get(NotificationService);
    tokenService = TestBed.get(TokenService);
    tokenService.deleteToken.and.returnValue(of({}));
    matDialog = TestBed.get(MatDialog);

    fixture.detectChanges();

    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the token as a card', () => {
    component.token = Fixtures.activeHotpToken;
    fixture.detectChanges();

    expect(page.header.innerText).toEqual(component.token.typeDetails.name);
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

      const updateSpy = spyOn(component.tokenUpdate, 'next');

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(updateSpy).toHaveBeenCalledTimes(1);
    }));


    it('should delete the token if confirmed', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(tokenService.deleteToken).toHaveBeenCalledWith(Fixtures.activeHotpToken.serial);
    }));

    it('should not delete the token if confirmation is cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.delete();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(tokenService.deleteToken).not.toHaveBeenCalled();
    }));
  });

  describe('enable', () => {

    it('should notify user after success and emit token list update', fakeAsync(() => {
      tokenService.enable.and.returnValue(of(true));
      const updateSpy = spyOn(component.tokenUpdate, 'next');

      component.token = Fixtures.inactiveHotpToken;
      component.enable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Token enabled');
      expect(updateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should notify user after failure and not emit token list update', fakeAsync(() => {
      tokenService.enable.and.returnValue(of(false));
      const updateSpy = spyOn(component.tokenUpdate, 'next');

      component.token = Fixtures.inactiveHotpToken;
      component.enable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Error: Could not enable token');
      expect(updateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('disable', () => {

    it('should notify user after success and emit token list update', fakeAsync(() => {
      tokenService.disable.and.returnValue(of(true));
      const updateSpy = spyOn(component.tokenUpdate, 'next');

      component.token = Fixtures.activeHotpToken;
      component.disable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Token disabled');
      expect(updateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should notify user after failure and not emit token list update', fakeAsync(() => {
      tokenService.disable.and.returnValue(of(false));
      const updateSpy = spyOn(component.tokenUpdate, 'next');

      component.token = Fixtures.activeHotpToken;
      component.disable();
      tick();

      expect(notificationService.message).toHaveBeenCalledWith('Error: Could not disable token');
      expect(updateSpy).not.toHaveBeenCalled();
    }));
  });

  describe('activate', () => {
    it('should open a token activation dialog', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of({}) });
      const expectedDialogConfig = {
        width: '850px',
        autoFocus: false,
        disableClose: true,
        data: Fixtures.pairedPushToken.serial
      };

      component.token = Fixtures.pairedPushToken;
      component.activate();
      tick();

      expect(matDialog.open).toHaveBeenCalledWith(ActivatePushDialogComponent, expectedDialogConfig);
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
    it('should be true if token is unpaired', () => {
      component.token = Fixtures.unpairedPushToken;
      expect(component.pendingDelete()).toEqual(true);
    });

    it('should be false if token has been activated ', () => {
      component.token = Fixtures.completedPushToken;
      expect(component.pendingDelete()).toEqual(false);
    });
  });

  describe('pendingActivate', () => {
    it('should be true if token is paired', () => {
      component.token = Fixtures.pairedPushToken;
      expect(component.pendingActivate()).toEqual(true);
    });

    it('should be false if token is not in paired state', () => {
      component.token = Fixtures.completedPushToken;
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
});
