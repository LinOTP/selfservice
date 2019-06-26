import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatStepper, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../../common/notification.service';

import { TokenService } from '../../api/token.service';
import { TokenType, TokenTypeDetails } from '../../api/token';

@Component({
  selector: 'app-enroll-otp',
  templateUrl: './enroll-otp-dialog.component.html',
  styleUrls: ['./enroll-otp-dialog.component.scss']
})
export class EnrollOtpDialogComponent implements OnInit {

  public enrollmentForm: FormGroup;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;

  public enrolledToken: { serial: string, url: string };

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollOtpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails },
    public notificationService: NotificationService,
  ) { }

  public ngOnInit() {
    this.enrollmentForm = this.formBuilder.group({
      'description': ['', Validators.required],
      'type': this.data.tokenTypeDetails.type,
      'otplen': 6,
      'hashlib': 'sha1',
      'genkey': 1,
      'timeStep': 30
    });
    this.enrollmentStep = this.formBuilder.group({
      'tokenEnrolled': ['', Validators.required],
    });
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public enrollToken(stepper: MatStepper) {
    if (this.data.tokenTypeDetails.type !== TokenType.TOTP) {
      this.enrollmentForm.removeControl('timeStep');
    }

    this.tokenService.enroll(this.enrollmentForm.value).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.googleurl.value,
          serial: response.detail.serial
        };
        this.enrollmentForm.controls.description.disable();
        this.enrollmentStep.controls.tokenEnrolled.setValue(true);
        stepper.next();
      } else {
        this.notificationService.message('There was a problem while enrolling the new token. Please try again.');
      }
    });
  }

  public setPin() {
    const config = {
      width: '25em',
      data: this.enrolledToken
    };
    const dialogRef = this.dialog.open(SetPinDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pinSet = true;
        this.notificationService.message('PIN set');
      } else {
        this.notificationService.message('There was an error and the new PIN could not be set. Please try again.');
      }
    });
  }

  /**
   * Cancel the dialog and return false as result
   */
  public cancelDialog() {
    if (this.enrolledToken) {
      this.tokenService.deleteToken(this.enrolledToken.serial).subscribe();
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
