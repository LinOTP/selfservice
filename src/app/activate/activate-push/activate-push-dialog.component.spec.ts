import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs/internal/observable/of';

import { ActivatePushDialogComponent } from './activate-push-dialog.component';
import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { spyOnClass } from '../../../testing/spyOnClass';
import { Fixtures } from '../../../testing/fixtures';
import { EnrollPushDialogComponent } from '../../enroll/enroll-push-dialog/enroll-push-dialog.component';

describe('ActivatePushDialogComponent', () => {
  let component: ActivatePushDialogComponent;
  let fixture: ComponentFixture<ActivatePushDialogComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [
        ActivatePushDialogComponent,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: spyOnClass(MatDialogRef) },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivatePushDialogComponent);
    component = fixture.componentInstance;
    tokenService = TestBed.get(TokenService);
    dialogRef = TestBed.get(MatDialogRef);

    tokenService.getToken.and.returnValue(of(Fixtures.inactivePushToken));
    component.token.serial = Fixtures.inactivePushToken.serial;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial step of 1 and max activation step of 2', () => {
    fixture.detectChanges();
    expect(component.maxSteps).toEqual(2);
    expect(component.currentStep).toEqual(1);
  });

  it('should activate the push token with success message', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of(true));

    fixture.detectChanges();
    expect(component.currentStep).toEqual(1);

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
    expect(component.currentStep).toEqual(2);
  }));

  it('should fail on token activation', fakeAsync(() => {
    tokenService.activate.and.returnValue(of({}));
    spyOn(console, 'error');

    fixture.detectChanges();
    expect(component.currentStep).toEqual(1);

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
    expect(component.currentStep).toEqual(2);
    expect(console.error).toHaveBeenCalled();

  }));

  it('should fail on challenge polling', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of(false));

    fixture.detectChanges();
    expect(component.currentStep).toEqual(1);

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
    expect(component.currentStep).toEqual(2);
  }));

  it('should let the user close the dialog', () => {
    component.cancelDialog();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
