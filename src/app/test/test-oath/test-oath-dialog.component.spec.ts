import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { TestService } from '../../api/test.service';
import { NotificationService } from '../../common/notification.service';

import { TestOATHDialogComponent } from './test-oath-dialog.component';

class Page extends TestingPage<TestOATHDialogComponent> {

  public getSubmitButton() {
    return this.query('[type="submit"]');
  }
}

describe('TestOTPDialogComponent', () => {
  let component: TestOATHDialogComponent;
  let fixture: ComponentFixture<TestOATHDialogComponent>;
  let testService: jasmine.SpyObj<TestService>;
  const token = Fixtures.activeHotpToken;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [TestOATHDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { token: token },
        },
        {
          provide: TestService,
          useValue: spyOnClass(TestService),
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService),
        },
        I18nMock,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    testService = TestBed.get(TestService);

    fixture = TestBed.createComponent(TestOATHDialogComponent);
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
      testService.testToken.and.returnValue(of(true));
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      component.submit();
      expect(testService.testToken).toHaveBeenCalledWith(token.serial, otp);
    }));

    it('should not call token service to test token if form is invalid', async(() => {
      component.formGroup.reset();
      fixture.detectChanges();
      expect(component.state).toBe(component.TestState.UNTESTED);

      component.submit();
      expect(testService.testToken).not.toHaveBeenCalled();
      expect(component.state).toBe(component.TestState.UNTESTED);
    }));

    it('should set component to success state if test succeeds', () => {
      const otp = '123456';
      testService.testToken.and.returnValue(of(true));
      component.formGroup.setValue({ 'otp': otp });
      fixture.detectChanges();

      component.submit();
      expect(component.state).toEqual(component.TestState.SUCCESS);
    });

    it('should set component to failure state if test fails', () => {
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
      component.formGroup.setValue({ 'otp': 'otp' });
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
      component.formGroup.setValue({ 'otp': 'otp' });
      fixture.detectChanges();

      component.reset();
      expect(component.formGroup.pristine).toBe(true);
    });
  });
});
