import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { OperationsService } from '../../api/operations.service';
import { NotificationService } from '../notification.service';

import { SetPinDialogComponent } from './set-pin-dialog.component';

class Page extends TestingPage<SetPinDialogComponent> {

  public getDisabledSubmitButton() {
    return this.query('[type="submit"] [disabled]');
  }
}

describe('SetPinDialogComponent', () => {
  let component: SetPinDialogComponent;
  let fixture: ComponentFixture<SetPinDialogComponent>;
  let operationsService: OperationsService;
  let notificationService: NotificationService;
  const token = Fixtures.activeHotpToken;
  let page: Page;
  let matDialogRef: MatDialogRef<SetPinDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [SetPinDialogComponent],
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
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    operationsService = TestBed.inject(OperationsService);
    notificationService = TestBed.inject(NotificationService);
    matDialogRef = TestBed.inject(MatDialogRef);

    fixture = TestBed.createComponent(SetPinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setPin and close dialog if pin values are equal on submit', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '1234' });
    fixture.detectChanges();
    operationsService.setPin = jasmine.createSpy('setPin').and.returnValue(of(true));

    component.submit();
    expect(operationsService.setPin).toHaveBeenCalledWith(token, '1234');
    expect(matDialogRef.close).toHaveBeenCalledWith(true);
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should allow setting an empty pin', () => {
    component.form.setValue({ 'newPin': '', 'confirmPin': '' });
    fixture.detectChanges();
    operationsService.setPin = jasmine.createSpy('setPin').and.returnValue(of(true));

    component.submit();
    expect(operationsService.setPin).toHaveBeenCalledWith(token, '');
    expect(matDialogRef.close).toHaveBeenCalledWith(true);
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should display a notification message if submission fails', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '1234' });
    fixture.detectChanges();
    operationsService.setPin = jasmine.createSpy('setPin').and.returnValue(of(false));

    component.submit();
    expect(notificationService.message).toHaveBeenCalledWith('Pin could not be set. Please try again.');
  });

  it('should not call setPin nor close dialog if pin values are different on submit', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should not send backend request if pin values are different', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should disable submit button if pin values are different', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    expect(page.getDisabledSubmitButton).not.toBeNull();
  });
});
