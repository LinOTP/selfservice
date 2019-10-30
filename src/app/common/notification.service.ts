import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18n } from '@ngx-translate/i18n-polyfill';

enum Duration {
  SHORT = 500,
  NORMAL = 2000,
  LONG = 6000,
}

@Injectable()
export class NotificationService {

  constructor(
    public snackbar: MatSnackBar,
    public i18n: I18n
  ) { }

  message(message, duration: Duration = Duration.NORMAL) {
    this.snackbar.open(message, this.i18n('dismiss'), {
      duration: duration
    });
  }

  get duration() {
    return Duration;
  }
}
