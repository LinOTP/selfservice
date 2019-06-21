import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';
import { TokenService } from '../../api/token.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs/index';

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
  @ViewChild('stepper') public stepper: MatStepper;

  constructor(
    private tokenService: TokenService,
    private dialogRef: MatDialogRef<TestQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public tokenSerial: string,
  ) {
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

    this.tokenService.activate(this.tokenSerial, pin).pipe(
      tap(response => this.tokenQRUrl = response.detail.message),
      switchMap(response => this.tokenService.challengePoll(response.detail.transactionid, pin, this.tokenSerial),
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
    this.dialogRef.close();
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
