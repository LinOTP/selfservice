import { Component, OnInit } from '@angular/core';
import { EnrollToken } from '../../token';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  testSuccessful = false;
  pinSet = false;
  otp = '';
  pin = '';

  public enrollData: EnrollHotpToken = {
    type: 'hmac',
    description: '',
    otplen: 6,
    hashlib: 'sha1',
    genkey: 1,
  };

  public enrolledToken: { serial: string, url: string }/*  = { serial: '', url: '' } */;

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    private router: Router,
    public dialog: MatDialog,
    public snackbar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  enroll(stepper: MatStepper) {
    this.tokenService.enroll(this.enrollData).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.enrolledToken = {
          url: response.detail.googleurl.value,
          serial: response.detail.serial
        };
        stepper.next();
      }
    });
  }

  testToken() {
    this.tokenService.testToken(this.enrolledToken.serial, this.pin, this.otp).subscribe(response => {
      if (response.result && response.result.value === true) {
        this.testSuccessful = true;
      }
    });
  }

  goToAppStep(stepper: MatStepper) {
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
