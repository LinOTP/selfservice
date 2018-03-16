import { Component, OnInit } from '@angular/core';
import { EnrollToken } from '../../token';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TokenService } from '../../token.service';
import { MatStepper } from '@angular/material';
import { Router } from '@angular/router';

import { MatDialog, MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { DialogComponent } from '../../dialog/dialog.component';
import { SetPinDialogComponent } from '../../set-pin-dialog/set-pin-dialog.component';


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
  appInstallStep: FormGroup;
  enrollmentStep: FormGroup;
  appInstalled = false;
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
    public snackbar: MatSnackBar,
  ) {
    this.descriptionStep = this.formBuilder.group({
      descriptionControl: new FormControl('', Validators.required)
    });
    this.appInstallStep = this.formBuilder.group({
      appInstalledControl: new FormControl('', Validators.required)
    });
  }

  ngOnInit() { }

  enroll(stepper: MatStepper) {
    this.tokenService.enroll(this.enrollData).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.googleurl.value,
          serial: response.detail.serial
        };
        this.appInstallStep.controls.appInstalledControl.setValue(true);
        this.descriptionStep.controls.descriptionControl.disable();
        stepper.next();
      }
    });
  }

  testToken() {
    this.tokenService.testToken(this.enrolledToken.serial, this.pin, this.otp).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.testSuccessful = true;
      } else if (response.result && response.result.value === false) {
        this.authenticationFailed = true;
      }
    });
  }

  goToAppStep(stepper: MatStepper) {
    this.appInstalled = false;
    stepper.selectedIndex = 1;
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
        this.notifyMessage('PIN set', 2000);
      }
    });
  }

  notifyMessage(message: string, duration: number) {
    const snackbarConfig = new MatSnackBarConfig();
    snackbarConfig.duration = duration;
    this.snackbar.open(message, '', snackbarConfig);
  }
}
