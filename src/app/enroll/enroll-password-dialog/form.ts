import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { getPinForm } from "../token-pin-form-layout/token-pin-form-layout.component";


export function getCreatePasswordTokenForm() {
  const form = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmation: new FormControl('', [Validators.required]),
    pinForm: getPinForm(),
    description: new FormControl($localize`Created via SelfService`, Validators.required),
  }, sameValuesConfirmationValidator)

  return form
}


export function sameValuesConfirmationValidator(ctrl: AbstractControl): (ValidationErrors | null) {
  const password: string = ctrl.get('password')?.value;
  const confirmation: string = ctrl.get('confirmation')?.value;

  return password === confirmation ? null : { passwordsDoNotMatch: true };
}
