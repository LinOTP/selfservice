import { Component, OnInit } from '@angular/core';
import { EnrollToken } from '../../token';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TokenService } from '../../token.service';
import { MatStepper } from '@angular/material';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material';
import { SetPinDialogComponent } from '../../set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-enroll-hotp',
  templateUrl: './enroll-hotp.component.html',
  styleUrls: ['./enroll-hotp.component.scss']
})
export class EnrollHotpComponent implements OnInit {

  descriptionStep: FormGroup;
  enrollmentStep: FormGroup;
  testStep: FormGroup;

  pinSet: boolean;
  testSuccessful: boolean;
  testFailed: boolean;

  public enrolledToken: { serial: string, url: string };

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    private router: Router,
    public dialog: MatDialog,
    public notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.descriptionStep = this.formBuilder.group({
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

  goToTokenInfo(stepper: MatStepper) {
    if (!this.enrolledToken) {
      this.tokenService.enroll(this.descriptionStep.value).subscribe(response => {
        if (response.result && response.result.value === true) {
          this.enrolledToken = {
            url: response.detail.googleurl.value,
            serial: response.detail.serial
          };
          this.descriptionStep.controls.description.disable();
          this.enrollmentStep.controls.tokenEnrolled.setValue(true);
          stepper.next();
        } else {
          this.notificationService.message('There was a problem while enrolling the new token. Please try again.');
        }
      });
    } else {
      stepper.next();
    }
  }

  testToken() {
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

  goToAppStep(stepper: MatStepper) {
    stepper.selectedIndex = 0;
  }

  cancel() {
    this.router.navigate(['../']);
  }

  setPin() {
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
}
