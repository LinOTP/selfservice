import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormGroup, ValidationErrors } from "@angular/forms";
import { ErrorStateRootMatcher } from "@app/common/form-helpers/error-state-root-matcher";
import { MaterialModule } from "@app/material.module";
import { take } from "rxjs/operators";
import { UserSystemInfo } from "@app/system.service";
import { NgSelfServiceCommonModule } from "@common/common.module";

@Component({
	selector: 'app-token-pin-form-layout',
	template: `
	<div [formGroup]="form">
    <p i18n="@@oathStepperOtpPinInfo">The OTP PIN ensures that you can only use the token yourself. During the authentication process, you may need to enter this PIN together with an OTP of the token.</p>
    <app-set-pin-validator [form]="form" [pinControlName]="'pin'"></app-set-pin-validator>
    <div class="single-row-form">
			<mat-form-field>
				<mat-label i18n>OTP PIN</mat-label>
				<input matInput
							type="password"
							formControlName="pin">
        <mat-hint *ngIf="!isPinRequired()" i18n="@@otpPinRecommendedInfo">Though not required, for security reasons
					it is recommended to set a PIN for your token.</mat-hint>
			</mat-form-field>
			<mat-form-field>
				<mat-label i18n>Confirm OTP PIN</mat-label>
				<input matInput
							type="password"
							formControlName="confirmPin"
							[errorStateMatcher]="matcher"
							>
				<mat-error *ngIf="form.hasError('pinsDoNotMatch')"
									i18n="@@pinsDoNotMatchError">Entered PINs do not match</mat-error>
			</mat-form-field>
		</div>
	</div>
    `,
	styles: [`
		mat-form-field {
			width: 100%;
		}
		.single-row-form {
			display: flex;
			justify-content: space-between;
			mat-form-field:first-child {
				margin-right: 15px;
  		}
		p {
			margin-bottom:16px;
		}
}
				`],
	standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, NgSelfServiceCommonModule]
})
export class TokenPinFormLayoutComponent {
	@Input()
	public get form(): FormGroup {
		return this._form;
	}

  public set form(value: FormGroup) {
    this._form = value;
    this._form.get('pin').valueChanges.pipe(take(1)).subscribe(() => {
      this._form.get('confirmPin').markAsTouched();
    })
  }

  private _form: FormGroup;
  public matcher = new ErrorStateRootMatcher();

  isPinRequired() {
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    const minLength = settings.otp_pin_minlength ?? 0;
    const contents = settings.otp_pin_contents ?? '';

    return minLength > 0 || contents.includes("c") || contents.includes("n") || contents.includes("s") || contents.includes("o");
  }
}


export function getOtpPinForm() {
  const form = new FormGroup({
    pin: new FormControl(''),
    confirmPin: new FormControl(''),
  }, samePinsValidator)

  return form
}

export function samePinsValidator(group: UntypedFormGroup): (ValidationErrors | null) {
  const newPin: string = group.get('pin')?.value;
  const confirmPin: string = group.get('confirmPin')?.value;

  return newPin === confirmPin ? null : { pinsDoNotMatch: true };
}
