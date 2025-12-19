import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { of, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


import { ActivationDetail, EnrollmentService } from '@api/enrollment.service';
import { SelfserviceToken, TokenType } from '@api/token';
import { TokenService } from '@app/api/token.service';


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

  public isQR = false;
  public isPush = false;

  public transactionId: string = null;
  public tokenQRUrl: string = null;
  public pin = '';

  private pairingSubscription: Subscription;

  constructor(
    private tokenService: TokenService,
    private enrollmentService: EnrollmentService,
    private dialogRef: MatDialogRef<ActivateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: SelfserviceToken },
  ) {
    this.isPush = data.token.tokenType === TokenType.PUSH;
    this.isQR = data.token.tokenType === TokenType.QR;
  }

  public activateToken(): void {
    this.awaitingActivationInitResp = true;
    this.pairingSubscription = this.enrollmentService.activate(this.data.token.serial).pipe(
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
        return of(false)}
      ),
    ).subscribe(success => {
      if(success) this.stepper.next()
      this.restartDialog = !success;
    });
  }

  public close() {
    if(this.stepperChanged) this.tokenService.updateTokenList();
    this.dialogRef.close();
  }

  public goPrevious(){
    this.stepper.steps.get(this.stepper.selectedIndex).completed = false
    this.stepper.previous()
  }

  public ngOnDestroy() {
    if (this.pairingSubscription) {
      this.pairingSubscription.unsubscribe();
    }
  }

}
