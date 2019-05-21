import { Component, OnInit, Output } from '@angular/core';
import { TokenTypeDetails, tokenTypeDetails } from '../api/token';
import { MatDialog } from '@angular/material';
import { EnrollHotpDialogComponent } from '../enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { NotificationService } from '../common/notification.service';
import { Subject } from 'rxjs';
import { EnrollPushDialogComponent } from '../enroll/enroll-push-dialog/enroll-push-dialog.component';

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
    private notificationService: NotificationService,
  ) {
  }

  public ngOnInit() {

    this.dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true
    };
  }

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
    this.dialog.open(EnrollHotpDialogComponent, this.dialogConfig)
      .afterClosed()
      .subscribe((showMessage) => {
        if (showMessage.result) {
          this.notificationService.message('Hotp token successfully created');
        }
        this.tokenUpdate.next();
      });
  }

  public openPushDialog() {
    this.dialog.open(EnrollPushDialogComponent, this.dialogConfig)
      .afterClosed()
      .subscribe(() => {
        this.tokenUpdate.next();
      });
  }

}
