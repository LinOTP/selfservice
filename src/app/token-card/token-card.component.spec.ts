import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Fixtures } from '../../testing/fixtures';
import { spyOnClass } from '../../testing/spyOnClass';
import { TestingPage } from '../../testing/page-helper';

import { of } from 'rxjs/internal/observable/of';

import { MatDialog } from '@angular/material';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { TokenCardComponent } from './token-card.component';
import { MaterialModule } from '../material.module';
import { NotificationService } from '../core/notification.service';
import { TokenService } from '../token.service';

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


    it('Should delete the token if confirmed', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(true) });

      component.token = Fixtures.activeHotpToken;
      component.delete();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(tokenService.deleteToken).toHaveBeenCalledWith(Fixtures.activeHotpToken.serial);
    }));

    it('Should not delete the token if confirmation is cancelled', fakeAsync(() => {
      matDialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.delete();
      tick();

      expect(matDialog.open).toHaveBeenCalledTimes(1);
      expect(tokenService.deleteToken).not.toHaveBeenCalled();
    }));

  });

});
