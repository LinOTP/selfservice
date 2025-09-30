import { ChangeDetectionStrategy, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

import { concatMap, switchMap, tap } from 'rxjs/operators';

import { EnrollmentOptions, SelfserviceToken, TokenType } from "@api/token";
import { ActivateDialogComponent } from '@app/activate/activate-dialog.component';
import { EnrollDialogBase } from '@app/enroll/enroll-dialog-base.directive';
import { PlatformProviderService } from "@common/platform-provider.service";


interface PushQrEnrolledToken {
  serial: string;
  type: TokenType;
  description?: string;
  url: string;
}
@Component({
  selector: 'app-enroll-push',
  templateUrl: './enroll-push-qr-dialog.component.html',
  styleUrls: ['./enroll-push-qr-dialog.component.scss'],
  providers: [PlatformProviderService],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class EnrollPushQRDialogComponent extends EnrollDialogBase implements OnInit {
  public enrolledToken: PushQrEnrolledToken;
  @ViewChild(MatStepper, { static: true }) public stepper: MatStepper;
  protected platformProvider = inject(PlatformProviderService);

  /**
   * Enroll the Push or QR token and proceed to the next step
   */
  enrollPushQRToken() {
    const body: EnrollmentOptions = {
      type: this.tokenDisplayData.type,
      description: this.createTokenForm.get('description').value,
    };
    const enrollment$ = this.enrollToken(body, this.stepper).pipe(
      tap(token => {
        this.enrolledToken = {
          url: token.lse_qr_url.value,
          serial: token.serial,
          type: token.type,
          description: body.description,
        };
      }),
      concatMap(token => this.enrollmentService.pairingPoll(token.serial))
    );
    this.subscriptions.push(
      enrollment$.subscribe(() => {
        this.stepper.steps.get(this.stepper.selectedIndex).completed = true;
        this.stepper.next();
      })
    );
  }

  //To be deleted when working on LINSELF-220
  public finalizeEnrollment() {
    const testConfig: MatDialogConfig = {
      width: '850px',
      data: {
        token: {
          serial: this.enrolledToken.serial,
          description: this.enrolledToken.description,
          tokenType: this.enrolledToken.type,
          typeDetails: this.tokenDisplayData
        } as SelfserviceToken
      }
    };
    this.dialogRef.afterClosed().pipe(
      switchMap(() => this.dialog.open(ActivateDialogComponent, testConfig).afterClosed())
    ).subscribe();
    this.close();
  }
}
