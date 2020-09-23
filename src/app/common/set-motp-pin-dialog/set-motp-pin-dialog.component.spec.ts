import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { OperationsService } from '../../api/operations.service';
import { NotificationService } from '../notification.service';

import { SetMOTPPinDialogComponent } from './set-motp-pin-dialog.component';

class Page extends TestingPage<SetMOTPPinDialogComponent> {

  public getDisabledSubmitButton() {
    return this.query('[type="submit"] [disabled]');
  }
}

describe('SetMOTPPinDialogComponent', () => {
  let component: SetMOTPPinDialogComponent;
  let fixture: ComponentFixture<SetMOTPPinDialogComponent>;
  let operationsService: OperationsService;
  let notificationService: NotificationService;
  const token = Fixtures.activeHotpToken;
  let page: Page;
  let matDialogRef: MatDialogRef<SetMOTPPinDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [SetMOTPPinDialogComponent],
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
          provide: OperationsService,
          useValue: spyOnClass(OperationsService),
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
    operationsService = TestBed.inject(OperationsService);
    notificationService = TestBed.inject(NotificationService);
    matDialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(SetMOTPPinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setMOTPPin and close dialog if pin values are equal on submit', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '1234' });
    fixture.detectChanges();
    operationsService.setMOTPPin = jasmine.createSpy('setMOTPPin').and.returnValue(of(true));

    component.submit();
    expect(operationsService.setMOTPPin).toHaveBeenCalledWith(token, '1234');
    expect(matDialogRef.close).toHaveBeenCalledWith(true);
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should not allow setting an empty pin', () => {
    component.form.setValue({ 'newPin': '', 'confirmPin': '' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setMOTPPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should display a notification message if submission fails', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '1234' });
    fixture.detectChanges();
    operationsService.setMOTPPin = jasmine.createSpy('setMOTPPin').and.returnValue(of(false));

    component.submit();
    expect(notificationService.message).toHaveBeenCalledWith('mOTP pin could not be set. Please try again.');
  });

  it('should not call setPin nor close dialog if pin values are different on submit', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setMOTPPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should not send backend request if pin values are different', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setMOTPPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should disable submit button if pin values are different', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    expect(page.getDisabledSubmitButton).not.toBeNull();
  });

  it('should disable submit button if pin is empty', () => {
    component.form.setValue({ 'newPin': '', 'confirmPin': '' });
    fixture.detectChanges();

    expect(page.getDisabledSubmitButton).not.toBeNull();
  });
});
