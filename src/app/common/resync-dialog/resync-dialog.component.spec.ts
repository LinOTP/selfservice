import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { Fixtures } from '../../../testing/fixtures';
import { TestingPage } from '../../../testing/page-helper';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { OperationsService } from '../../api/operations.service';
import { NotificationService } from '../notification.service';
import { ResyncDialogComponent } from './resync-dialog.component';

class Page extends TestingPage<ResyncDialogComponent> {

  public getDisabledSubmitButton() {
    return this.query('[type="submit"] [disabled]');
  }
}

describe('ResyncDialogComponent', () => {
  let component: ResyncDialogComponent;
  let fixture: ComponentFixture<ResyncDialogComponent>;
  let operationsService: OperationsService;
  let notificationService: NotificationService;
  const token = Fixtures.activeHotpToken;
  let page: Page;
  let matDialogRef: MatDialogRef<ResyncDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ResyncDialogComponent],
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

    fixture = TestBed.createComponent(ResyncDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call resync and close dialog if successful', () => {
    component.form.setValue({ 'otp1': '1234', 'otp2': '5678' });
    fixture.detectChanges();
    operationsService.resync = jasmine.createSpy('resync').and.returnValue(of(true));

    component.submit();
    expect(operationsService.resync).toHaveBeenCalledWith(token.serial, '1234', '5678');
    expect(matDialogRef.close).toHaveBeenCalledWith(true);
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should display a notification message if submission fails', () => {
    component.form.setValue({ 'otp1': '1234', 'otp2': '4567' });
    fixture.detectChanges();
    operationsService.resync = jasmine.createSpy('resync').and.returnValue(of(false));

    component.submit();
    expect(notificationService.message).toHaveBeenCalledWith('Token could not be synchronized. Please try again.');
  });

  it('should not send backend request if first otp value is missing', () => {
    component.form.setValue({ 'otp1': '', 'otp2': '5678' });
    fixture.detectChanges();

    component.submit();
  });

  it('should disable submit button if first otp value is missing', () => {
    component.form.setValue({ 'otp1': '', 'otp2': '5678' });
    fixture.detectChanges();

    expect(page.getDisabledSubmitButton).not.toBeNull();
  });

  it('should not send backend request if second otp value is missing', () => {
    component.form.setValue({ 'otp1': '1234', 'otp2': '' });
    fixture.detectChanges();

    component.submit();
    expect(operationsService.resync).not.toHaveBeenCalled();
    expect(matDialogRef.close).not.toHaveBeenCalled();
    expect(notificationService.message).not.toHaveBeenCalled();
  });

  it('should disable submit button if second otp value is missing', () => {
    component.form.setValue({ 'otp1': '1234', 'otp2': '' });
    fixture.detectChanges();

    expect(page.getDisabledSubmitButton).not.toBeNull();
  });

});
