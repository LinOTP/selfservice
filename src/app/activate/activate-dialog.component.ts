import { LiveAnnouncer } from '@angular/cdk/a11y';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { EMPTY, from, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';


import { ActivationDetail, EnrollmentService } from '@api/enrollment.service';
import { SelfserviceToken, TokenType } from '@api/token';
import { TokenService } from '@app/api/token.service';
import { convertToWebAuthnOptions, getOrigin, invalidOriginForRpIdErrMsg, isFido2Supported, isOriginValidForRpId, mapCredentialToAttestationResponse } from '@app/enroll/enroll-fido2-dialog/fido2-utils';
import { Fido2RegistrationCredential } from '@app/enroll/enroll-fido2-dialog/enroll-fido2-dialog.component';


@Component({
  selector: 'app-activate-dialog',
  templateUrl: './activate-dialog.component.html',
  styleUrls: ['./activate-dialog.component.scss'],
  standalone: false
})
export class ActivateDialogComponent implements OnDestroy {
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  public stepperChanged = false;

  public awaitingActivationInitResp = false;
  public restartDialog = false;
  public errMsg: string;

  public isQR = false;
  public isPush = false;
  public isFIDO2 = false;

  public transactionId: string = null;
  public tokenQRUrl: string = null;
  public pin = '';

  private pairingSubscription: Subscription = new Subscription();

  constructor(
    private tokenService: TokenService,
    private enrollmentService: EnrollmentService,
    private dialogRef: MatDialogRef<ActivateDialogComponent>,
    private liveAnnouncer: LiveAnnouncer,
    @Inject(MAT_DIALOG_DATA) public data: { token: SelfserviceToken },
  ) {
    this.isPush = data.token.tokenType === TokenType.PUSH;
    this.isQR = data.token.tokenType === TokenType.QR;
    this.isFIDO2 = data.token.tokenType === TokenType.FIDO2;

    if (this.isFIDO2 && !isOriginValidForRpId(getOrigin(), this.data.token.rpId)) {
      this.errMsg = invalidOriginForRpIdErrMsg(this.data.token.rpId)
      console.error(`${this.data.token.serial}: ${this.errMsg}`)
      this.restartDialog = true
    }
  }

  public onStepChange(event: StepperSelectionEvent): void {
    this.stepperChanged = true;
    setTimeout(() => {
      const stepLabel = event.selectedStep?.label || 'next step';
      this.liveAnnouncer.announce($localize`Moved to step: ${stepLabel}`, 'polite');
    }, 500);
  }

  public activateToken(): void {
    this.awaitingActivationInitResp = true;
    if(this.isFIDO2){
      this.stepper.next()
      this.pairingSubscription.add(this.activateFIDO2().subscribe())
      return
    }
    this.pairingSubscription.add(this.enrollmentService.activate(this.data.token.serial).pipe(
      tap((details: ActivationDetail) => {
        this.transactionId = details.transactionid.toString().slice(0, 6);
        if (this.isQR) this.tokenQRUrl = details.message;
      }),
      switchMap((details: ActivationDetail) => {
        this.awaitingActivationInitResp = false;
        this.stepper.next();
        return this.enrollmentService.challengePoll(details.transactionid);
      }),
      map((res: { accept?: boolean, reject?: boolean, valid_tan?: boolean }) => {
        return res?.accept === true || res?.reject === true || res?.valid_tan === true;
      }),
      catchError(() => {
        this.awaitingActivationInitResp = false;
        return of(false)
      }
      ),
    ).subscribe(success => {
      if (success) this.stepper.next()
      this.restartDialog = !success;
      if (!success) {
        this.liveAnnouncer.announce($localize`Activation failed. Please try again, or contact an administrator.`, 'assertive');
      }
    }));
  }

    activateFIDO2(): Observable<ActivationDetail> {
      this.restartDialog = false
      this.awaitingActivationInitResp = true;
      this.errMsg = ""
      return this.enrollmentService.fido2_activate_begin(this.data.token.serial, TokenType.FIDO2)
        .pipe(
          switchMap((res) => from(navigator.credentials.create({publicKey: convertToWebAuthnOptions(res)}))),
          map((creds: Fido2RegistrationCredential) => mapCredentialToAttestationResponse(creds)),
          switchMap((attestationResponse) => this.enrollmentService.fido2_activate_finish( this.data.token.serial, attestationResponse)),
          tap((res) => res ? this.stepper.next() : this.handleError()),
          catchError((err) => this.handleError(err)),
          finalize(()=> this.awaitingActivationInitResp = false)
        )
    }

    handleError(errMsg?: string) {
      const genericError = $localize`Token activation failed: Please try again.`
      const notSupportedErr = $localize`Your browser does not support FIDO2 enrollment.`
      this.errMsg = !isFido2Supported() ? notSupportedErr : errMsg ?? genericError
      console.error(`${this.data.token.serial}: ${this.errMsg}`)
      this.restartDialog = true;
      return EMPTY;
    }

  public close() {
    if (this.stepperChanged) this.tokenService.updateTokenList();
    this.dialogRef.close();
  }

  public restart() {
    this.restartDialog = false
    if(this.isFIDO2){
        this.pairingSubscription.add(this.activateFIDO2().subscribe())
    } else {
      this.stepper.steps.get(this.stepper.selectedIndex).completed = false
      this.stepper.previous()
    }
  }

  public ngOnDestroy() {
    if (this.pairingSubscription) {
      this.pairingSubscription.unsubscribe();
    }
  }

}
