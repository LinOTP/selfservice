import { Component, Input } from "@angular/core";
import { TokenType } from "@api/token";
import { EnrolledToken } from "@app/enroll/enroll-dialog-base.directive";
import { Permission } from "@common/permissions";
import { NgxPermissionsService } from "ngx-permissions";

@Component({
	selector: 'app-done-step',
  templateUrl: './done-step.component.html',
  styleUrls: ['done-step.component.scss']
})
export class DoneStepComponent {
	@Input() token: EnrolledToken

  constructor(private permissionService: NgxPermissionsService) {
  }

  isQRAndNoActivatePerm() {
    return this.token?.type === TokenType.QR && !this.permissionService.getPermission(Permission.ACTIVATEQR)
  }

  isPushAndNoActivatePerm() {
    return this.token?.type === TokenType.PUSH && !this.permissionService.getPermission(Permission.ACTIVATEPUSH)
  }

  protected readonly TokenType = TokenType;
}
