import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { of, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


import { EnrollmentService } from '@api/enrollment.service';
import { SelfserviceToken, TokenDisplayData, tokenDisplayData, TokenType } from '@api/token';

@Component({
  selector: 'app-activate-dialog',
  templateUrl: './activate-dialog.component.html',
  styleUrls: ['./activate-dialog.component.scss']
})
export class ActivateDialogComponent implements OnDestroy {
  public waitingForResponse: boolean;
  public restartDialog = false;

  public isQR = false;
  public isPush = false;

  public transactionId: string = null;
  public tokenQRUrl: string = null;
  public pin = '';

  public typeDetails: TokenDisplayData;
  public currentStep: number = 0;

  private pairingSubscription: Subscription;

  constructor(
    private enrollmentService: EnrollmentService,
    private dialogRef: MatDialogRef<ActivateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serial: string, type: TokenType, token?: SelfserviceToken },
  ) {
    this.isPush = data.type === TokenType.PUSH;
    this.isQR = data.type === TokenType.QR;
    this.typeDetails = tokenDisplayData.find((d) => d.type === data.type);
  }

  public activateToken(stepper: MatStepper): void {
    this.waitingForResponse = true;

    stepper.next();

    this.pairingSubscription = this.enrollmentService.activate(this.data.serial, this.pin).pipe(
      tap(detail => {
        if (!detail || !(detail.transactionid)) {
          throw new Error();
        }
      }),
      tap(detail => {
        this.transactionId = detail.transactionid.toString().slice(0, 6);
        if (this.data.type === TokenType.QR) {
          if (!(detail.message)) {
            throw new Error();

          }
          this.tokenQRUrl = detail.message;
        }
      }),
      switchMap(detail => this.enrollmentService.challengePoll(detail.transactionid, this.pin, this.data.serial)),
      map((res: { accept?: boolean, reject?: boolean, valid_tan?: boolean }) => {
        return res?.accept === true || res?.reject === true || res?.valid_tan === true;
      }),
      catchError(() => of(false)),
    ).subscribe(success => {
      this.waitingForResponse = false;
      this.restartDialog = !success;
    });
  }

  public close() {
    this.dialogRef.close();
  }

  /**
   * Resets the dialog to the initial state and
   * alows to restart the activation process
   */
  public resetDialogToInitial(stepper: MatStepper) {
    stepper.reset();
  }

  public ngOnDestroy() {
    if (this.pairingSubscription) {
      this.pairingSubscription.unsubscribe();
    }
  }

}
