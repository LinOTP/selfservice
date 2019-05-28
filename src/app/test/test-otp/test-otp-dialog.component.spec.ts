import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { NotificationService } from '../../common/notification.service';

import { TestOTPDialogComponent } from './test-otp-dialog.component';

class Page extends TestingPage<TestOTPDialogComponent> {

  public getSubmitButton() {
    return this.query('[type="submit"]');
  }
}

describe('TestOTPDialogComponent', () => {
  let component: TestOTPDialogComponent;
  let fixture: ComponentFixture<TestOTPDialogComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  const token = Fixtures.activeHotpToken;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [TestOTPDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: token
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    tokenService = TestBed.get(TokenService);

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in untested state', () => {
    expect(component.state).toBe(component.TestState.UNTESTED);
  });

  describe('submit', () => {
    it('should call token service to test token if form is valid', async(() => {
      const otp = '123456';
      tokenService.testToken.and.returnValue(of(true));
      component.formGroup.setValue({ 'otp': otp, 'pin': otp });
      fixture.detectChanges();

      component.submit();
      expect(tokenService.testToken).toHaveBeenCalledWith(token.serial, otp, otp);
    }));

    it('should not call token service to test token if form is invalid', async(() => {
      component.formGroup.reset();
      fixture.detectChanges();
      expect(component.state).toBe(component.TestState.UNTESTED);

      component.submit();
      expect(tokenService.testToken).not.toHaveBeenCalled();
      expect(component.state).toBe(component.TestState.UNTESTED);
    }));

    it('should set component to success state if test succeeds', () => {
      const otp = '123456';
      tokenService.testToken.and.returnValue(of(true));
      component.formGroup.setValue({ 'otp': otp, 'pin': otp });
      fixture.detectChanges();

      component.submit();
      expect(component.state).toEqual(component.TestState.SUCCESS);
    });

    it('should set component to failure state if test fails', () => {
      const otp = '123456';
      tokenService.testToken.and.returnValue(of(false));
      component.formGroup.setValue({ 'otp': otp, 'pin': otp });
      fixture.detectChanges();

      component.submit();
      expect(component.state).toEqual(component.TestState.FAILURE);
    });
  });

  describe('reset', () => {
    it('should reset form', () => {
      component.formGroup.setValue({ 'otp': 'otp', 'pin': 'pin' });
      fixture.detectChanges();

      component.reset();
      expect(component.formGroup.untouched).toBe(true);
      expect(component.formGroup.pristine).toBe(true);
    });

    it('should set component to untested state', () => {
      component.state = component.TestState.SUCCESS;
      component.reset();
      expect(component.state).toBe(component.TestState.UNTESTED);
    });

    it('should make form pristine', () => {
      component.formGroup.setValue({ 'otp': 'otp', 'pin': 'pin' });
      fixture.detectChanges();

      component.reset();
      expect(component.formGroup.pristine).toBe(true);
    });
  });
});
