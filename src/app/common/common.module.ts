import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '@app/material.module';

import { NotificationService } from './notification.service';

import { DialogComponent } from './dialog/dialog.component';
import { GetSerialDialogComponent } from './get-serial-dialog/get-serial-dialog.component';
import { ResyncDialogComponent } from './resync-dialog/resync-dialog.component';
import { SetDescriptionDialogComponent } from './set-description-dialog/set-description-dialog.component';
import { SetMOTPPinDialogComponent } from './set-motp-pin-dialog/set-motp-pin-dialog.component';
import { SetPinDialogComponent } from './set-pin-dialog/set-pin-dialog.component';

import { ActiveTokensPipe } from './pipes/active-tokens.pipe';
import { ArrayNotEmptyPipe } from './pipes/array-not-empty.pipe';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { InactiveTokensPipe } from './pipes/inactive-tokens.pipe';
import { SortTokensByStatePipe } from './pipes/sort-tokens-by-state.pipe';
import { UnreadyTokensPipe } from './pipes/unready-tokens.pipe';

import { QRCodeModule } from 'angularx-qrcode';
import { QRCodeComponent } from './qr-code/qr-code.component';

import { ButtonWaitIndicatorComponent } from '@app/button-wait-indicator/button-wait-indicator.component';
import { DeleteTokenDialogComponent } from './delete-token-dialog/delete-token-dialog.component';
import { DisableTokenDialogComponent } from './disable-token-dialog/disable-token-dialog.component';
import { FocusOnInitDirective } from './focus-on-init/focus-on-init.directive';
import { LockableActionDialogContentComponent } from './lockable-action-dialog-content/lockable-action-dialog.content.component';
import { UnassignTokenDialogComponent } from './unassign-token-dialog/unassign-token-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
  ],
  declarations: [
    QRCodeComponent,
    DialogComponent,
    SetPinDialogComponent,
    SetMOTPPinDialogComponent,
    ResyncDialogComponent,
    SetDescriptionDialogComponent,
    GetSerialDialogComponent,
    UnreadyTokensPipe,
    ActiveTokensPipe,
    InactiveTokensPipe,
    ArrayNotEmptyPipe,
    SortTokensByStatePipe,
    CapitalizePipe,
    FocusOnInitDirective,
    ButtonWaitIndicatorComponent,
    DeleteTokenDialogComponent,
    UnassignTokenDialogComponent,
    DisableTokenDialogComponent,
    LockableActionDialogContentComponent
  ],
  providers: [
    NotificationService,
  ],
  exports: [
    QRCodeComponent,
    UnreadyTokensPipe,
    ActiveTokensPipe,
    InactiveTokensPipe,
    ArrayNotEmptyPipe,
    SortTokensByStatePipe,
    CapitalizePipe,
    FocusOnInitDirective,
    ButtonWaitIndicatorComponent,
    DeleteTokenDialogComponent
  ]
})
export class NgSelfServiceCommonModule { }
