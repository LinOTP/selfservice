import { Component, Input } from "@angular/core";
import { FormControl, FormGroup, UntypedFormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ErrorStateRootMatcher } from "@app/common/form-helpers/error-state-root-matcher";

@Component({
	selector: 'app-create-token-step',
	template: `
     <p i18n="@@oathStepperCreateTokenInfo">Please set up a token according to your administrator's instructions.</p>
     <form [formGroup]="form" *ngIf="form">
        <mat-card appearance="outlined">
					<mat-card-header>
							<mat-card-subtitle i18n>OTP PIN</mat-card-subtitle>
					</mat-card-header>
					<mat-card-content>
						<p i18n="@@oathStepperOtpPinInfo">During the authentication process you may need to provide this PIN together with the token OTP.</p>
						<mat-form-field>
							<mat-label i18n>OTP PIN</mat-label>
							<input matInput
										type="password"
										formControlName="pin"
										[appFocusOnStepperChange]="1">
						</mat-form-field>
						<mat-form-field>
							<mat-label i18n>Confirm OTP PIN</mat-label>
							<input matInput
										type="password"
										formControlName="confirmPin"
										[errorStateMatcher]="matcher"
										>
							<mat-error *ngIf="form.hasError('pinsDoNotMatch')"
												i18n>Entered PINs do not match</mat-error>
						</mat-form-field>
					</mat-card-content>
				</mat-card>
				<mat-card appearance="outlined" class="desc-card">
					<mat-card-header>
						<mat-card-subtitle i18n>Token description</mat-card-subtitle>
					</mat-card-header>
					<mat-card-content>
						<p i18n="@@oathStepperTokenDescriptionInfo">You may set a token description which should help you identify your token:</p>
						<mat-form-field>
							<mat-label i18n>Token description</mat-label>
							<input matInput formControlName="description">
							<mat-error i18n *ngIf="form.get('description').hasError('required')">This field is required.</mat-error>
						</mat-form-field>
					</mat-card-content>
				</mat-card>
      </form>
			<p class="ready-info" i18n="@@oathStepperConfirmCreateInfo">When you are ready, create the token to proceed to next step.</p>
    `,
	styles: [`
		mat-form-field {
				width: 100%;
		}
		.desc-card {
				margin-top: 16px;
		}
		.ready-info {
			margin: 20px 0 0 0;
		}
    `]
})
export class CreateTokenStepComponent {
	@Input() form: FormGroup;
	public matcher = new ErrorStateRootMatcher();
}


export function getCreateTokenStepForm() {
	const form = new FormGroup({
		pin: new FormControl(''),
		confirmPin: new FormControl(''),
		description: new FormControl($localize`Created via SelfService`, Validators.required),
	}, samePinsValidator)
	return form;
}

export function samePinsValidator(group: UntypedFormGroup): (ValidationErrors | null) {
	const newPin: string = group.get('pin')?.value;
	const confirmPin: string = group.get('confirmPin')?.value;

	return newPin === confirmPin ? null : { pinsDoNotMatch: true };
}