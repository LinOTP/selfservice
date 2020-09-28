import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { EnrollmentService } from '../../api/enrollment.service';

import { EnrollYubicoDialogComponent } from './enroll-yubico-dialog.component';
import { MockComponent } from '../../../testing/mock-component';

describe('EnrollYubicoDialogComponent', () => {
  let component: EnrollYubicoDialogComponent;
  let fixture: ComponentFixture<EnrollYubicoDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EnrollYubicoDialogComponent>>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollYubicoDialogComponent,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
      ],
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService)
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { closeLabel: null },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollYubicoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialogRef = getInjectedStub<MatDialogRef<EnrollYubicoDialogComponent>>(MatDialogRef);
    enrollmentService = getInjectedStub(EnrollmentService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('close', () => {
    it('should return the token serial if assignment was successful', () => {
      component.success = true;
      component.serial = 'serial';
      fixture.detectChanges();

      component.close();
      expect(dialogRef.close).toHaveBeenCalledWith('serial');
    });

    it('should not return the token serial if assignment was unsuccessful', () => {
      component.success = false;
      component.registrationForm.reset();
      fixture.detectChanges();

      component.close();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('retry', () => {
    it('should keep the form data', () => {
      component.registrationForm.setValue({ publicId: 'abc123', description: 'my new token' });
      component.errorMessage = 'error';
      component.stepper.selectedIndex = 1;
      fixture.detectChanges();

      component.retry();

      expect(component.registrationForm.get('publicId').value).toBe('abc123');
      expect(component.registrationForm.get('description').value).toBe('my new token');
      expect(component.errorMessage).toBe('');
      expect(component.stepper.selectedIndex).toEqual(0);
    });
  });

  describe('registerToken', () => {

    it('should be successful when registration is successful', () => {
      enrollmentService.enroll.and.returnValue(of({ result: { value: true }, detail: { serial: 'serial' } }));

      component.stepper.selectedIndex = 0;
      component.registrationForm.setValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();
      expect(component.stepper.selectedIndex).toEqual(1);
      expect(component.success).toEqual(true);
    });

    it('should fail when registration request returns and display an error message on failure', () => {
      enrollmentService.enroll.and.returnValue(of({ result: { value: false, error: { message: 'an error occurred' } } }));

      component.stepper.selectedIndex = 0;
      component.registrationForm.setValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();
      expect(component.stepper.selectedIndex).toEqual(1);
      expect(component.errorMessage).toBe('an error occurred');
      expect(component.success).toEqual(false);
    });
  });
});
