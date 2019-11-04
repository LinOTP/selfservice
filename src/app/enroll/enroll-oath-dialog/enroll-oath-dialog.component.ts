import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../../common/notification.service';

import { TokenService } from '../../api/token.service';
import { TokenType, TokenTypeDetails, EnrollToken } from '../../api/token';
import { Permission } from '../../common/permissions';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-enroll-oath',
  templateUrl: './enroll-oath-dialog.component.html',
  styleUrls: ['./enroll-oath-dialog.component.scss']
})
export class EnrollOATHDialogComponent implements OnInit {

  public Permission = Permission;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;
  public showDetails = false;

  public enrolledToken: { serial: string, url: string, seed: string };

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollOATHDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails },
    public notificationService: NotificationService,
    public i18n: I18n,
  ) { }

  public ngOnInit() {
    this.enrollmentStep = this.formBuilder.group({
      'tokenEnrolled': ['', Validators.required],
    });
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public enrollToken() {
    const body: EnrollToken = {
      type: TokenType.HOTP,
    };

    if (this.data.tokenTypeDetails.type === TokenType.TOTP) {
      body.type = TokenType.TOTP;
    }

    this.tokenService.enrollOATH(body).subscribe(response => {
      if (response.result
        && response.result.status
        && response.result.value
        && response.result.value.oathtoken) {
        this.enrolledToken = {
          url: response.result.value.oathtoken.url,
          serial: response.result.value.oathtoken.serial,
          seed: response.result.value.oathtoken.key,
        };
        this.enrollmentStep.controls.tokenEnrolled.setValue(true);
        this.stepper.next();
      } else {
        this.notificationService.message(this.i18n('There was a problem while enrolling the new token. Please try again.'));
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
        this.notificationService.message(this.i18n('PIN set'));
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

  copyInputMessage(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.notificationService.message(this.i18n('Copied'));
  }

}
