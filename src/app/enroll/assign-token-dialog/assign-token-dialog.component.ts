import { Component, OnInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentService } from '../../api/enrollment.service';
import { GetSerialDialogComponent } from '../../common/get-serial-dialog/get-serial-dialog.component';
import { Permission } from '../../common/permissions';

@Component({
  selector: 'app-assign-token-dialog',
  templateUrl: './assign-token-dialog.component.html',
  styleUrls: ['./assign-token-dialog.component.scss']
})
export class AssignTokenDialogComponent implements OnInit {

  public assignmentForm: FormGroup;
  @ViewChild(MatStepper) public stepper: MatStepper;
  @ViewChild('serialInput') public serialInput: ElementRef;

  public permissions = Permission;

  public success: boolean;
  public errorTypeMessage = '';
  public errorMessage = '';

  public closeLabel = $localize`Close`;

  constructor(
    private dialogRef: MatDialogRef<AssignTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { closeLabel: string },
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private enrollmentService: EnrollmentService,
  ) {
    this.closeLabel = data.closeLabel;
  }

  ngOnInit() {
    this.assignmentForm = this.formBuilder.group({
      'serial': ['', Validators.required],
      'description': [$localize`Assigned via SelfService`, Validators.required],
    });
  }

  /**
  * Close the enrollment dialog without further action.
  */
  public close() {
    if (this.success) {
      this.dialogRef.close(this.assignmentForm.get('serial').value);
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * Return the user to the first step of the assignment process and reset the form.
   */
  public retry() {
    this.errorMessage = '';
    this.stepper.selectedIndex = 0;
  }

  /**
   * Submit token serial to token service for self-assignment. If successful,
   * display a success message, otherwise display an error message and the possibility
   * to retry the assignment process without leaving the dialog.
   */
  public assignToken() {
    this.stepper.selectedIndex = 1;
    const serial = this.assignmentForm.get('serial').value;
    const description = this.assignmentForm.get('description').value;
    this.errorMessage = '';
    this.enrollmentService.assign(serial, description).subscribe(result => {
      if (!result.success) {
        this.errorTypeMessage = $localize`The token assignment failed.`;
        if (result.message) {
          this.errorMessage = result.message;
        }
      }
      this.success = result.success;
      this.stepper.selectedIndex = 2;
    });
  }


  public getSerial() {
    this.dialog.open(GetSerialDialogComponent).afterClosed().subscribe(serial => {
      if (serial) {
        this.assignmentForm.controls.serial.setValue(serial);
        this.serialInput.nativeElement.click();
      }
    });
  }

}
