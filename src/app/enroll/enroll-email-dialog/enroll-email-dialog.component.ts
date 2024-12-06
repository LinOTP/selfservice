import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollmentOptions, TokenType } from '@api/token';
import { EnrollDialogBaseComponent } from '@app/enroll/enroll-dialog-base.component';
import { UserInfo, UserSystemInfo } from '@app/system.service';


@Component({
  selector: 'app-enroll-email',
  templateUrl: './enroll-email-dialog.component.html',
  styleUrls: ['./enroll-email-dialog.component.scss']
})
export class EnrollEmailDialogComponent extends EnrollDialogBaseComponent implements OnInit {
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

  public enrollToken() {
    this.createTokenForm.disable();
    const description = this.createTokenForm.get('description').value;
    const emailAddress = this.canEditEmail ? this.createTokenForm.get('emailAddress').value : this.userEmail;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: `${description} - ${emailAddress}`,
      email_address: emailAddress,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.EMAIL };
        this.stepper.steps.get(0).completed = true;
        this.stepper.next();
      } else {
        this.createTokenForm.enable();
      }
    });
  }
}
