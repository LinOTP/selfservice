import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of, Subscription, Observable, Observer } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';
import { MockComponent } from '../../../testing/mock-component';

import { MaterialModule } from '../../material.module';
import { TestService, TestOptions, ReplyMode } from '../../api/test.service';

import { TestOTPDialogComponent } from './test-otp-dialog.component';
import { EnrollmentService } from '../../api/enrollment.service';

class Page extends TestingPage<TestOTPDialogComponent> {

  public getSubmitButton() {
    return this.query('[type="submit"]');
  }
}

const successfulOfflineDetail = { transactionid: 'id', reply_mode: ['offline'] };
const successfulOnlineDetail = { transactionid: 'id', reply_mode: ['online'] };

describe('TestOTPDialogComponent', () => {
  let component: TestOTPDialogComponent;
  let fixture: ComponentFixture<TestOTPDialogComponent>;
  let testService: jasmine.SpyObj<TestService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  const token = Fixtures.activeHotpToken;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        TestOTPDialogComponent,
        MockComponent({ selector: 'app-qr-code', inputs: ['qrUrl'] }),
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { token: token },
        },
        {
          provide: TestService,
          useValue: spyOnClass(TestService),
        },
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService),
        },
        I18nMock,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    testService = TestBed.get(TestService);
    enrollmentService = TestBed.get(EnrollmentService);
  });

  it('should start in untested state if a transaction detail was received', () => {
    testService.testToken.and.returnValue(of(successfulOfflineDetail));

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.state).toBe(component.TestState.UNTESTED);
  });

  it('should check transaction state on init if the token supports online mode', () => {
    testService.testToken.and.returnValue(of(successfulOnlineDetail));
    enrollmentService.challengePoll.and.returnValue(of({ valid_tan: false }));

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(enrollmentService.challengePoll).toHaveBeenCalled();
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
    testService.testToken.and.returnValue(of(successfulOfflineDetail));

    fixture = TestBed.createComponent(TestOTPDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const options = { serial: token.serial };
    expect(testService.testToken).toHaveBeenCalledWith(options);
  });

  describe('checkTransactionState', () => {
    it('should poll the backend and go to success status if it receives a valid tan', fakeAsync(() => {
      testService.testToken.and.returnValue(of(successfulOnlineDetail));

      let challPollObserver: Observer<any>;

      enrollmentService.challengePoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      component.state = component.TestState.UNTESTED;
      component.transactionDetail = {
        transactionid: 'foo',
        reply_mode: [ReplyMode.ONLINE],
      };

      component.checkTransactionState();

      challPollObserver.next({ valid_tan: true });
      tick();

      expect(component.state).toBe(component.TestState.SUCCESS);
    }));

    it('should poll the backend and go to success status if it receives an accept', fakeAsync(() => {
      testService.testToken.and.returnValue(of(successfulOnlineDetail));

      let challPollObserver: Observer<any>;

      enrollmentService.challengePoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      component.state = component.TestState.UNTESTED;
      component.transactionDetail = {
        transactionid: 'foo',
        reply_mode: [ReplyMode.ONLINE],
      };

      component.checkTransactionState();

      challPollObserver.next({ accept: true });
      tick();

      expect(component.state).toBe(component.TestState.SUCCESS);
    }));

    it('should poll the backend and go to success status if it receives a reject', fakeAsync(() => {
      testService.testToken.and.returnValue(of(successfulOnlineDetail));

      let challPollObserver: Observer<any>;

      enrollmentService.challengePoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      component.state = component.TestState.UNTESTED;
      component.transactionDetail = {
        transactionid: 'foo',
        reply_mode: [ReplyMode.ONLINE],
      };

      component.checkTransactionState();

      challPollObserver.next({ reject: true });
      tick();

      expect(component.state).toBe(component.TestState.SUCCESS);
    }));

    it('should poll the backend and go to failure status if it receives an unsuccessful reply', fakeAsync(() => {
      testService.testToken.and.returnValue(of(successfulOnlineDetail));

      let challPollObserver: Observer<any>;

      enrollmentService.challengePoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      component.state = component.TestState.UNTESTED;
      component.transactionDetail = {
        transactionid: 'foo',
        reply_mode: [ReplyMode.ONLINE],
      };

      component.checkTransactionState();

      challPollObserver.next({ valid_tan: false, accept: false, reject: false });
      tick();

      expect(component.state).toBe(component.TestState.FAILURE);
    }));
  });

  describe('submit', () => {
    it('should call token service to test token if form is valid', async(() => {
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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

    it('should call unsubscribe on existing subscription', () => {
      testService.testToken.and.returnValues(of(successfulOnlineDetail), of(false));
      enrollmentService.challengePoll.and.returnValue(new Observable(() => { }));

      fixture = TestBed.createComponent(TestOTPDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const otp = '123456';
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      (component as any).pollingSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);

      component.submit();

      expect((component as any).pollingSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset form', () => {
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

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
