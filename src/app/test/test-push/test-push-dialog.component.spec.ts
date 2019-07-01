import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { of } from 'rxjs/internal/observable/of';

import { Fixtures } from '../../../testing/fixtures';
import { MockComponent } from '../../../testing/mock-component';
import { spyOnClass } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { EnrollPushDialogComponent } from '../../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TestPushDialogComponent } from './test-push-dialog.component';

describe('TestPushDialogComponent', () => {
  let component: TestPushDialogComponent;
  let fixture: ComponentFixture<TestPushDialogComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollPushDialogComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        FormsModule,
      ],
      declarations: [
        TestPushDialogComponent,
        MockComponent({ selector: 'app-qr-code', inputs: ['qrUrl'] }),
      ],
      providers: [
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        { provide: MAT_DIALOG_DATA, useValue: { token: Fixtures.inactivePushToken } },
        { provide: MatDialogRef, useValue: spyOnClass(MatDialogRef) },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    tokenService = TestBed.get(TokenService);
    dialogRef = TestBed.get(MatDialogRef);

    fixture = TestBed.createComponent(TestPushDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should activate the push token with success message', fakeAsync(() => {
    tokenService.activate.and.returnValue(of(Fixtures.activationResponse));
    tokenService.challengePoll.and.returnValue(of(true));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(false);
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
    tokenService.challengePoll.and.returnValue(of(false));

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('#goTo2')).nativeElement;
    nextButton.click();
    tick();

    expect(component.waitingForResponse).toEqual(false);
    expect(component.restartDialog).toEqual(true);
  }));

  it('should let the user close the dialog', () => {
    component.cancelDialog();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
