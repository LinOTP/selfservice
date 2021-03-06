import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { EnrollmentService } from '../api/enrollment.service';
import { Token, TokenType } from '../api/token';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-activate-dialog',
  templateUrl: './activate-dialog.component.html',
  styleUrls: ['./activate-dialog.component.scss']
})
export class ActivateDialogComponent implements OnInit, OnDestroy {
  public waitingForResponse: boolean;
  public restartDialog: boolean;

  public isQR = false;
  public isPush = false;

  public transactionId: string = null;
  public tokenQRUrl: string = null;
  public pin = '';

  private pairingSubscription: Subscription;

  constructor(
    private enrollmentService: EnrollmentService,
    private dialogRef: MatDialogRef<ActivateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: Token },
  ) {
    if (data.token.typeDetails.type === TokenType.PUSH) {
      this.isPush = true;
    }
    if (data.token.typeDetails.type === TokenType.QR) {
      this.isQR = true;
    }
  }

  public ngOnInit() {
    this.waitingForResponse = false;
  }

  public ngOnDestroy() {
    if (this.pairingSubscription) {
      this.pairingSubscription.unsubscribe();
    }
  }

  public activateToken(stepper: MatStepper): void {

    this.restartDialog = false;
    this.waitingForResponse = true;

    stepper.next();

    this.pairingSubscription = this.enrollmentService.activate(this.data.token.serial, this.pin).pipe(
      tap(detail => {
        if (!detail || !(detail.transactionid)) {
          throw new Error();
        }
      }),
      tap(detail => {
        this.transactionId = detail.transactionid.toString().slice(0, 6);
        if (this.data.token.typeDetails.type === TokenType.QR) {
          if (!(detail.message)) {
            throw new Error();

          }
          this.tokenQRUrl = detail.message;
        }
      }),
      switchMap(detail => this.enrollmentService.challengePoll(detail.transactionid, this.pin, this.data.token.serial)),
      map((res: { accept?: boolean, reject?: boolean, valid_tan?: boolean }) => {
        return res?.accept === true || res?.reject === true || res?.valid_tan === true;
      }
      ),
      catchError(() => of(false)),
    ).subscribe(success => {
      this.waitingForResponse = false;
      this.restartDialog = !success;
    });
  }

  public cancelDialog() {
    this.dialogRef.close(false);
  }

  public closeDialog() {
    this.dialogRef.close(true);
  }

  /**
   * Resets the dialog to the initial state and
   * alows to restart the activation process
   */
  public resetDialogToInitial(stepper: MatStepper) {
    stepper.reset();
  }

}
