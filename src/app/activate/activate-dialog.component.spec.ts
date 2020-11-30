import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { of } from 'rxjs/internal/observable/of';

import { Fixtures } from '../../testing/fixtures';
import { MockComponent } from '../../testing/mock-component';
import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';

import { MaterialModule } from '../material.module';
import { EnrollmentService } from '../api/enrollment.service';
import { EnrollPushQRDialogComponent } from '../enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { ActivateDialogComponent } from './activate-dialog.component';

describe('ActivateDialogComponent', () => {
  let component: ActivateDialogComponent;
  let fixture: ComponentFixture<ActivateDialogComponent>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushQRDialogComponent>>;
  let stepper: jasmine.SpyObj<MatStepper>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        FormsModule,
      ],
      declarations: [
        ActivateDialogComponent,
        MockComponent({ selector: 'app-qr-code', inputs: ['qrUrl'] }),
      ],
      providers: [
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService),
        },
        { provide: MAT_DIALOG_DATA, useValue: { token: Fixtures.inactivePushToken } },
        { provide: MatDialogRef, useValue: spyOnClass(MatDialogRef) },
        { provide: MatStepper, useValue: spyOnClass(MatStepper) },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    enrollmentService = getInjectedStub(EnrollmentService);
    dialogRef = getInjectedStub<MatDialogRef<EnrollPushQRDialogComponent>>(MatDialogRef);
    stepper = getInjectedStub(MatStepper);

    fixture = TestBed.createComponent(ActivateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test the push token with success message in case of accept', fakeAsync(() => {
    enrollmentService.activate.and.returnValue(of(Fixtures.activationResponse));
    enrollmentService.challengePoll.and.returnValue(of({ accept: true }));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
    expect(component.result).toEqual({ accept: true });
  }));

  it('should test the push token with success message in case of deny', fakeAsync(() => {
    enrollmentService.activate.and.returnValue(of(Fixtures.activationResponse));
    enrollmentService.challengePoll.and.returnValue(of({ reject: true }));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
    expect(component.result).toEqual({ reject: true });
  }));

  it('should fail on token activation', fakeAsync(() => {
    enrollmentService.activate.and.returnValue(of(null));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);

  }));

  it('should fail on challenge polling', fakeAsync(() => {
    enrollmentService.activate.and.returnValue(of(Fixtures.activationResponse));
    enrollmentService.challengePoll.and.returnValue(of(null));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
    expect(component.result).toBeNull();
  }));

  it('should let the user cancel the test', () => {
    component.cancelDialog();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should let the user close the test dialog', () => {
    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should let the user retry a failed test', () => {
    component.resetDialogToInitial(stepper);
    expect(stepper.reset).toHaveBeenCalledTimes(1);
  });
});
