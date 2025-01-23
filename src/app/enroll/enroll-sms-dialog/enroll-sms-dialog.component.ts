import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions } from '@api/token';
import { EnrollDialogBase, EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { UserInfo, UserSystemInfo } from '@app/system.service';

interface SMSEnrolledToken extends EnrolledToken {
  phone: string;
}
@Component({
  selector: 'app-enroll-sms',
  templateUrl: './enroll-sms-dialog.component.html',
  styleUrls: ['./enroll-sms-dialog.component.scss']
})
export class EnrollSMSDialogComponent extends EnrollDialogBase implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;

  public canEditPhone: boolean;
  public userPhone: string;
  public enrolledToken: SMSEnrolledToken;

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditPhone = settings.edit_sms === undefined || Boolean(settings.edit_sms);
    this.userPhone = userData.mobile;
    if (this.canEditPhone) {
      this.createTokenForm.addControl('phoneNumber', this.formBuilder.control(this.userPhone, Validators.required));
    }
    super.ngOnInit();
  }

  public enrollSMSToken() {
    const description = this.createTokenForm.get('description').value;
    const phoneNumber = this.canEditPhone ? this.createTokenForm.get('phoneNumber').value : this.userPhone;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: `${description} - ${phoneNumber}`,
      phone: phoneNumber,
    };
    this.enrollToken(body, this.stepper).subscribe((token: EnrolledToken) => {
      this.enrolledToken = { ...token, phone: body.phone };
    })
  }
}
