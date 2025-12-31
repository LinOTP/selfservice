import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormGroup, ValidationErrors } from "@angular/forms";
import { ErrorStateRootMatcher } from "@app/common/form-helpers/error-state-root-matcher";
import { MaterialModule } from "@app/material.module";
import { UserSystemInfo } from "@app/system.service";
import { NgSelfServiceCommonModule } from "@common/common.module";
import { take } from "rxjs/operators";

@Component({
  selector: 'app-token-pin-form-layout',
  template: `
	<div [formGroup]="form">
    <p i18n="@@oathStepperOtpPinInfo">The OTP PIN ensures that you can only use the token yourself. During the authentication process, you may need to enter this PIN together with an OTP of the token.</p>
    <app-set-pin-validator [form]="form" [pinControlName]="'pin'"></app-set-pin-validator>
    <div class="row">
      <div class="col-12 col-md-6 mb-sm-3 mb-md-0">
        <mat-form-field subscriptSizing="dynamic">
          <mat-label i18n>OTP PIN</mat-label>
          <input matInput
                type="password"
                formControlName="pin">
          <mat-hint *ngIf="!isPinRequired()" i18n="@@otpPinRecommendedInfo">Though not required, for security reasons
            it is recommended to set a PIN for your token.</mat-hint>
        </mat-form-field>
      </div>
      <div class="col-12 col-md-6">
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
		p {
			margin-bottom:16px;
		}`],
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

/**
 * To be used if setOTPPin policy is enabled.
 * Returns a form containing PIN and confirm PIN fields
 * with a custom validator ensuring they match.
 */
export function getPinForm(): FormGroup {
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
