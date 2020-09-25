import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Permission } from '../../common/permissions';
import { NotificationService } from '../../common/notification.service';
import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';

import { TokenTypeDetails, EnrollToken } from '../../api/token';
import { EnrollmentService } from '../../api/enrollment.service';
import { OperationsService } from '../../api/operations.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-enroll-motp',
  templateUrl: './enroll-motp-dialog.component.html',
  styleUrls: ['./enroll-motp-dialog.component.scss']
})
export class EnrollMOTPDialogComponent implements OnInit {

  public Permission = Permission;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;
  public showDetails = false;

  public enrolledToken: { serial: string };

  constructor(
    private formBuilder: FormBuilder,
    private operationsService: OperationsService,
    private enrollmentService: EnrollmentService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollMOTPDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails, closeLabel: String },
    public notificationService: NotificationService,
    public permissionsService: NgxPermissionsService,
  ) { }

  public ngOnInit() {

    this.enrollmentStep = this.formBuilder.group({
      'password': ['', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{16}$/g)]],
      'mOTPPin': ['', Validators.required],
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public enrollToken() {
    const description = this.enrollmentStep.get('description').value;
    const password = this.enrollmentStep.get('password').value;
    const mOTPPin = this.enrollmentStep.get('mOTPPin').value;

    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description,
      otpkey: password,
      otppin: mOTPPin,
    };

    this.enrollmentService.enroll(body).subscribe(response => {
      const serial = response &&
        response.result && response.result.value &&
        response.detail && response.detail.serial;
      if (serial) {
        this.enrolledToken = {
          serial: serial,
        };
        this.stepper.next();
      } else {
        this.notificationService
          .message($localize`There was a problem while creating the new token. Please try again.`);
      }
    });
  }

  public setPin() {
    const config = {
      width: '25em',
      data: this.enrolledToken
    };
    this.dialog
      .open(SetPinDialogComponent, config)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.pinSet = true;
          this.notificationService.message($localize`PIN set`);
        }
      });
  }

  /**
   * Cancel the dialog and return false as result
   */
  public cancelDialog() {
    if (this.enrolledToken && this.permissionsService.hasPermission(Permission.DELETE)) {
      this.operationsService.deleteToken(this.enrolledToken.serial).subscribe();
    }
    this.dialogRef.close(false);
  }

  /**
   * Close the dialog and return serial of successfully created token
   */
  public closeDialog() {
    this.dialogRef.close(this.enrolledToken.serial);
  }

}
