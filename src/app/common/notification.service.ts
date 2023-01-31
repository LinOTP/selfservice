import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum Duration {
  SHORT = 2000,
  NORMAL = 5000,
  LONG = 30000,
}

@Injectable()
export class NotificationService {

  constructor(
    public snackbar: MatSnackBar,
  ) { }

  message(message, duration: Duration = Duration.NORMAL) {
    this.snackbar.open(message, $localize`dismiss`, {
      duration: duration
    });
  }

  get duration() {
    return Duration;
  }
}
