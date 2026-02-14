import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { TokenType } from '@app/api/token';
import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';

@Component({
  selector: 'app-enroll-yubico',
  templateUrl: './enroll-yubico-dialog.component.html',
  styleUrls: ['./enroll-yubico-dialog.component.scss'],
  standalone: false
})
export class EnrollYubicoDialogComponent extends EnrollDialogBase implements OnInit {
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;

  ngOnInit() {
    this.createTokenForm.addControl('publicId',
      this.formBuilder.control('', [Validators.required/*, Validators.minLength(12), Validators.maxLength(12)*/])
    );
    super.ngOnInit();
  }

  /**
   * Submit token serial to token service for registration. If successful,
   * go to next step, otherwise display an error notification toast and remain
   * on the same step.
   */
  public registerToken() {
    if (this.createTokenForm.invalid) {
      this.announceFormErrors();
      return;
    }
    const body = {
      type: TokenType.YUBICO,
      'yubico.tokenid': this.createTokenForm.get('publicId').value,
      description: this.createTokenForm.get('description').value,
      otplen: 44,
    };
    this.subscriptions.push(
      this.enrollToken(body, this.stepper).subscribe(token => {
        this.enrolledToken = { serial: token.serial, type: TokenType.YUBICO, description: token.description };
      })
    )
  }
}
