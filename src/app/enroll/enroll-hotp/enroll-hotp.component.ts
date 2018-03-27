import { Component, OnInit } from '@angular/core';
import { EnrollToken } from '../../token';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TokenService } from '../../token.service';
import { MatStepper } from '@angular/material';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material';
import { SetPinDialogComponent } from '../../set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../../core/notification.service';


export interface EnrollHotpToken extends EnrollToken {
  type: 'hmac';
  otplen: number;
  hashlib: string;
  genkey: number;
}

@Component({
  selector: 'app-enroll-hotp',
  templateUrl: './enroll-hotp.component.html',
  styleUrls: ['./enroll-hotp.component.scss']
})
export class EnrollHotpComponent implements OnInit {

  descriptionStep: FormGroup;
  enrollmentStep: FormGroup;
  testSuccessful = false;
  pinSet = false;
  otp = '';
  pin = '';
  authenticationFailed: boolean;

  public enrollData: EnrollHotpToken = {
    type: 'hmac',
    description: '',
    otplen: 6,
    hashlib: 'sha1',
    genkey: 1,
  };

  public enrolledToken: { serial: string, url: string };

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    private router: Router,
    public dialog: MatDialog,
    private notificationService: NotificationService,
  ) {
    this.descriptionStep = this.formBuilder.group({
      descriptionControl: new FormControl('', Validators.required),
    });
    this.enrollmentStep = this.formBuilder.group({
      tokenEnrolled: new FormControl('', Validators.required),
    });
  }

  ngOnInit() { }

  goToTokenInfo(stepper: MatStepper) {
    if (!this.enrolledToken) {
      this.tokenService.enroll(this.enrollData).subscribe(response => {
        if (response.result && response.result.value === true) {
          this.enrolledToken = {
            url: response.detail.googleurl.value,
            serial: response.detail.serial
          };
          this.descriptionStep.controls.descriptionControl.disable();
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
    this.tokenService.testToken(this.enrolledToken.serial, this.pin, this.otp)
      .subscribe(response => {
        if (response.result && response.result.value === true) {
          this.testSuccessful = true;
        } else if (response.result && response.result.value === false) {
          this.authenticationFailed = true;
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
