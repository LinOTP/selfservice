import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';

import { NotificationService } from './notification.service';

import { DialogComponent } from './dialog/dialog.component';

import { UnreadyTokensPipe } from './pipes/unready-tokens.pipe';
import { ActiveTokensPipe } from './pipes/active-tokens.pipe';
import { InactiveTokensPipe } from './pipes/inactive-tokens.pipe';
import { ArrayNotEmptyPipe } from './pipes/array-not-empty.pipe';
import { SortTokensByStatePipe } from './pipes/sort-tokens-by-state.pipe';
import { SetPinDialogComponent } from './set-pin-dialog/set-pin-dialog.component';
import { QRCodeComponent } from './qr-code/qr-code.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxQRCodeModule,
  ],
  declarations: [
    QRCodeComponent,
    DialogComponent,
    SetPinDialogComponent,
    UnreadyTokensPipe,
    ActiveTokensPipe,
    InactiveTokensPipe,
    ArrayNotEmptyPipe,
    SortTokensByStatePipe,
  ],
  entryComponents: [
    DialogComponent,
    SetPinDialogComponent,
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
  ]
})
export class NgSelfServiceCommonModule { }
