import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of } from 'rxjs';

import { spyOnClass, getInjectedStub } from '../../../testing/spyOnClass';

import { MaterialModule } from '../../material.module';
import { EnrollmentService } from '../../api/enrollment.service';

import { EnrollYubicoDialogComponent } from './enroll-yubico-dialog.component';
import { MockComponent } from '../../../testing/mock-component';
import { NotificationService } from '../../common/notification.service';
import { OperationsService } from '../../api/operations.service';
import { NgxPermissionsService } from 'ngx-permissions';

describe('EnrollYubicoDialogComponent', () => {
  let component: EnrollYubicoDialogComponent;
  let fixture: ComponentFixture<EnrollYubicoDialogComponent>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

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
          provide: OperationsService,
          useValue: spyOnClass(OperationsService)
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
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService)
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

    enrollmentService = getInjectedStub(EnrollmentService);
    notificationService = getInjectedStub(NotificationService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('registerToken', () => {

    it('should be successful when registration is successful', () => {
      enrollmentService.enroll.and.returnValue(of({ result: { value: true }, detail: { serial: 'serial' } }));

      component.stepper.selectedIndex = 0;
      component.registrationForm.setValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();
      expect(component.stepper.selectedIndex).toEqual(1);
      expect(component.registrationForm.disabled).toEqual(true);
    });

    it('should fail when registration request returns and stay on the same step', () => {
      enrollmentService.enroll.and.returnValue(of({ result: { value: false } }));

      component.stepper.selectedIndex = 0;
      component.registrationForm.setValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();
      expect(component.stepper.selectedIndex).toEqual(0);
      expect(component.registrationForm.disabled).toEqual(false);
    });

    it('should notify user of failed registration', () => {
      enrollmentService.enroll.and.returnValue(of({ result: { value: false } }));

      component.stepper.selectedIndex = 0;
      component.registrationForm.setValue({ publicId: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.registerToken();
      expect(notificationService.message).toHaveBeenCalledWith('Token registration failed.');
      expect(component.registrationForm.disabled).toEqual(false);
    });
  });
});
