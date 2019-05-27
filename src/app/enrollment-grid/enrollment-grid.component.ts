import { Component, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subject, of } from 'rxjs';
import { switchMap, catchError, filter, tap } from 'rxjs/operators';

import { TokenTypeDetails, tokenTypeDetails, Token } from '../api/token';
import { TokenService } from '../api/token.service';

import { NotificationService } from '../common/notification.service';

import { EnrollHotpDialogComponent } from '../enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';
import { TestOTPDialogComponent } from '../test/test-otp/test-otp-dialog.component';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: ['./enrollment-grid.component.scss']
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenTypeDetails[] = tokenTypeDetails;
  @Output() public tokenUpdate: Subject<null> = new Subject();

  private dialogConfig;

  constructor(
    public dialog: MatDialog,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) {
  }

  public ngOnInit() { }

  public startEnrollment(tokentype: TokenTypeDetails) {
    if (tokentype.type === 'hmac') {
      this.openHotpDialog();
    }
    if (tokentype.type === 'push') {
      this.openPushDialog();
    }
  }

  /**
   * Open hotp dialog and show an success message if token was created
   */
  public openHotpDialog() {

    this.dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true,
      data: { closeLabel: 'Test token' },
    };
    this.dialog.open(EnrollHotpDialogComponent, this.dialogConfig)
      .afterClosed()
      .pipe(
        filter(serial => !!serial),
        switchMap(serial => this.tokenService.getToken(serial)),
        tap(token => {
          if (!token) {
            this.notificationService.message('There was a problem starting the token test, please try manually later.');
          }
        }),
        filter(token => !!token),
        switchMap(token => {
          const config = {
            width: '650px',
            data: token
          };
          return this.dialog.open(TestOTPDialogComponent, config).afterClosed();
        })
      ).subscribe(() => this.tokenUpdate.next());
  }

  public openPushDialog() {
    this.dialog.open(EnrollPushDialogComponent, this.dialogConfig)
      .afterClosed()
      .subscribe(() => {
        this.tokenUpdate.next();
      });
  }

}
