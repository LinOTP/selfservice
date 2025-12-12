import { Component, Input, OnInit } from "@angular/core";
import { TokenType } from "@api/token";
import { EnrolledToken } from "@app/enroll/enroll-dialog-base.directive";
import { Permission } from "@common/permissions";
import { NgxPermissionsService } from "ngx-permissions";

// Sadly we can not use a generic done step for all kinds of processes
enum CompletionState {
  ENROLLMENT_SUCCESS = "ENROLLMENT_SUCCESS",
  ACTIVATION_SUCCESS = "ACTIVATION_SUCCESS",
  ASSIGN_SUCCESS = "ASSIGN_SUCCESS",
  PUSH_QR_NO_ACTIVATE_PERMISSION = "PUSH_QR_NO_ACTIVATE_PERMISSION",
}

@Component({
    selector: "app-done-step",
    templateUrl: "./done-step.component.html",
    styleUrls: ["done-step.component.scss"],
    standalone: false
})
export class DoneStepComponent implements OnInit {
  @Input({ required: true }) token: EnrolledToken;
  @Input() isAssignProcess: boolean = false;
  @Input() isQRPushActivationProcess: boolean = false;

  completionState: CompletionState;

  constructor(private permissionService: NgxPermissionsService) {}

  ngOnInit(): void {
    // Though the input being required it doesn't fully prevent the token being undefined
    if (!this.token) return;
    this.completionState = this.setCompletionState();
  }

  private setCompletionState(): CompletionState {
    const isQR = this.token.type === TokenType.QR;
    const isPush = this.token.type === TokenType.PUSH;
    const hasActivateQRPerm: string | undefined =
      this.permissionService.getPermission(Permission.ACTIVATEQR)?.name;
    const hasActivatePushPerm: string | undefined =
      this.permissionService.getPermission(Permission.ACTIVATEPUSH)?.name;

    switch (true) {
      case this.isAssignProcess:
        return CompletionState.ASSIGN_SUCCESS;

      case this.isQRPushActivationProcess:
        return CompletionState.ACTIVATION_SUCCESS;

      case (isQR && !hasActivateQRPerm) || (isPush && !hasActivatePushPerm):
        return CompletionState.PUSH_QR_NO_ACTIVATE_PERMISSION;

      default:
        return CompletionState.ENROLLMENT_SUCCESS;
    }
  }

  protected readonly TokenType = TokenType;
  protected readonly CompletionState = CompletionState;
}
