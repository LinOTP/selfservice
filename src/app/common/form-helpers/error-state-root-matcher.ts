import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

/**
 * Error state matcher that allows a form control to display an error in
 * <mat-error> even if the error comes from the form root.
 */
export class ErrorStateRootMatcher implements ErrorStateMatcher {

    /**
     * Return true if there is an error anywhere in the form.
     *
     * @param control the control where to display eventual error state warnings
     * @param form form reference not used in this method, but required by the interface.
     */
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control && control.touched && (control.invalid || control.root.invalid);
    }
}