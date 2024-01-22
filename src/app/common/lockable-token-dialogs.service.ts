import { Inject, Injectable, Injector } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { SelfserviceToken } from "@app/api/token";
import { SelfServiceContextService } from "@app/selfservice-context.service";
import { TokenListComponent } from "@app/token-list/token-list.component";
import { of } from "rxjs";
import { AuthLockedEvaluatorContextInfo, AuthLockedStatusEvaluator } from "./auth-locked-status-evaluator";
import { DeleteTokenDialogComponent } from "./delete-token-dialog/delete-token-dialog.component";
import { DisableTokenDialogComponent } from "./disable-token-dialog/disable-token-dialog.component";
import { UnassignTokenDialogComponent } from "./unassign-token-dialog/unassign-token-dialog.component";

@Injectable()
export class LockableTokenActionsService {

  constructor(private dialog: MatDialog,
    private selfServiceContextService: SelfServiceContextService,
    private tokenList: TokenListComponent,
    @Inject(Injector) private injector: Injector,
  ) { }

  getDeleteConfirmation(token: SelfserviceToken) {
    const config: MatDialogConfig = {
      width: '35em',
      injector: this.injector,
      data: { token, lockingEvaluator: this.getLockingEvaluator() }
    };

    return this.dialog
      .open(DeleteTokenDialogComponent, config)
      .afterClosed()
  }


  getUnassignConfirmation(token: SelfserviceToken) {
    const config: MatDialogConfig = {
      width: '35em',
      injector: this.injector,
      data: { token, lockingEvaluator: this.getLockingEvaluator() }
    };

    return this.dialog
      .open(UnassignTokenDialogComponent, config)
      .afterClosed()
  }

  getDisableConfirmation(token: SelfserviceToken, canEnable: boolean) {
    const authLockEvaluator = this.getLockingEvaluator()
    const willLock = authLockEvaluator.checkDisableWillLockAuth(token);

    // if enable rights and no delete confirmation required => show no dialog
    if (canEnable && !willLock) {
      return of(true);
    }

    const config: MatDialogConfig = {
      width: '35em',
      injector: this.injector,
      data: {
        canEnable: canEnable,
        confirmationRequired: willLock
      }
    };

    return this.dialog.open(DisableTokenDialogComponent, config).afterClosed();
  }

  private getLockingEvaluator() {
    const context = new AuthLockedEvaluatorContextInfo(this.selfServiceContextService.context)
    return new AuthLockedStatusEvaluator(this.tokenList.tokens, context)
  }
}
