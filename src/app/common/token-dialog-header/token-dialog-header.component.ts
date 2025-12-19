import { Component, Input, ViewEncapsulation } from "@angular/core";
import { SelfserviceToken } from "@app/api/token";

@Component({
    selector: "app-token-dialog-header",
    templateUrl: "./token-dialog-header.component.html",
    styleUrls: ["./token-dialog-header.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class TokenDialogHeaderComponent {
    @Input() public token: SelfserviceToken | null = null;
}