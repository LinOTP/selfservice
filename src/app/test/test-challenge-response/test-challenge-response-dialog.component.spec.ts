import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { of } from 'rxjs/internal/observable/of';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { EnrollPushDialogComponent } from '../../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TestChallengeResponseDialogComponent } from './test-challenge-response-dialog.component';

describe('TestChallengeResponseDialogComponent', () => {
  let component: TestChallengeResponseDialogComponent;
  let fixture: ComponentFixture<TestChallengeResponseDialogComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushDialogComponent>>;
  let stepper: MatStepper;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        FormsModule,
      ],
      declarations: [
        TestChallengeResponseDialogComponent,
        MockComponent({ selector: 'app-qr-code', inputs: ['qrUrl'] }),
      ],
      providers: [
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        { provide: MAT_DIALOG_DATA, useValue: { token: Fixtures.inactivePushToken } },
        { provide: MatDialogRef, useValue: spyOnClass(MatDialogRef) },
        { provide: MatStepper, useValue: spyOnClass(MatStepper) },
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    tokenService = TestBed.get(TokenService);
    dialogRef = TestBed.get(MatDialogRef);
    stepper = TestBed.get(MatStepper);

    fixture = TestBed.createComponent(TestChallengeResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test the push token with success message in case of accept', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of({ accept: true }));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
    expect(component.result).toEqual({ accept: true });
  }));

  it('should test the push token with success message in case of deny', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of({ reject: true }));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
    expect(component.result).toEqual({ reject: true });
  }));

  it('should fail on token activation', fakeAsync(() => {
    tokenService.activate.and.returnValue(of({}));
    spyOn(console, 'error');

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
    expect(console.error).toHaveBeenCalled();

  }));

  it('should fail on challenge polling', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of({}));

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
