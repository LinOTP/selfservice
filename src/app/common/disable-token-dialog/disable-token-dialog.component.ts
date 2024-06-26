import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { OperationsService } from "@app/api/operations.service";
import { SelfserviceToken } from "@app/api/token";

@Component({
  selector: 'app-disable-token-dialog',
  templateUrl: './disable-token-dialog.component.html',
  styleUrls: ['./disable-token-dialog.component.scss']
})
export class DisableTokenDialogComponent {
  confirmCtrl = new FormControl(false, [Validators.requiredTrue]);
  awaitingResponse = false
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
    @Inject(MAT_DIALOG_DATA) public data: { canEnable: boolean, confirmationRequired: boolean, token: SelfserviceToken },
    private operationsService: OperationsService,
  ) {
    this.confirmationRequired = data.confirmationRequired
    this.canEnable = data.canEnable
  }

  disableToken() {
    if (this.confirmCtrl.valid) {
      this.awaitingResponse = true;
      this.operationsService.disable(this.data.token).subscribe(result => {
        this.awaitingResponse = false;
        if (result) {
          this.dialogRef.close(true);
        }
      });
    }
  }
}
