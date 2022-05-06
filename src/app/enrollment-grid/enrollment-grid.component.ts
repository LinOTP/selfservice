import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { Subject, Subscription } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';

import { Permission } from '../common/permissions';
import { NotificationService } from '../common/notification.service';
import { TokenType, TokenTypeDetails } from '../api/token';
import { TokenService } from '../api/token.service';
import { LoginService } from '../login/login.service';

import { AssignTokenDialogComponent } from '../enroll/assign-token-dialog/assign-token-dialog.component';
import { EnrollOATHDialogComponent } from '../enroll/enroll-oath-dialog/enroll-oath-dialog.component';
import { EnrollEmailDialogComponent } from '../enroll/enroll-email-dialog/enroll-email-dialog.component';
import { EnrollSMSDialogComponent } from '../enroll/enroll-sms-dialog/enroll-sms-dialog.component';
import { EnrollMOTPDialogComponent } from '../enroll/enroll-motp-dialog/enroll-motp-dialog.component';
import { EnrollPushQRDialogComponent } from '../enroll/enroll-push-qr-dialog/enroll-push-qr-dialog.component';
import { ActivateDialogComponent } from '../activate/activate-dialog.component';
import { TestDialogComponent } from '../test/test-dialog.component';
import { EnrollYubicoDialogComponent } from '../enroll/enroll-yubico/enroll-yubico-dialog.component';
import { EnrollPasswordDialogComponent } from '../enroll/enroll-password-dialog/enroll-password-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit, OnDestroy {

  public tokenTypes: TokenTypeDetails[] = this.tokenService.getEnrollableTypes();
  @Output() public tokenUpdate: Subject<null> = new Subject();
  public testAfterEnrollment: boolean;

  private subscriptions: Subscription[] = [];

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private loginService: LoginService,
  ) { }

  public ngOnInit() {
    this.subscriptions.push(
      this.loginService
        .hasPermission$(Permission.VERIFY)
        .subscribe(hasPermission => this.testAfterEnrollment = hasPermission)
    );
  }

  public ngOnDestroy() {
    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }
  }

  /**
  * opens the correct enrollment dialog for the given token type
  *
  * @public
  * @param {TokenTypeDetails} typeDetails
  * @returns {Observable<string>}
  * @memberof EnrollmentGridComponent
  */
  public runEnrollmentWorkflow(typeDetails: TokenTypeDetails) {

    const enrollmentConfig: MatDialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: {
        tokenTypeDetails: typeDetails,
        closeLabel: this.testAfterEnrollment ? $localize`Test` : $localize`Close`,
      },
    };

    let enrollmentDialog;
    let testDialog: any = TestDialogComponent;

    switch (typeDetails.type) {
      case TokenType.HOTP:
      case TokenType.TOTP:
        enrollmentDialog = EnrollOATHDialogComponent;
        break;
      case TokenType.PASSWORD:
        enrollmentDialog = EnrollPasswordDialogComponent;
        enrollmentConfig.data.closeLabel = $localize`Close`;
        testDialog = null;
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
        delete enrollmentConfig.data.closeLabel;
        testDialog = ActivateDialogComponent;
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
      .pipe(
        tap(() => this.tokenUpdate.next()),
        filter(() => this.testAfterEnrollment),
        filter(serial => !!serial),
        switchMap(serial => this.tokenService.getToken(serial)),
        tap(token => {
          if (!token) {
            this.notificationService.message($localize`There was a problem starting the token test, please try again later.`);
          }
        }),
        filter(token => !!token && testDialog),
        switchMap(token => {
          const testConfig: MatDialogConfig = {
            width: '650px',
            data: { token: token }
          };
          return this.dialog.open(testDialog, testConfig).afterClosed();
        }),
      ).subscribe(() => this.tokenUpdate.next());
  }
}
