import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { NgxPermissionsAllowStubDirective, NgxPermissionsService } from 'ngx-permissions';

import { of } from 'rxjs';

import { MockComponent } from '@testing/mock-component';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentService } from '@api/enrollment.service';
import { OperationsService } from '@api/operations.service';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { GetSerialDialogComponent } from '@common/get-serial-dialog/get-serial-dialog.component';
import { NotificationService } from '@common/notification.service';

import { AssignTokenDialogComponent } from './assign-token-dialog.component';

describe('AssignTokenDialogComponent', () => {
  let component: AssignTokenDialogComponent;
  let fixture: ComponentFixture<AssignTokenDialogComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let loginService: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        AssignTokenDialogComponent,
        MockComponent({ selector: 'app-button-wait-indicator', inputs: ['show'] }),
      ],
      imports: [
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPermissionsAllowStubDirective,
      ],
      providers: [
        {
          provide: OperationsService,
          useValue: spyOnClass(OperationsService)
        },
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService)
        },
        {
          provide: EnrollmentService,
          useValue: spyOnClass(EnrollmentService)
        },
        {
          provide: NotificationService,
          useValue: spyOnClass(NotificationService)
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
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
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService)
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { tokenType: 'assign' },
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTokenDialogComponent);
    component = fixture.componentInstance;

    dialog = getInjectedStub(MatDialog);

    enrollmentService = getInjectedStub(EnrollmentService);
    notificationService = getInjectedStub(NotificationService);
    loginService = getInjectedStub(LoginService);

    loginService.hasPermission$.and.returnValue(of(true));
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('assignToken', () => {

    it('should be successful when assignment is successful', () => {
      enrollmentService.assign.and.returnValue(of({ success: true }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      expect(component.stepper.selectedIndex).toEqual(1);
      expect(component.assignmentForm.disabled).toEqual(true);
    });

    it('should fail when assignment request returns and display an error message on failure', fakeAsync(() => {
      enrollmentService.assign.and.returnValue(of({ success: false, message: 'an error occurred' }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      tick();

      expect(component.stepper.selectedIndex).toEqual(0);
      expect(notificationService.errorMessage).toHaveBeenCalledWith('Token assignment failed.');
      expect(component.assignmentForm.disabled).toEqual(false);
    }));
  });

  describe('getSerial', () => {
    it('should open the getSerial dialog and assign the return value to the serial control', () => {

      dialog.open.and.returnValue({ afterClosed: () => of('serial') } as MatDialogRef<GetSerialDialogComponent>);

      expect(component.assignmentForm.controls.serial.value).toEqual('');

      component.getSerial();
      fixture.detectChanges();

      expect(dialog.open).toHaveBeenCalledWith(GetSerialDialogComponent);
      expect(component.assignmentForm.controls.serial.value).toEqual('serial');
    });

    it('should open the getSerial dialog and keep the serial unchanged if the return value is not truthy', () => {

      dialog.open.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<GetSerialDialogComponent>);

      component.assignmentForm.controls.serial.setValue('some value');

      component.getSerial();
      fixture.detectChanges();

      expect(dialog.open).toHaveBeenCalledWith(GetSerialDialogComponent);
      expect(component.assignmentForm.controls.serial.value).toEqual('some value');
    });

  });

});
