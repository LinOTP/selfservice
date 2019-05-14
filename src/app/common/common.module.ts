import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomFormsModule } from 'ng2-validation';

import { MaterialModule } from '../material.module';

import { NotificationService } from './notification.service';

import { DialogComponent } from './dialog/dialog.component';

import { UnreadyTokensPipe } from './pipes/unready-tokens.pipe';
import { ActiveTokensPipe } from './pipes/active-tokens.pipe';
import { InactiveTokensPipe } from './pipes/inactive-tokens.pipe';
import { ArrayNotEmptyPipe } from './pipes/array-not-empty.pipe';
import { SortTokensByStatePipe } from './pipes/sort-tokens-by-state.pipe';
import { SetPinDialogComponent } from './set-pin-dialog/set-pin-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    CustomFormsModule,
  ],
  declarations: [
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
    UnreadyTokensPipe,
    ActiveTokensPipe,
    InactiveTokensPipe,
    ArrayNotEmptyPipe,
    SortTokensByStatePipe,
  ]
})
export class NgSelfServiceCommonModule { }
