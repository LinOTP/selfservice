import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions, TokenType } from '@api/token';
import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';
import { UserInfo, UserSystemInfo } from '@app/system.service';

@Component({
  selector: 'app-enroll-sms',
  templateUrl: './enroll-sms-dialog.component.html',
  styleUrls: ['./enroll-sms-dialog.component.scss']
})
export class EnrollSMSDialogComponent extends EnrollDialogBase implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;

  public canEditPhone: boolean;
  public userPhone: string;

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

  public enrollToken() {
    this.createTokenForm.disable();
    const description = this.createTokenForm.get('description').value;
    const phoneNumber = this.canEditPhone ? this.createTokenForm.get('phoneNumber').value : this.userPhone;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: `${description} - ${phoneNumber}`,
      phone: phoneNumber,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.SMS };
        this.stepper.steps.get(0).completed = true
        this.stepper.next();
      } else {
        this.createTokenForm.enable();
      }
    });
  }
}
