import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { of } from 'rxjs';

import { Fixtures } from '@testing/fixtures';
import { TestingPage } from '@testing/page-helper';
import { spyOnClass } from '@testing/spyOnClass';

import { OperationsService } from '@api/operations.service';
import { MaterialModule } from '@app/material.module';

import { MockComponent } from '@testing/mock-component';
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
  const token = Fixtures.activeHotpToken;
  let page: Page;
  let matDialogRef: MatDialogRef<SetMOTPPinDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        SetMOTPPinDialogComponent,
        MockComponent({ selector: 'app-token-dialog-header', inputs: ['token'] }),
      ],
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
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    operationsService = TestBed.inject(OperationsService);
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
  });

  it('should not allow setting an empty pin', () => {
    component.form.setValue({ 'newPin': '', 'confirmPin': '' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setMOTPPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
  });

  it('should not call setPin nor close dialog if pin values are different on submit', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setMOTPPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
  });

  it('should not send backend request if pin values are different', () => {
    component.form.setValue({ 'newPin': '1234', 'confirmPin': '5678' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.setMOTPPin).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
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
