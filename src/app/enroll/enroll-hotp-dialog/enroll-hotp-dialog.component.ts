import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatStepper } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../../common/notification.service';

import { TokenService } from '../../api/token.service';

@Component({
  selector: 'app-enroll-hotp',
  templateUrl: './enroll-hotp-dialog.component.html',
  styleUrls: ['./enroll-hotp-dialog.component.scss']
})
export class EnrollHotpDialogComponent implements OnInit {

  public enrollmentForm: FormGroup;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;
  public testSuccessful: boolean;
  public testFailed: boolean;
  public readonly maxSteps: number = 4;
  public currentStep: number;

  public enrolledToken: { serial: string, url: string };

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollHotpDialogComponent>,
    public notificationService: NotificationService,
  ) {
  }

  public ngOnInit() {
    this.currentStep = 1;
    this.enrollmentForm = this.formBuilder.group({
      'description': ['', Validators.required],
      'type': 'hmac',
      'otplen': 6,
      'hashlib': 'sha1',
      'genkey': 1
    });
    this.enrollmentStep = this.formBuilder.group({
      'tokenEnrolled': ['', Validators.required],
    });
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public goToTokenInfo(stepper: MatStepper) {
    if (!this.enrolledToken) {
      this.tokenService.enroll(this.enrollmentForm.value).subscribe(response => {
        if (response.result && response.result.value === true) {
          this.enrolledToken = {
            url: response.detail.googleurl.value,
            serial: response.detail.serial
          };
          this.enrollmentForm.controls.description.disable();
          this.enrollmentStep.controls.tokenEnrolled.setValue(true);
          this.incrementStep(stepper);
        } else {
          this.notificationService.message('There was a problem while enrolling the new token. Please try again.');
        }
      });
    } else {
      this.incrementStep(stepper);
    }
  }

  public testToken() {
    this.tokenService.testToken(this.enrolledToken.serial, this.testStep.controls.pin.value, this.testStep.controls.otp.value)
      .subscribe(response => {
        if (response.result && response.result.value === true) {
          this.testSuccessful = true;
          this.testFailed = false;
        } else if (response.result && response.result.value === false) {
          this.testFailed = true;
          this.testSuccessful = false;
        }
      });
  }

  public goToAppStep(stepper: MatStepper) {
    stepper.selectedIndex = 0;
    this.currentStep = 1;
    this.testFailed = false;
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
      }
    });
  }

  /**
   * Increment the current step of the dialog for the view
   */
  public incrementStep(stepper: MatStepper) {
    stepper.next();
    this.currentStep++;
  }

  /**
   * Cancel the dialog and return false as result
   */
  public cancelDialog() {
    this.dialogRef.close({ result: false });
  }

  /**
   * Close the dialog and return true for successfull creation
   */
  public closeDialog() {
    this.dialogRef.close({ result: true });
  }
}
