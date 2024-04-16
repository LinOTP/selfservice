import { Component, Input } from "@angular/core";
import { EnrolledToken } from "@app/enroll/enroll-dialog-base.component";

@Component({
	selector: 'app-done-step',
	template: `
    <div class="header">
      <mat-icon color="primary">check_circle</mat-icon>
			<div class="header-text">
				<p>
					<span *ngxPermissionsOnly="'VERIFY';else stdMsgTmp" i18n="@@oathStepperDoneVerifySuccess">You have successfully enrolled and verified your token.</span>
					<ng-template #stdMsgTmp>
						<span i18n="@@oathStepperDoneNonVerifySuccess">You have successfully enrolled token.</span>
					</ng-template>
					<br><span i18n="@@oathStepperDoneReadyToUse">You can now use it for authentication.</span></p>
			</div>
    </div>
    <div class="wrapper">
      <app-token-info [token]="token"></app-token-info>
    </div>
    `,
	styles: [`
    .header {
			display: flex;
			justify-content: center;
			align-items: center;
			padding:30px 0;
			flex-direction: column;

			.header-text {
				text-align:center;
				font-size:16px;
				margin-top:13px;
			}
			h3 {
				margin-bottom: 0;
				font-weight: 500;
			}
			mat-icon {
				font-size: 70px;
				width:70px;
				height: 70px;
				margin-right: 7px;
			}
    }

    .mat-mdc-dialog-title {
      margin-bottom: 0px;
    }
    .wrapper {
      padding: 0 24px;
    }
  `]
})
export class DoneStepComponent {
	@Input() token: EnrolledToken
}