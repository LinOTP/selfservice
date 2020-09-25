import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { EnrollmentService } from '../../api/enrollment.service';

import { AssignTokenDialogComponent } from './assign-token-dialog.component';
import { GetSerialDialogComponent } from '../../common/get-serial-dialog/get-serial-dialog.component';

describe('AssignTokenDialogComponent', () => {
  let component: AssignTokenDialogComponent;
  let fixture: ComponentFixture<AssignTokenDialogComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AssignTokenDialogComponent>>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        AssignTokenDialogComponent,
        NgxPermissionsAllowStubDirective,
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
          provide: MatDialog,
          useValue: spyOnClass(MatDialog),
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
    fixture = TestBed.createComponent(AssignTokenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialog = getInjectedStub(MatDialog);
    dialogRef = getInjectedStub<MatDialogRef<AssignTokenDialogComponent>>(MatDialogRef);
    enrollmentService = getInjectedStub(EnrollmentService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('close', () => {
    it('should return the token serial if assignment was successful', () => {
      component.success = true;
      component.assignmentForm.setValue({ serial: 'abc123', description: '' });
      fixture.detectChanges();

      component.close();
      expect(dialogRef.close).toHaveBeenCalledWith('abc123');
    });

    it('should not return the token serial if assignment was unsuccessful', () => {
      component.success = false;
      component.assignmentForm.reset();
      fixture.detectChanges();

      component.close();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('retry', () => {
    it('should keep the form data', () => {
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      component.errorMessage = 'error';
      component.stepper.selectedIndex = 2;
      fixture.detectChanges();

      component.retry();

      expect(component.assignmentForm.get('serial').value).toBe('abc123');
      expect(component.assignmentForm.get('description').value).toBe('my new token');
      expect(component.errorMessage).toBe('');
      expect(component.stepper.selectedIndex).toEqual(0);
    });
  });

  describe('assignToken', () => {

    it('should be successful when assignment is successful', () => {
      enrollmentService.assign.and.returnValue(of({ success: true }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      expect(component.stepper.selectedIndex).toEqual(2);
      expect(component.success).toEqual(true);
    });

    it('should fail when assignment request returns and display an error message on failure', () => {
      enrollmentService.assign.and.returnValue(of({ success: false, message: 'an error occurred' }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      expect(component.stepper.selectedIndex).toEqual(2);
      expect(component.errorMessage).toBe('an error occurred');
      expect(component.success).toEqual(false);
    });
  });

  describe('getSerial', () => {
    it('should open the getSerial dialog and assign the return value to the serial control', () => {

      dialog.open.and.returnValue({ afterClosed: () => of('serial') });

      expect(component.assignmentForm.controls.serial.value).toEqual('');

      component.getSerial();
      fixture.detectChanges();

      expect(dialog.open).toHaveBeenCalledWith(GetSerialDialogComponent);
      expect(component.assignmentForm.controls.serial.value).toEqual('serial');
    });

    it('should open the getSerial dialog and keep the serial unchanged if the return value is not truthy', () => {

      dialog.open.and.returnValue({ afterClosed: () => of(false) });

      component.assignmentForm.controls.serial.setValue('some value');

      component.getSerial();
      fixture.detectChanges();

      expect(dialog.open).toHaveBeenCalledWith(GetSerialDialogComponent);
      expect(component.assignmentForm.controls.serial.value).toEqual('some value');
    });

  });

});
