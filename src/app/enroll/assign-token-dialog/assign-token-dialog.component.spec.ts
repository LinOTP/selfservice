import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { of } from 'rxjs';

import { spyOnClass } from '../../../testing/spyOnClass';
import { I18nMock } from '../../../testing/i18n-mock-provider';

import { MaterialModule } from '../../material.module';
import { EnrollmentService } from '../../api/enrollment.service';

import { AssignTokenDialogComponent } from './assign-token-dialog.component';

describe('AssignTokenDialogComponent', () => {
  let component: AssignTokenDialogComponent;
  let fixture: ComponentFixture<AssignTokenDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AssignTokenDialogComponent>>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssignTokenDialogComponent,
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
        I18nMock,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTokenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialogRef = TestBed.get(MatDialogRef);
    enrollmentService = TestBed.get(EnrollmentService);
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
    it('should reset the dialog to its original state', () => {
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      component.errorMessage = 'error';
      component.stepper.selectedIndex = 2;
      fixture.detectChanges();

      component.retry();

      expect(component.assignmentForm.get('serial').value).toBeNull();
      expect(component.assignmentForm.get('description').value).toBeNull();
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
});
