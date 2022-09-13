import { Component, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { Subject } from 'rxjs';

import { NotificationService } from '../common/notification.service';
import { TokenDisplayData } from '../api/token';
import { TokenType } from '@linotp/data-models';

import { TokenService } from '../api/token.service';

import { AssignTokenDialogComponent } from '../enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollOATHDialogComponent } from '../enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollEmailDialogComponent } from '../enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollSMSDialogComponent } from '../enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollMOTPDialogComponent } from '../enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollPushQRDialogComponent } from '../enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { EnrollYubicoDialogComponent } from '../enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollPasswordDialogComponent } from '../enroll/enroll-password-dialog/enroll-password-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent {

  public tokenTypes: TokenDisplayData[] = this.tokenService.getEnrollableTypes();
  @Output() public tokenUpdate: Subject<null> = new Subject();


  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) { }


  /**
  * opens the correct enrollment dialog for the given token type
  *
  * @public
  * @param {TokenDisplayData} typeDetails
  * @returns {Observable<string>}
  * @memberof EnrollmentGridComponent
  */
  public runEnrollmentWorkflow(typeDetails: TokenDisplayData) {



    const enrollmentConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenType: typeDetails.type,
      },
    };

    let enrollmentDialog;

    switch (typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentDialog = EnrollOATHDialogComponent;
        break;
      case TokenType.PASSWORD:
        enrollmentDialog = EnrollPasswordDialogComponent;
        break;
      case TokenType.EMAIL:
        enrollmentDialog = EnrollEmailDialogComponent;
        break;
      case TokenType.SMS:
        enrollmentDialog = EnrollSMSDialogComponent;
        break;
      case TokenType.MOTP:
        enrollmentDialog = EnrollMOTPDialogComponent;
        break;
      case TokenType.PUSH:
      case TokenType.QR:
        enrollmentDialog = EnrollPushQRDialogComponent;
        break;
      case TokenType.YUBICO:
        enrollmentDialog = EnrollYubicoDialogComponent;
        break;
      case 'assign':
        enrollmentDialog = AssignTokenDialogComponent;
        break;
      default:
        this.notificationService.message($localize`The selected token type cannot be added at the moment.`);
        return;
    }

    this.dialog
      .open(enrollmentDialog, enrollmentConfig)
      .afterClosed()
      .subscribe(() => this.tokenUpdate.next());
  }
}
