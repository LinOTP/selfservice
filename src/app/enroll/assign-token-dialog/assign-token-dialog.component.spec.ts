import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { EnrollmentService } from '../../api/enrollment.service';

import { AssignTokenDialogComponent } from './assign-token-dialog.component';
import { GetSerialDialogComponent } from '../../common/get-serial-dialog/get-serial-dialog.component';
import { MockComponent } from '../../../testing/mock-component';
import { NotificationService } from '../../common/notification.service';

describe('AssignTokenDialogComponent', () => {
  let component: AssignTokenDialogComponent;
  let fixture: ComponentFixture<AssignTokenDialogComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AssignTokenDialogComponent>>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        AssignTokenDialogComponent,
        NgxPermissionsAllowStubDirective,
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
          provide: NotificationService,
          useValue: spyOnClass(NotificationService)
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
    notificationService = getInjectedStub(NotificationService);
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

  describe('assignToken', () => {

    it('should be successful when assignment is successful', () => {
      enrollmentService.assign.and.returnValue(of({ success: true }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      expect(component.stepper.selectedIndex).toEqual(1);
      expect(component.success).toEqual(true);
    });

    it('should fail when assignment request returns and display an error message on failure', fakeAsync(() => {
      enrollmentService.assign.and.returnValue(of({ success: false, message: 'an error occurred' }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      tick();

      expect(component.stepper.selectedIndex).toEqual(0);
      expect(notificationService.message).toHaveBeenCalledWith('Token assignment failed.');
      expect(component.success).toEqual(false);
    }));
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
