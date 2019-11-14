import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { TokenService } from '../../api/token.service';

@Component({
  selector: 'app-assign-token-dialog',
  templateUrl: './assign-token-dialog.component.html',
  styleUrls: ['./assign-token-dialog.component.scss']
})
export class AssignTokenDialogComponent implements OnInit {

  public assignmentForm: FormGroup;
  @ViewChild(MatStepper, { static: false }) public stepper: MatStepper;

  public success: boolean;
  public errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<AssignTokenDialogComponent>,
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
  ) { }

  ngOnInit() {
    this.assignmentForm = this.formBuilder.group({
      'serial': ['', Validators.required],
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
    this.assignmentForm.reset();
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
    this.errorMessage = '';
    this.tokenService.assign(serial, 'self+assigned').subscribe(result => {
      this.stepper.selectedIndex = 2;
      this.success = result.success;
      if (result.message) {
        this.errorMessage = result.message;
      }
    });
  }

}
