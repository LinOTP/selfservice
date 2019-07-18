import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

enum Duration {
  SHORT = 500,
  NORMAL = 2000,
  LONG = 6000,
}

@Injectable()
export class NotificationService {

  constructor(
    public snackbar: MatSnackBar,
  ) { }

  message(message, duration: Duration = Duration.NORMAL) {
    this.snackbar.open(message, 'hide', {
      duration: duration
    });
  }

  get duration() {
    return Duration;
  }
}
