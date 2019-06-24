import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';

import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs/index';

import { TokenService } from '../../api/token.service';
import { Token } from '../../api/token';

@Component({
  selector: 'app-test-qr-dialog',
  templateUrl: './test-qr-dialog.component.html',
  styleUrls: ['./test-qr-dialog.component.scss']
})
export class TestQrDialogComponent implements OnInit {
  public waitingForResponse: boolean;
  public readonly maxSteps: number = 2;
  public currentStep: number;
  public restartDialog: boolean;
  public tokenQRUrl: string;
  public showError: boolean;
  public isActivation = false;
  @ViewChild('stepper') public stepper: MatStepper;

  constructor(
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<TestQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: Token, activate?: boolean },
  ) {
    if (data.activate) {
      this.isActivation = true;
    }
  }

  public ngOnInit() {
    this.waitingForResponse = false;
    this.currentStep = 1;
    this.activateToken();
  }

  public activateToken(): void {
    const pin = '';

    this.restartDialog = false;
    this.waitingForResponse = true;
    this.showError = false;

    this.tokenService.activate(this.data.token.serial, pin).pipe(
      tap(response => this.tokenQRUrl = response.detail.message),
      switchMap(response => this.tokenService.challengePoll(response.detail.transactionid, pin, this.data.token.serial),
      ),
      catchError(this.handleError('QR token activation', false)),
    ).subscribe((res: boolean) => {
      if (res) {
        this.waitingForResponse = false;
      } else {
        this.waitingForResponse = false;
        this.restartDialog = true;
      }
      this.incrementStep();
    });
  }

  public cancelDialog() {
    this.dialogRef.close(false);
  }

  public closeDialog() {
    this.dialogRef.close(true);
  }

  /**
   * Increment the current step of the dialog for the view
   */
  public incrementStep() {
    this.stepper.next();
    this.currentStep++;
  }

  /**
   * Resets the dialog to the initial state and
   * allows to restart the activation process
   */
  public resetDialogToInitial(stepper: MatStepper) {
    stepper.reset();
    this.currentStep = 1;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.showError = true;
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }

}
