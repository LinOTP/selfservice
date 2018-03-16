import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatToolbarModule,
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatSnackBarModule,
  MatListModule,
  MatSidenavModule,
  MatDialogModule,
  MatSelectModule,
  MatExpansionModule,
  MatStepperModule,
  MatCheckboxModule,
} from '@angular/material';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatListModule,
    MatSidenavModule,
    MatDialogModule,
    MatSelectModule,
    MatExpansionModule,
    MatStepperModule,
    MatCheckboxModule,
  ],
  exports: [
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatListModule,
    MatSidenavModule,
    MatDialogModule,
    MatSelectModule,
    MatExpansionModule,
    MatStepperModule,
    MatCheckboxModule,
  ],
})
export class MaterialModule { }
