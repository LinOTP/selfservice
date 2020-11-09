import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { GetSerialDialogComponent } from '../../common/get-serial-dialog/get-serial-dialog.component';
import { Permission } from '../../common/permissions';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';


@Component({
  selector: 'app-assign-token-dialog',
  templateUrl: './assign-token-dialog.component.html',
  styleUrls: ['./assign-token-dialog.component.scss']
})
export class AssignTokenDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  public assignmentForm: FormGroup;
  @ViewChild(MatStepper) public stepper: MatStepper;
  @ViewChild('serialInput') public serialInput: ElementRef;

  public permissions = Permission;

  public success = false;

  ngOnInit() {
    this.assignmentForm = this.formBuilder.group({
      'serial': ['', Validators.required],
      'description': [$localize`Assigned via SelfService`, Validators.required],
    });
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
        this.enrolledToken = { serial: serial };
        this.success = true;
        this.stepper.next();
      } else {
        this.assignmentForm.enable();
        this.notificationService.message($localize`Token assignment failed.`);
      }
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
