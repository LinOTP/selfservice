import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';

import { NotificationService } from './notification.service';

import { DialogComponent } from './dialog/dialog.component';
import { SetPinDialogComponent } from './set-pin-dialog/set-pin-dialog.component';
import { SetMOTPPinDialogComponent } from './set-motp-pin-dialog/set-motp-pin-dialog.component';
import { ResyncDialogComponent } from './resync-dialog/resync-dialog.component';
import { SetDescriptionDialogComponent } from './set-description-dialog/set-description-dialog.component';
import { GetSerialDialogComponent } from './get-serial-dialog/get-serial-dialog.component';

import { UnreadyTokensPipe } from './pipes/unready-tokens.pipe';
import { ActiveTokensPipe } from './pipes/active-tokens.pipe';
import { InactiveTokensPipe } from './pipes/inactive-tokens.pipe';
import { ArrayNotEmptyPipe } from './pipes/array-not-empty.pipe';
import { SortTokensByStatePipe } from './pipes/sort-tokens-by-state.pipe';
import { CapitalizePipe } from './pipes/capitalize.pipe';

import { QRCodeComponent } from './qr-code/qr-code.component';
import { QRCodeModule } from 'angularx-qrcode';

import { FocusOnInitDirective } from './focus-on-init/focus-on-init.directive';
import { ButtonWaitIndicatorComponent } from '../button-wait-indicator/button-wait-indicator.component';


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
  ]
})
export class NgSelfServiceCommonModule { }
