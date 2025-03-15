import { Directive, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { NgxPermissionsService } from 'ngx-permissions';
import { forkJoin, from, Observable, of, Subscription } from 'rxjs';
import { filter, finalize, map, switchMap, tap } from 'rxjs/operators';


import { EnrollmentService } from '@api/enrollment.service';
import { OperationsService } from '@api/operations.service';
import { EnrollmentOptions, tokenDisplayData, TokenDisplayData, TokenType } from '@api/token';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { TestDialogComponent } from '@app/test/test-dialog.component';
import { DialogComponent } from '@common/dialog/dialog.component';
import { NotificationService } from '@common/notification.service';
import { Permission } from '@common/permissions';
import { SetPinDialogComponent } from '@common/set-pin-dialog/set-pin-dialog.component';
import { getCreateTokenStepForm } from "@app/enroll/create-token-step/create-token-step.component";
import { MatStepper } from "@angular/material/stepper";


export interface EnrolledToken {
  serial: string;
  lse_qr_url?: {
    value: string;
  };
  otpkey?: { value: string };
  googleurl?: { value: string };
  type: TokenType;
  description?: string;
}

@Directive()
export abstract class EnrollDialogBase implements OnInit, OnDestroy {
  protected subscriptions: Subscription[] = [];
  public enrolledToken: EnrolledToken;
  public testAfterEnrollment = false;
  public canBeActivated = false;
  public closeLabel = $localize`Close`;
  public tokenDisplayData: TokenDisplayData;
  public Permission = Permission;
  private _verifyPolicyEnabled: boolean;
  private _setOtpPinPolicyEnabled: boolean = false;
  createTokenForm = getCreateTokenStepForm();
  protected isTokenVerified: boolean = false;
  awaitingResponse = false

  constructor(
    protected dialogRef: MatDialogRef<EnrollDialogBase>,
    protected permissionsService: NgxPermissionsService,
    protected enrollmentService: EnrollmentService,
    protected tokenService: TokenService,
    protected formBuilder: UntypedFormBuilder,
    protected notificationService: NotificationService,
    protected operationsService: OperationsService,
    protected dialog: MatDialog,
    protected loginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: { tokenType: TokenType; },
  ) {
    this.tokenDisplayData = tokenDisplayData.find(d => d.type === data.tokenType);
  }

  public ngOnInit() {
    this.subscriptions.push(
      this.loginService
        .hasPermission$(Permission.VERIFY)
        .subscribe(hasPermission => {
          if (hasPermission) {
            this.closeLabel = $localize`Test`;
            this.testAfterEnrollment = true;
          }
        })
    );
    this._getPermissions().subscribe((hasPermissions) => {
      this._verifyPolicyEnabled = hasPermissions.verify;
      this._setOtpPinPolicyEnabled = hasPermissions.setPin;
    })
  }

  public ngOnDestroy() {
    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }
  }

  /**
   * If a token has been created successfully, update the token list.
   * Close the enrollment dialog.
   */
  public close() {
    if (this.isTokenCreated()) {
      this.tokenService.updateTokenList();
    }
    this.dialogRef.close();
  }


  public enrollToken(enrollmentOptions: EnrollmentOptions, stepper: MatStepper): Observable<EnrolledToken> {
    if (this.createTokenForm.invalid) return of(undefined);
    if (this.setOtpPinPolicyEnabled) {
      enrollmentOptions.pin = this.createTokenForm.get('pinForm').get('pin').value
    }
    this.awaitingResponse = true;
    return this.enrollmentService.enroll(enrollmentOptions).pipe(
      filter(token => token?.serial !== undefined && token?.serial != null),
      map(token => ({
        ...token,
        type: enrollmentOptions.type,
        description: enrollmentOptions.description,
      }) as EnrolledToken),
      tap(() => {
        this.notificationService.message($localize`Token enrolled successfully.`);
        setTimeout(() => {
          stepper.steps.get(stepper.selectedIndex).completed = true;
          stepper.next();
        }, 100);
      }),
      finalize(() => this.awaitingResponse = false)
    );
  }

  /**
   * Check if token should be tested. If yes, open the test dialog. On close,
   * return true to signalize a successful enrollment (independently of the test
   * result).
   */
  public finalizeEnrollment() {
    if (this.testAfterEnrollment) {
      const token$ = this.tokenService.getToken(this.enrolledToken.serial)
      const dialogClosed$ = this.dialogRef.afterClosed()
      forkJoin([token$, dialogClosed$]).pipe(
        tap(([token, _]) => {
          const testConfig: MatDialogConfig = {
            width: '650px',
            data: { serial: this.enrolledToken.serial, type: this.enrolledToken.type, token: token }
          };
          this.dialog.open(TestDialogComponent, testConfig)
        })
      ).subscribe()
    }
    this.close();
  }

  /**
   *  Show the user a confirmation dialog for canceling the enrollment of the push token.
   *
   *  If the user confirms it, the enrolled token is deleted, a notification is shown and the
   *  enrollment dialog is closed.
   */
  public cancel() {
    const deletionText = $localize`The incomplete token will be deleted.`;
    const unusableTokenText = $localize`The incomplete token will not be ready for use.`;
    const restartText = $localize`You will have to restart the setup process in order to use this type of token.`;

    let canDelete: boolean;

    from(this.permissionsService.hasPermission(Permission.DELETE)).pipe(
      tap(res => canDelete = res),
      switchMap(() => {
        const dialogConfig = {
          width: '35em',
          autoFocus: false,
          disableClose: true,
          data: {
            title: $localize`Stop setting up your new token?`,
            text: `${canDelete ? deletionText : unusableTokenText} ${restartText}`,
            confirmationLabel: $localize`Confirm`,
          }
        };
        return this.dialog.open(DialogComponent, dialogConfig).afterClosed();
      }),
      switchMap((confirmed) => {
        if (this.enrolledToken && confirmed && canDelete) {
          return this.operationsService.deleteToken(this.enrolledToken.serial).pipe(
            tap(response => {
              if (response) {
                this.tokenService.updateTokenList();
                this.notificationService.message($localize`Incomplete token was deleted`);
              }
            }),
            map(() => true), // we just want to pass along whether the user confirmed the cancelation
          );
        } else {
          return of(!!confirmed);
        }
      }),
      filter(confirmed => confirmed),
    ).subscribe(() => {
      this.close();
    });
  }

  public setPin() {
    const config = {
      width: '35em',
      data: this.enrolledToken
    };
    this.dialog
      .open(SetPinDialogComponent, config)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.notificationService.message($localize`PIN set`);
        }
      });
  }

  public set setOtpPinPolicyEnabled(value) {
    this._setOtpPinPolicyEnabled = value;
    if (!value) {
      this.createTokenForm.get('pinForm').disable();
    } else {
      this.createTokenForm.get('pinForm').enable();
    }
  }

  get setOtpPinPolicyEnabled() {
    return this._setOtpPinPolicyEnabled;
  }

  get verifyPolicyEnabled() {
    return this._verifyPolicyEnabled;
  }

  private _getPermissions() {
    const verify = this.permissionsService.hasPermission(Permission.VERIFY)
    const setPin = this.permissionsService.hasPermission(Permission.SETPIN)
    return from(Promise.all([verify, setPin])).pipe(
      map(([verify, setPin]) => ({ verify, setPin }))
    )
  }

  private isTokenCreated(): boolean {
    return this.enrolledToken?.serial?.length > 0;
  }

}
