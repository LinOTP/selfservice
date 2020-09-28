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
import { UserInfo, UserSystemInfo } from '../../system.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-enroll-sms',
  templateUrl: './enroll-sms-dialog.component.html',
  styleUrls: ['./enroll-sms-dialog.component.scss']
})
export class EnrollSMSDialogComponent implements OnInit {

  public Permission = Permission;

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;
  public testStep: FormGroup;

  public pinSet: boolean;
  public showDetails = false;

  public enrolledTokenSerial: string;

  public canEditPhone: boolean;
  public userPhone: string;

  constructor(
    private formBuilder: FormBuilder,
    private operationsService: OperationsService,
    private enrollmentService: EnrollmentService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EnrollSMSDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tokenTypeDetails: TokenTypeDetails, closeLabel: String },
    public notificationService: NotificationService,
    public permissionsService: NgxPermissionsService,
  ) { }

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditPhone = settings.edit_sms === undefined || Boolean(settings.edit_sms);
    this.userPhone = userData.mobile;

    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    if (this.canEditPhone) {
      this.enrollmentStep.addControl('phoneNumber', this.formBuilder.control(this.userPhone, Validators.required));
    }
    this.testStep = this.formBuilder.group({
      'otp': ['', Validators.required],
      'pin': ''
    });
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const phoneNumber = this.canEditPhone ? this.enrollmentStep.get('phoneNumber').value : this.userPhone;
    const body: EnrollToken = {
      type: this.data.tokenTypeDetails.type,
      description: `${description} - ${phoneNumber}`,
      phone: phoneNumber,
    };

    this.enrollmentService.enroll(body).subscribe(response => {
      const serial = response &&
        response.result && response.result.value &&
        response.detail && response.detail.serial;
      if (serial) {
        this.enrolledTokenSerial = serial;
        this.stepper.next();
      } else {
        this.notificationService
          .message($localize`There was a problem while creating the new token. Please try again.`);
      }
      this.enrollmentStep.enable();
    });
  }

  public setPin() {
    const config = {
      width: '25em',
      data: { serial: this.enrolledTokenSerial },
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
    if (this.enrolledTokenSerial && this.permissionsService.hasPermission(Permission.DELETE)) {
      this.operationsService.deleteToken(this.enrolledTokenSerial).subscribe();
    }
    this.dialogRef.close(false);
  }

  /**
   * Close the dialog and return serial of successfully created token
   */
  public closeDialog() {
    this.dialogRef.close(this.enrolledTokenSerial);
  }

}
