import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatStepper, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SetPinDialogComponent } from '../../common/set-pin-dialog/set-pin-dialog.component';
import { NotificationService } from '../../common/notification.service';

import { TokenService } from '../../api/token.service';
import { TokenType, TokenTypeDetails, EnrollToken } from '../../api/token';
import { Permission } from '../../common/permissions';

@Component({
  selector: 'app-enroll-oath',
  templateUrl: './enroll-oath-dialog.component.html',
  styleUrls: ['./enroll-oath-dialog.component.scss']
})
export class EnrollOATHDialogComponent implements OnInit {

  public Permission = Permission;

  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;

  public enrolledToken: { serial: string, url: string };

  constructor(
    private formBuilder: FormBuilder,
    private tokenService: TokenService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollOATHDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails },
    public notificationService: NotificationService,
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

  public enrollToken(stepper: MatStepper) {
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
          serial: response.result.value.oathtoken.serial
        };
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
