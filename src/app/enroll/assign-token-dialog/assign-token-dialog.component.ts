import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

import { EnrollDialogBase, EnrolledToken } from '@app/enroll/enroll-dialog-base.directive';
import { GetSerialDialogComponent } from '@common/get-serial-dialog/get-serial-dialog.component';
import { SelfserviceToken, TokenType } from "@api/token";
import { concatMap, EMPTY, of } from "rxjs";
import { TestService } from "@api/test.service";
import { map } from "rxjs/operators";
import { SMSEnrolledToken } from "@app/enroll/enroll-sms-dialog/enroll-sms-dialog.component";
import { EmailEnrolledToken } from "@app/enroll/enroll-email-dialog/enroll-email-dialog.component";


@Component({
  selector: 'app-assign-token-dialog',
  templateUrl: './assign-token-dialog.component.html',
  styleUrls: ['./assign-token-dialog.component.scss']
})
export class AssignTokenDialogComponent extends EnrollDialogBase implements OnInit {

  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  @ViewChild('serialInput') public serialInput: ElementRef;
  private testService = inject(TestService);
  /**
   * needed for the QR Code in case Push or QR was assigned
   */
  protected transactionData: string;


  ngOnInit() {
    this.createTokenForm.addControl('serial', this.formBuilder.control('', Validators.required));
    super.ngOnInit();
  }

  /**
   * Submit token serial to token service for self-assignment. If successful,
   * display a success message, otherwise display an error message and the possibility
   * to retry the assignment process without leaving the dialog.
   */
  public assignToken() {
    const serial = this.createTokenForm.get('serial').value;
    const description = this.createTokenForm.get('description').value;
    let pin = '';
    if (this.setOtpPinPolicyEnabled) {
      pin = this.createTokenForm.get('pinForm').get('pin').value
    }
    this.subscriptions.push(
      this.enrollmentService.assign(serial, description, pin).pipe(
        concatMap(res => {
          // We want to know the token type
          if (res.success) return this.tokenService.getToken(serial);
          this.showError();
          return EMPTY;
        }),
        concatMap(token => {
          if (token.tokenType !== TokenType.PUSH && token.tokenType !== TokenType.QR) {
            return of({ token, transactionDetail: undefined });
          }
          return this.testService.testToken({ serial: token.serial }).pipe(
            map(transactionDetail => ({ token, transactionDetail }))
          );
        }),
      ).subscribe(({ token, transactionDetail }) => {
        if (!token) {
          this.showError();
        } else {
          this.enrolledToken = this.getTokenData(token);
          if (token.tokenType === TokenType.QR || token.tokenType === TokenType.PUSH) {
            this.transactionData = transactionDetail?.transactionData;
            this.subscriptions.push(this.testService.statusPoll(transactionDetail.transactionId).subscribe(data => {
              if (data.accept || data.reject || data.valid_tan) {
                this.proceedToNextStep();
              } else {
                this.showError();
              }
            }));
          }
          this.proceedToNextStep();
        }
      })
    )
  }

  public getSerial() {
    this.subscriptions.push(
      this.dialog.open(GetSerialDialogComponent).afterClosed().subscribe(serial => {
        if (!serial) return;
        this.notificationService.message($localize`Serial number retrieved.`);
        this.createTokenForm.controls.serial.setValue(serial);
        this.serialInput.nativeElement.focus();
      })
    )
  }

  private proceedToNextStep() {
    this.stepper.steps.get(this.stepper.selectedIndex).completed = true;
    this.stepper.next();
  }

  private showError() {
    this.notificationService.errorMessage($localize`Token assignment failed.`);
  }


  private getTokenData(token: SelfserviceToken): EnrolledToken {
    let res = { serial: token.serial, description: token.description, type: token.tokenType as TokenType };
    switch (token.tokenType) {
      case TokenType.SMS:
        return <SMSEnrolledToken>{ ...res, phone: token.phone }
      case TokenType.EMAIL:
        return <EmailEnrolledToken>{ ...res, email: token.email }
      default :
        return res
    }
  }

  protected readonly TokenType = TokenType;
}
