import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material.module';

import { NotificationService } from './notification.service';
import { DialogComponent } from './dialog/dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [
    DialogComponent
  ],
  entryComponents: [
    DialogComponent,
  ],
  providers: [
    NotificationService,
  ]
})
export class NgSelfServiceCommonModule { }
