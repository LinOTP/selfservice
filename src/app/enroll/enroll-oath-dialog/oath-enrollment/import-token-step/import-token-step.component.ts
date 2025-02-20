import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NotificationService } from "@app/common/notification.service";
import { OATHEnrolledToken } from "../../enroll-oath-dialog.component";
import { VerifyTokenComponent } from "@app/enroll/verify-token/verify-token.component";

@Component({
  selector: "app-import-token-step",
  templateUrl: "./import-token-step.component.html",
  styleUrls: ["./import-token-step.component.scss"],
})
export class ImportTokenStepComponent {
  @Input()
  public get verifyFlowEnabled() {
    return this._verifyFlowEnabled;
  }
  public set verifyFlowEnabled(value) {
    this._verifyFlowEnabled = value;
  }
  private _verifyFlowEnabled = false;

  @Input()
  public get enrolledToken(): OATHEnrolledToken {
    return this._enrolledToken;
  }
  public set enrolledToken(value: OATHEnrolledToken) {
    this._enrolledToken = value;
  }
  private _enrolledToken: OATHEnrolledToken;
  public showDetails = false;
  @ViewChild(VerifyTokenComponent) verifyTokenComponent: VerifyTokenComponent;
  @Output() completed = new EventEmitter<void>();

  public get verified() {
    return this._verified;
  }
  public set verified(value) {
    this._verified = value;
    if (value) {
      this.completed.emit();
    }
  }
  private _verified = false;


  constructor(public sanitizer: DomSanitizer, private notificationService: NotificationService) { }

  copyInputMessage(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.notificationService.message($localize`Copied`);
  }

  public verifyToken() {
    this.verifyTokenComponent.verifyToken();
  }
}
