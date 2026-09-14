import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogComponent } from './dialog/dialog.component';

export interface ConfirmDialogData {
  title: string;
  text: string;
  confirmationLabel: string;
}

/**
 * Open the generic confirmation dialog and resolve to whether the user confirmed.
 */
export function confirmDialog(dialog: MatDialog, data: ConfirmDialogData, configOverrides: Partial<MatDialogConfig> = {}): Observable<boolean> {
  const config: MatDialogConfig = {
    width: '35em',
    autoFocus: true,
    disableClose: true,
    ...configOverrides,
    data,
  };

  return dialog.open(DialogComponent, config).afterClosed();
}

/**
 * Ask for confirmation before cancelling an activation that is in progress.
 * The token stays enrolled but unpaired, so activation can be resumed later
 * from the token list.
 */
export function confirmCancelActivation(dialog: MatDialog): Observable<boolean> {
  return confirmDialog(dialog, {
    title: $localize`Cancel activation?`,
    text: $localize`Do you really want to cancel the activation? You can resume it later from the token list.`,
    confirmationLabel: $localize`Confirm`,
  });
}
