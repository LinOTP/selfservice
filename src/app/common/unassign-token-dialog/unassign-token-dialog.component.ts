import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { OperationsService } from "@app/api/operations.service";
import { SelfserviceToken } from "@app/api/token";
import { AuthLockedStatusEvaluator } from "../auth-locked-status-evaluator";

@Component({
  selector: 'app-unassign-token-dialog',
  templateUrl: './unassign-token-dialog.component.html',
  styleUrls: ['./unassign-token-dialog.component.scss']
})
export class UnassignTokenDialogComponent {
  isLocked = false
  confirmCtrl = new FormControl(false, [Validators.requiredTrue]);
  awaitingResponse = false

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

  get token() {
    return this.data.token
  }

  constructor(
    public dialogRef: MatDialogRef<UnassignTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: SelfserviceToken, lockingEvaluator: AuthLockedStatusEvaluator },
    private operationsService: OperationsService,
  ) {
    this.isLocked = data.lockingEvaluator.isUsersAuthLocked()
    this.confirmationRequired = data.lockingEvaluator.checkUnassignWillLockAuth(data.token) || this.isLocked
  }


  public unassignToken() {
    if (this.confirmCtrl.valid) {
      this.awaitingResponse = true;
      this.operationsService.unassignToken(this.token.serial).subscribe(result => {
        this.awaitingResponse = false;
        if (result) {
          this.dialogRef.close(true);
        }
      });
    }
  }
}