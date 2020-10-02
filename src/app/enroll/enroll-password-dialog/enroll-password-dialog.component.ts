import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';

import { Permission } from '../../common/permissions';
import { NotificationService } from '../../common/notification.service';

import { TokenTypeDetails, EnrollToken } from '../../api/token';
import { EnrollmentService } from '../../api/enrollment.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { ErrorStateRootMatcher } from '../../common/form-helpers/error-state-root-matcher';

@Component({
  selector: 'app-enroll-password',
  templateUrl: './enroll-password-dialog.component.html',
  styleUrls: ['./enroll-password-dialog.component.scss']
})
export class EnrollPasswordDialogComponent implements OnInit {

  public Permission = Permission;
  public matcher = new ErrorStateRootMatcher();

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

  public serial: string;

  constructor(
    private formBuilder: FormBuilder,
    private enrollmentService: EnrollmentService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails, closeLabel: String },
    public notificationService: NotificationService,
    public permissionsService: NgxPermissionsService,
  ) { }

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'password': ['', Validators.required],
      'confirmation': ['', Validators.required],
      'description': [$localize`Created via SelfService`, Validators.required],
    },
      {
        validator: this.checkPasswords
      }
    );
  }

  private checkPasswords(group: FormGroup): (ValidationErrors | null) {
    const password: string = group.get('password')?.value;
    const passwordConfirmation: string = group.get('confirmation')?.value;

    return password === passwordConfirmation ? null : { passwordsDoNotMatch: true };
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description: this.enrollmentStep.get('description').value,
      otpkey: this.enrollmentStep.get('password').value,
    };

    this.enrollmentService.enroll(body).subscribe(response => {
      if (response?.result?.value) {
        this.serial = response.detail.serial;
        this.stepper.next();
      } else {
        this.notificationService
          .message($localize`There was a problem while creating the new token. Please try again.`);
      }
      this.enrollmentStep.enable();
    });
  }

  /**
 * Cancel the dialog and return false as result
 */
  public cancelDialog() {
    this.dialogRef.close(false);
  }

  /**
   * Close the dialog and return serial of successfully created token
   */
  public closeDialog() {
    this.dialogRef.close(this.serial);
  }

}
