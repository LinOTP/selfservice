import { Component, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialogConfig } from "@angular/material/dialog";
import { MatStepper } from "@angular/material/stepper";

import { of, Subscription } from "rxjs";
import { catchError, concatMap, map, switchMap, tap } from "rxjs/operators";

import { ActivationDetail } from "@api/enrollment.service";
import { EnrollmentOptions, SelfserviceToken, TokenType } from "@api/token";
import { ActivateDialogComponent } from "@app/activate/activate-dialog.component";
import { EnrollDialogBase } from "@app/enroll/enroll-dialog-base.directive";
import { Permission } from "@common/permissions";
import { PlatformProviderService } from "@common/platform-provider.service";

interface PushQrEnrolledToken {
  serial: string;
  type: TokenType;
  description?: string;
  url: string;
}

enum ActivationFlowState {
  NOT_STARTED = "NOT_STARTED",
  PREPARING = "PREPARING",
  WAITING_FOR_USER = "WAITING_FOR_USER",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
@Component({
  selector: "app-enroll-push",
  templateUrl: "./enroll-push-qr-dialog.component.html",
  styleUrls: ["./enroll-push-qr-dialog.component.scss"],
  providers: [PlatformProviderService],
  standalone: false
})
export class EnrollPushQRDialogComponent
  extends EnrollDialogBase
  implements OnInit, OnDestroy {
  public enrolledToken: PushQrEnrolledToken;
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  protected platformProvider = inject(PlatformProviderService);

  // Activation state
  public hasActivationPermission = false;
  public activationState = ActivationFlowState.NOT_STARTED;
  public transactionId: string = null;
  public tokenQRUrl: string = null;
  public activationSubscription: Subscription;

  // Expose enum to template
  public readonly ActivationFlowState = ActivationFlowState;

  // Computed properties for cleaner template logic
  get shouldShowActivationStep(): boolean {
    return this.hasActivationPermission === true;
  }

  get currentStepType(): "install" | "create" | "scan" | "activate" | "done" {
    const stepIndex = this.stepper?.selectedIndex || 0;

    switch (stepIndex) {
      case 0:
        return "install";
      case 1:
        return "create";
      case 2:
        return "scan";
      case 3:
        return this.hasActivationPermission ? "activate" : "done";
      case 4:
        return "done";
      default:
        return "install";
    }
  }

  ngOnInit() {
    super.ngOnInit();
    // Check if user has activation permission for this token type
    const activationPermission =
      this.tokenDisplayData.type === TokenType.PUSH
        ? Permission.ACTIVATEPUSH
        : Permission.ACTIVATEQR;

    this.permissionsService
      .hasPermission(activationPermission)
      .then((hasPermission) => {
        this.hasActivationPermission = hasPermission;
      });
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    if (this.activationSubscription) {
      this.activationSubscription.unsubscribe();
    }
  }

  /**
   * Enroll the Push or QR token and proceed to the next step
   */
  enrollPushQRToken() {
    if (this.createTokenForm.invalid) {
      this.announceFormErrors();
      return;
    }
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get("description").value,
    };
    const enrollment$ = this.enrollToken(body, this.stepper).pipe(
      tap((token) => {
        this.enrolledToken = {
          url: token.lse_qr_url.value,
          serial: token.serial,
          type: token.type,
          description: body.description,
        };
      }),
      concatMap((token) => this.enrollmentService.pairingPoll(token.serial))
    );

    this.subscriptions.push(
      enrollment$.subscribe(() => {
        this.stepper.steps.get(this.stepper.selectedIndex).completed = true;
        this.stepper.next();

        // If user has activation permission, move to activation step and start activation
        if (this.hasActivationPermission) {
          this.activateToken();
        }
      })
    );
  }

  /**
   * Start the activation process for the enrolled token
   */
  public activateToken(): void {
    this.activationState = ActivationFlowState.PREPARING;

    // Cancel any existing activation subscription to avoid conflicts
    if (this.activationSubscription) {
      this.activationSubscription.unsubscribe();
    }

    this.activationSubscription = this.enrollmentService
      .activate(this.enrolledToken.serial)
      .pipe(
        tap((details: ActivationDetail) => {
          this.transactionId = details.transactionid.toString().slice(0, 6);
          if (this.isQR()) {
            this.tokenQRUrl = details.message;
          }
          this.activationState = ActivationFlowState.WAITING_FOR_USER;
        }),
        switchMap((details: ActivationDetail) =>
          this.enrollmentService.challengePoll(details.transactionid)
        ),
        map(
          (res: {
            accept?: boolean;
            reject?: boolean;
            valid_tan?: boolean;
          }) => {
            return (
              res?.accept === true ||
              res?.reject === true ||
              res?.valid_tan === true
            );
          }
        ),
        catchError((error) => {
          this.activationState = ActivationFlowState.FAILED;
          return of(false);
        })
      )
      .subscribe((success) => {
        if (success) {
          this.activationState = ActivationFlowState.COMPLETED;
          this.stepper.steps.get(this.stepper.selectedIndex).completed = true;
          this.stepper.next();
          this.notificationService.message(
            $localize`Token activated successfully.`
          );
          this.tokenService.updateTokenList();
        } else {
          this.activationState = ActivationFlowState.FAILED;
        }
      });
  }

  /**
   * Retry activation process
   */
  public retryActivation(): void {
    this.activationState = ActivationFlowState.NOT_STARTED;
    this.activateToken();
  }

  /**
   * Check if the token type is Push
   */
  public isPush(): boolean {
    return this.tokenDisplayData.type === TokenType.PUSH;
  }

  /**
   * Check if the token type is QR
   */
  public isQR(): boolean {
    return this.tokenDisplayData.type === TokenType.QR;
  }

  /**
   * Override the cancel method to handle activation cancellation
   */
  public cancel() {
    // Cancel any ongoing activation process
    if (this.activationSubscription) {
      this.activationSubscription.unsubscribe();
      this.activationSubscription = null;
    }

    // Call the parent cancel method which handles token deletion confirmation
    super.cancel();
  }
  public finalizeEnrollment() {
    const testConfig: MatDialogConfig = {
      width: "850px",
      data: {
        token: {
          serial: this.enrolledToken.serial,
          description: this.enrolledToken.description,
          tokenType: this.enrolledToken.type,
          typeDetails: this.tokenDisplayData,
        } as SelfserviceToken,
      },
    };
    this.dialogRef
      .afterClosed()
      .pipe(
        switchMap(() =>
          this.dialog.open(ActivateDialogComponent, testConfig).afterClosed()
        )
      )
      .subscribe();
    this.close();
  }
}
