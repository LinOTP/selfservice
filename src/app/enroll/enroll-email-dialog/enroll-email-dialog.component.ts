import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions } from '@api/token';
import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';
import { UserInfo, UserSystemInfo } from '@app/system.service';


@Component({
  selector: 'app-enroll-email',
  templateUrl: './enroll-email-dialog.component.html',
  styleUrls: ['./enroll-email-dialog.component.scss']
})
export class EnrollEmailDialogComponent extends EnrollDialogBase implements OnInit {
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public canEditEmail: boolean;
  public userEmail: string;

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditEmail = settings.edit_email === undefined || Boolean(settings.edit_email);
    this.userEmail = userData.email;
    if (this.canEditEmail) {
      this.createTokenForm.addControl('emailAddress', this.formBuilder.control(this.userEmail, [Validators.required, Validators.email]));
    }
    super.ngOnInit();
  }

  public enrollEmailToken() {
    const description = this.createTokenForm.get('description').value;
    const emailAddress = this.canEditEmail ? this.createTokenForm.get('emailAddress').value : this.userEmail;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: `${description} - ${emailAddress}`,
      email_address: emailAddress,
    };
    this.enrollToken(body, this.stepper)
  }
}
