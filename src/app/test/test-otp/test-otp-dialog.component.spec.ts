import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { TestService, TestOptions } from '../../api/test.service';

import { TestOTPDialogComponent } from './test-otp-dialog.component';

class Page extends TestingPage<TestOTPDialogComponent> {

  public getSubmitButton() {
    return this.query('[type="submit"]');
  }
}

const successfulDetail = { transactionid: 'id', replyMode: ['offline'] };

describe('TestOTPDialogComponent', () => {
  let component: TestOTPDialogComponent;
  let fixture: ComponentFixture<TestOTPDialogComponent>;
  let testService: jasmine.SpyObj<TestService>;
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
          provide: MAT_DIALOG_DATA,
          useValue: { token: token },
        },
        {
          provide: TestService,
          useValue: spyOnClass(TestService),
        },
        I18nMock,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    testService = TestBed.get(TestService);
  });

  it('should start in untested state if a transaction detail was received', () => {
    testService.testToken.and.returnValue(of(successfulDetail));

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.state).toBe(component.TestState.UNTESTED);
  });

  it('should start in failure state if a transaction detail was not received', () => {
    testService.testToken.and.returnValue(of(null));

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.state).toBe(component.TestState.FAILURE);
  });


  it('should call the backend with the token\'s serial on init', () => {
    testService.testToken.and.returnValue(of(successfulDetail));

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const options = { serial: token.serial };
    expect(testService.testToken).toHaveBeenCalledWith(options);
  });

  describe('submit', () => {
    it('should call token service to test token if form is valid', async(() => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const otp = '123456';

      testService.testToken.and.returnValue(of(true));
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      component.submit();
      const options: TestOptions = { serial: token.serial, otp: otp, transactionid: 'id' };
      expect(testService.testToken).toHaveBeenCalledWith(options);
    }));

    it('should not call token service to test token if form is invalid', async(() => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      testService.testToken.calls.reset();

      component.formGroup.reset();
      fixture.detectChanges();
      expect(component.state).toBe(component.TestState.UNTESTED);

      component.submit();
      expect(testService.testToken).not.toHaveBeenCalled();
      expect(component.state).toBe(component.TestState.UNTESTED);
    }));

    it('should set component to success state if test succeeds', () => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const otp = '123456';
      testService.testToken.and.returnValue(of(true));
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      component.submit();
      expect(component.state).toEqual(component.TestState.SUCCESS);
    });

    it('should set component to failure state if test fails', () => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const otp = '123456';
      testService.testToken.and.returnValue(of(false));
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      component.submit();
      expect(component.state).toEqual(component.TestState.FAILURE);
    });
  });

  describe('reset', () => {
    it('should reset form', () => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.formGroup.setValue({ 'otp': 'otp' });
      fixture.detectChanges();

      component.reset();
      expect(component.formGroup.untouched).toBe(true);
      expect(component.formGroup.pristine).toBe(true);
    });

    it('should set component to untested state and call the token test again', () => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.state = component.TestState.SUCCESS;

      testService.testToken.calls.reset();
      component.reset();
      fixture.detectChanges();

      expect(testService.testToken).toHaveBeenCalled();
      expect(component.state).toBe(component.TestState.UNTESTED);
    });

    it('should make form pristine', () => {
      testService.testToken.and.returnValue(of(successfulDetail));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.formGroup.setValue({ 'otp': 'otp' });
      fixture.detectChanges();

      component.reset();
      expect(component.formGroup.pristine).toBe(true);
    });
  });
});
