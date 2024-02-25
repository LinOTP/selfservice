import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollDialogBaseComponent } from '@app/enroll/enroll-dialog-base.component';
import { GetSerialDialogComponent } from '@common/get-serial-dialog/get-serial-dialog.component';


@Component({
  selector: 'app-assign-token-dialog',
  templateUrl: './assign-token-dialog.component.html',
  styleUrls: ['./assign-token-dialog.component.scss']
})
export class AssignTokenDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public assignmentForm: UntypedFormGroup;
  @ViewChild(MatStepper) public stepper: MatStepper;
  @ViewChild('serialInput') public serialInput: ElementRef;

  ngOnInit() {
    this.assignmentForm = this.formBuilder.group({
      'serial': ['', Validators.required],
      'description': [$localize`Assigned via SelfService`, Validators.required],
    });
    super.ngOnInit();
  }

  /**
   * Submit token serial to token service for self-assignment. If successful,
   * display a success message, otherwise display an error message and the possibility
   * to retry the assignment process without leaving the dialog.
   */
  public assignToken() {
    this.assignmentForm.disable();
    const serial = this.assignmentForm.get('serial').value;
    const description = this.assignmentForm.get('description').value;
    this.enrollmentService.assign(serial, description).subscribe(result => {
      if (result.success) {
        this.enrolledToken = { serial: serial, type: 'assign' }; // TODO: retrieve real token type
        this.stepper.next();
      } else {
        this.assignmentForm.enable();
        this.notificationService.errorMessage($localize`Token assignment failed.`);
      }
    });
  }

  public getSerial() {
    this.dialog.open(GetSerialDialogComponent).afterClosed().subscribe(serial => {
      if (serial) {
        this.notificationService.message($localize`Serial number retrieved.`);
        this.assignmentForm.controls.serial.setValue(serial);
        this.serialInput.nativeElement.focus();
      }
    });
  }

}
