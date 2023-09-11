import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Subscription } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

import { TokenType } from '@linotp/data-models';

import { Fixtures } from '@testing/fixtures';
import { MockComponent } from '@testing/mock-component';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentService } from '@api/enrollment.service';
import { TokenService } from '@api/token.service';
import { EnrollPushQRDialogComponent } from '@app/enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { MaterialModule } from '@app/material.module';

import { ActivateDialogComponent } from './activate-dialog.component';

const data = {
  serial: 'serialpush',
  type: TokenType.PUSH
};

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
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        { provide: MAT_DIALOG_DATA, useValue: data },
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

  it('should unsubscribe from polling on destroy if there is a subscription', () => {
    component['pairingSubscription'] = new Subscription();
    const unsubscribeSpy = spyOn(component['pairingSubscription'], 'unsubscribe');

    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  describe('activateToken', () => {

    it('should display success message in case of QR token activation with valid TAN', fakeAsync(() => {
      enrollmentService.activate.and.returnValue(of(Fixtures.activationResponseWithMessage));
      enrollmentService.challengePoll.and.returnValue(of({ valid_tan: true, status: "closed" }));

      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
      nextButton.click();
      tick();

      expect(component.waitingForResponse).toEqual(false);
      expect(component.restartDialog).toEqual(false);
    }));

    it('should display success message in case of accepted push token activation transaction', fakeAsync(() => {
      enrollmentService.activate.and.returnValue(of(Fixtures.activationResponse));
      enrollmentService.challengePoll.and.returnValue(of({ accept: true, status: "closed" }));

      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
      nextButton.click();
      tick();

      expect(component.waitingForResponse).toEqual(false);
      expect(component.restartDialog).toEqual(false);
    }));

    it('should display success message in case of rejected push token activation transaction', fakeAsync(() => {
      enrollmentService.activate.and.returnValue(of(Fixtures.activationResponse));
      enrollmentService.challengePoll.and.returnValue(of({ reject: true, status: "closed" }));

      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
      nextButton.click();
      tick();

      expect(component.waitingForResponse).toEqual(false);
      expect(component.restartDialog).toEqual(false);
    }));

    it('should display failure message on negative response of token activation', fakeAsync(() => {
      enrollmentService.activate.and.returnValue(of(null));

      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
      nextButton.click();
      tick();

      expect(component.waitingForResponse).toEqual(false);
      expect(component.restartDialog).toEqual(true);
    }));

    it('should display failure message on negative response of challenge polling', fakeAsync(() => {
      enrollmentService.activate.and.returnValue(of(Fixtures.activationResponse));
      enrollmentService.challengePoll.and.returnValue(of(null));

      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
      nextButton.click();
      tick();

      expect(component.waitingForResponse).toEqual(false);
      expect(component.restartDialog).toEqual(true);
    }));
  });

  it('should let the user close the dialog', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledWith();
  });

  it('should let the user retry a failed test', () => {
    component.resetDialogToInitial(stepper);
    expect(stepper.reset).toHaveBeenCalledTimes(1);
  });
});
