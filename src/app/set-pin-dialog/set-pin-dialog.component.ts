import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgForm, FormGroup, FormBuilder } from '@angular/forms';
import { Token } from '../token';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-set-pin-dialog',
  templateUrl: './set-pin-dialog.component.html',
  styleUrls: ['./set-pin-dialog.component.scss']
})
export class SetPinDialogComponent {

  public data = {
    newPin: '',
    confirmPin: '',
  };

  constructor(
    private dialogRef: MatDialogRef<SetPinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private token: Token,
    private tokenService: TokenService,
  ) { }

  submit(form: NgForm) {
    if (form.valid) {
      this.tokenService.setPin(this.token, this.data.newPin).subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
    }
  }

}
