import { Component, Input } from "@angular/core";
import { FormControl, FormGroup, UntypedFormGroup, Validators } from "@angular/forms";
import { getPinForm } from "@app/enroll/token-pin-form-layout/token-pin-form-layout.component";
import { ErrorStateRootMatcher } from "@common/form-helpers/error-state-root-matcher";

@Component({
  selector: 'app-create-token-step',
  template: `
    <div *ngIf="form" [formGroup]="form">
      <mat-form-field subscriptSizing="dynamic" appSubscriptAriaLive>
        <mat-label i18n>Token description</mat-label>
        <ng-container *ngIf="setAutoFokus; else regularInput">
          <input appFocusOnInit focusDelay="500" matInput formControlName="description" [attr.aria-invalid]="form.get('description')?.invalid && form.get('description')?.touched"/>
        </ng-container>
        <ng-template #regularInput>
          <input matInput formControlName="description" [attr.aria-invalid]="form.get('description')?.invalid && form.get('description')?.touched"/>
        </ng-template>
        <mat-hint i18n="@@oathStepperTokenDescriptionInfo">Set a customized description to easily differentiate
          between multiple tokens
        </mat-hint>
        <mat-error i18n *ngIf="form.get('description').hasError('required')">Description is required.</mat-error>
      </mat-form-field>
      <app-token-pin-form-layout class="token-pin-form-layout" *ngxPermissionsOnly="'SETPIN'" [form]="form.get('pinForm')"></app-token-pin-form-layout>
    </div>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
    mat-form-field:last-child {
      margin-bottom: 0;
    }

    .token-pin-form-layout {
      display: block;
      margin-top: 22px;
    }
  `],
  standalone: false
})
export class CreateTokenStepComponent {
  @Input() form: FormGroup;
  @Input() setAutoFokus: boolean = false;

  public matcher = new ErrorStateRootMatcher();
}


export function getCreateTokenStepForm(): UntypedFormGroup {
  const form = new FormGroup({
    pinForm: getPinForm(),
    description: new FormControl($localize`Created via self-service`, Validators.required),
  })
  return form;
}
