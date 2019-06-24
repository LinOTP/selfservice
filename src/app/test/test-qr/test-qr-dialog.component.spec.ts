import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TestQrDialogComponent } from './test-qr-dialog.component';
import { TokenService } from '../../api/token.service';
import { spyOnClass } from '../../../testing/spyOnClass';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { MockComponent } from '../../../testing/mock-component';
import { of } from 'rxjs/internal/observable/of';
import { Fixtures } from '../../../testing/fixtures';
import { EnrollPushDialogComponent } from '../../enroll/enroll-push-dialog/enroll-push-dialog.component';

describe('TestQrDialogComponent', () => {
  let component: TestQrDialogComponent;
  let fixture: ComponentFixture<TestQrDialogComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [TestQrDialogComponent,
        MockComponent({ selector: 'app-qr-code', inputs: ['qrUrl'] }),
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
    fixture = TestBed.createComponent(TestQrDialogComponent);
    component = fixture.componentInstance;
    tokenService = TestBed.get(TokenService);
    dialogRef = TestBed.get(MatDialogRef);
    tokenService.activate.and.returnValue(of());
    component.data = { token: Fixtures.inactiveQRToken };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial step of 1 and max activation step of 2', () => {
    fixture.detectChanges();
    expect(component.maxSteps).toEqual(2);
    expect(component.currentStep).toEqual(1);
  });

  it('should activate the QR token', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of(true));

    expect(component.currentStep).toEqual(1);

    component.activateToken();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
    expect(component.currentStep).toEqual(2);
    expect(component.showError).toEqual(false);
  }));

  it('should fail on QR token activation', fakeAsync(() => {
    tokenService.activate.and.returnValue(of({}));
    spyOn(console, 'error');

    expect(component.currentStep).toEqual(1);

    component.activateToken();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
    expect(component.currentStep).toEqual(2);
    expect(component.showError).toEqual(true);
    expect(console.error).toHaveBeenCalled();

  }));

  it('should fail on QR challenge polling', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of(false));

    expect(component.currentStep).toEqual(1);

    component.activateToken();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
    expect(component.currentStep).toEqual(2);
    expect(component.showError).toEqual(false);
  }));

  it('should let the user close the dialog', () => {
    component.cancelDialog();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
