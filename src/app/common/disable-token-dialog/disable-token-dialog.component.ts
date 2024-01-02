import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-disable-token-dialog',
  templateUrl: './disable-token-dialog.component.html',
  styleUrls: ['./disable-token-dialog.component.scss']
})
export class DisableTokenDialogComponent {
  confirmCtrl = new FormControl(false, [Validators.requiredTrue]);

  canEnable = false

  get confirmationRequired() {
    return this._confirmationRequired
  }
  set confirmationRequired(value: boolean) {
    this._confirmationRequired = value
    if (value) {
      this.confirmCtrl.setValue(false);
    } else {
      this.confirmCtrl.setValue(true);
    }
  }
  private _confirmationRequired: boolean = true

  constructor(
    public dialogRef: MatDialogRef<DisableTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { canEnable: boolean, confirmationRequired: boolean }) {
    this.confirmationRequired = data.confirmationRequired
    this.canEnable = data.canEnable
  }
}
