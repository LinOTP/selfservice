import { Component, Input, TemplateRef } from "@angular/core";

@Component({
    selector: "app-lockable-action-dialog-content",
    templateUrl: "./lockable-action-dialog-content.component.html",
})
export class LockableActionDialogContentComponent {
    @Input() standardMessageTmp: TemplateRef<any>;
    @Input() actionConfirmationTmp: TemplateRef<any>;
    @Input() lockedMessageTmp: TemplateRef<any>;
    @Input() state: { isLocked: boolean, confirmationRequired: boolean } = { isLocked: false, confirmationRequired: false }
}