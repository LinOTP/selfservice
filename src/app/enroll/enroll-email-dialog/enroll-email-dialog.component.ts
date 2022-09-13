import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TokenType } from '@linotp/data-models';
import { EnrollmentOptions } from '../../api/token';
import { UserInfo, UserSystemInfo } from '../../system.service';
import { EnrollDialogBaseComponent } from '../enroll-dialog-base.component';


@Component({
  selector: 'app-enroll-email',
  templateUrl: './enroll-email-dialog.component.html',
  styleUrls: ['./enroll-email-dialog.component.scss']
})
export class EnrollEmailDialogComponent extends EnrollDialogBaseComponent implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public enrollmentStep: FormGroup;

  public canEditEmail: boolean;
  public userEmail: string;

  public ngOnInit() {
    const userData: UserInfo = JSON.parse(localStorage.getItem('user'));
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.canEditEmail = settings.edit_email === undefined || Boolean(settings.edit_email);
    this.userEmail = userData.email;

    this.enrollmentStep = this.formBuilder.group({
      'description': [$localize`Created via SelfService`, Validators.required],
    });
    if (this.canEditEmail) {
      this.enrollmentStep.addControl('emailAddress', this.formBuilder.control(this.userEmail, Validators.required));
    }
    super.ngOnInit();
  }

  public enrollToken() {
    this.enrollmentStep.disable();
    const description = this.enrollmentStep.get('description').value;
    const emailAddress = this.canEditEmail ? this.enrollmentStep.get('emailAddress').value : this.userEmail;
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: `${description} - ${emailAddress}`,
      email_address: emailAddress,
    };

    this.enrollmentService.enroll(body).subscribe(token => {
      if (token?.serial) {
        this.enrolledToken = { serial: token.serial, type: TokenType.EMAIL };
        this.stepper.next();
      } else {
        this.enrollmentStep.enable();
      }
    });
  }
}
