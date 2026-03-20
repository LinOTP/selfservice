import { Component, Input, ViewEncapsulation } from "@angular/core";
import { SelfserviceToken } from "@app/api/token";
import { TokenInfo } from "@app/enroll/enroll-oath-dialog/oath-enrollment/token-info.component";

@Component({
    selector: "app-token-dialog-header",
    templateUrl: "./token-dialog-header.component.html",
    styleUrls: ["./token-dialog-header.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class TokenDialogHeaderComponent {
    tokenInfo:TokenInfo

    @Input()
    public get token(): SelfserviceToken | null {
      return this._token;
    }
    public set token(value: SelfserviceToken | null) {
      this._token = value;
      if (value) {
        this.tokenInfo = {
          serial: value.serial,
          type: value.typeDetails.type,
          description: value.description,
          rpName: value.rpName,
          rpId: value.rpId
        };
      }
    }
    private _token: SelfserviceToken | null = null;
}
