import { Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TokenType, tokenTypes } from '../token';
import { MatDialog, MatSelectChange } from '@angular/material';
import { EnrollHotpDialogComponent } from '../enroll/enroll-hotp-dialog/enroll-hotp-dialog.component';
import { NotificationService } from '../core/notification.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-enrollment-grid',
  templateUrl: './enrollment-grid.component.html',
  styleUrls: [ './enrollment-grid.component.scss' ]
})
export class EnrollmentGridComponent implements OnInit {

  public tokenTypes: TokenType[] = tokenTypes;
  @Output() public tokenUpdate: Subject<null> = new Subject();

  private dialogConfig;

  constructor(
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private router: Router,
  ) {
  }

  public ngOnInit() {

    this.dialogConfig = {
      width: '850px',
      autoFocus: false,
      disableClose: true
    };
  }

  public startEnrollment(tokentype: TokenType) {
    if (tokentype.type === 'hmac') {
      this.openHotpDialog();
    } else {
      this.router.navigate([ '/enroll', tokentype.type ]);
    }
  }

  /**
   * Open an hotp dialog view and show and success message if token was created
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

}
