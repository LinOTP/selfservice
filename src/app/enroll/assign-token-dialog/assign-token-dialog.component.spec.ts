import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { of } from 'rxjs';

import { spyOnClass } from '../../../testing/spyOnClass';
import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';

import { AssignTokenDialogComponent } from './assign-token-dialog.component';

describe('AssignTokenDialogComponent', () => {
  let component: AssignTokenDialogComponent;
  let fixture: ComponentFixture<AssignTokenDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AssignTokenDialogComponent>>;
  let tokenService: jasmine.SpyObj<TokenService>;

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
          provide: TokenService,
          useValue: spyOnClass(TokenService)
        },
        {
          provide: MatDialogRef,
          useValue: spyOnClass(MatDialogRef),
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTokenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialogRef = TestBed.get(MatDialogRef);
    tokenService = TestBed.get(TokenService);
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

    it('should move the stepper to step 2 when assignment request returns', () => {
      tokenService.assign.and.returnValue(of({ success: true }));
      tokenService.setDescription.and.returnValue(of({ success: true }));

      component.stepper.selectedIndex = 0;
      component.assignmentForm.setValue({ serial: 'abc123', description: 'my new token' });
      fixture.detectChanges();

      component.assignToken();
      expect(component.stepper.selectedIndex).toEqual(2);
      expect(component.success).toEqual(true);
    });

    it('should move the stepper to step 2 when assignment request returns and display an error message on failure', () => {
      tokenService.assign.and.returnValue(of({ success: false, message: 'an error occurred' }));

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
