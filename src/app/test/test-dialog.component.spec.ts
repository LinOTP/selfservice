import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of, Observable, Observer } from 'rxjs';

import { Fixtures } from '../../testing/fixtures';
import { TestingPage } from '../../testing/page-helper';
import { spyOnClass } from '../../testing/spyOnClass';
import { I18nMock } from '../../testing/i18n-mock-provider';
import { MockComponent } from '../../testing/mock-component';

import { MaterialModule } from '../material.module';
import { TestService, TestOptions, ReplyMode } from '../api/test.service';

import { TestDialogComponent } from './test-dialog.component';

class Page extends TestingPage<TestDialogComponent> {

  public getSubmitButton() {
    return this.query('[type="submit"]');
  }
}

const challengeOnlyDetail = { reply_mode: ['offline'] };
const successfulOfflineDetail = { transactionid: 'id', reply_mode: ['offline'] };
const successfulOnlineDetail = { transactionid: 'id', reply_mode: ['online'] };

describe('TestDialogComponent', () => {
  let component: TestDialogComponent;
  let fixture: ComponentFixture<TestDialogComponent>;
  let testService: jasmine.SpyObj<TestService>;
  const token = Fixtures.activeHotpToken;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        TestDialogComponent,
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
        I18nMock,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    testService = TestBed.get(TestService);
  });

  it('should start in untested state if a transaction detail was received', () => {
    testService.testToken.and.returnValue(of(successfulOfflineDetail));

    fixture = TestBed.createComponent(TestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.state).toBe(component.TestState.UNTESTED);
  });

  it('should check transaction state on init if the token supports online mode', () => {
    testService.testToken.and.returnValue(of(successfulOnlineDetail));
    testService.statusPoll.and.returnValue(new Observable(() => { }));

    fixture = TestBed.createComponent(TestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(testService.statusPoll).toHaveBeenCalled();
    expect(component.state).toBe(component.TestState.UNTESTED);
  });

  it('should start in failure state if a transaction detail was not received', () => {
    testService.testToken.and.returnValue(of(null));

    fixture = TestBed.createComponent(TestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.state).toBe(component.TestState.FAILURE);
  });


  it('should call the backend with the token\'s serial on init', () => {
    testService.testToken.and.returnValue(of(successfulOfflineDetail));

    fixture = TestBed.createComponent(TestDialogComponent);
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

      testService.statusPoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestDialogComponent);
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

      testService.statusPoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestDialogComponent);
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

      testService.statusPoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestDialogComponent);
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

      testService.statusPoll.and.returnValue(new Observable(observer => {
        challPollObserver = observer;
      }));

      fixture = TestBed.createComponent(TestDialogComponent);
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
      testService.testToken.and.returnValue(of(challengeOnlyDetail));

      fixture = TestBed.createComponent(TestDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const otp = '123456';

      testService.testToken.and.returnValue(of(true));
      testService.testToken.calls.reset();
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      component.submit();
      const options: TestOptions = { serial: token.serial, otp: otp, transactionid: undefined };
      expect(testService.testToken).toHaveBeenCalledWith(options);
    }));

    it('should not call token service to test token if form is invalid', async(() => {
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

      fixture = TestBed.createComponent(TestDialogComponent);
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

      fixture = TestBed.createComponent(TestDialogComponent);
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

      fixture = TestBed.createComponent(TestDialogComponent);
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
      testService.statusPoll.and.returnValue(new Observable(() => { }));

      fixture = TestBed.createComponent(TestDialogComponent);
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

      fixture = TestBed.createComponent(TestDialogComponent);
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

      fixture = TestBed.createComponent(TestDialogComponent);
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

      fixture = TestBed.createComponent(TestDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.formGroup.setValue({ 'otp': 'otp' });
      fixture.detectChanges();

      component.reset();
      expect(component.formGroup.pristine).toBe(true);
    });

    it('should set showInputField to false', () => {
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

      fixture = TestBed.createComponent(TestDialogComponent);
      component = fixture.componentInstance;
      expect(component.showInputField).toEqual(false);

      component.showInput();
      expect(component.showInputField).toEqual(true);

      fixture.detectChanges();

      component.reset();
      expect(component.showInputField).toEqual(false);
    });
  });

  describe('showInput', () => {
    it('should set showInputField to true', () => {
      testService.testToken.and.returnValue(of(successfulOfflineDetail));

      fixture = TestBed.createComponent(TestDialogComponent);
      component = fixture.componentInstance;
      expect(component.showInputField).toEqual(false);

      component.showInput();
      expect(component.showInputField).toEqual(true);
    });
  });
});
