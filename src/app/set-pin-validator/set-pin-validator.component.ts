import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { UserSystemInfo } from "@app/system.service";

//see predefined characters groups: https://www.linotp.org/doc/latest/part-management/policy/selfservice.html#changing-the-character-group-definition
export const LETTERS = "a-zA-Z";
export const DIGITS = "0-9";
export const SPECIAL_CHARACTERS = ".:,;\\-_<>+*!/()=?$§%&#~^";
export const OTHER_SPECIAL_CHARACTERS = "^a-zA-Z0-9.:,;\\-_<>+*!/()=?$§%&#~^";
export const REGEXP_LETTERS = new RegExp(`[${LETTERS}]`);
export const REGEXP_DIGITS = new RegExp(`[${DIGITS}]`);
export const REGEXP_SPECIAL_CHARACTERS = new RegExp(`[${SPECIAL_CHARACTERS}]`);
export const REGEXP_OTHER_SPECIAL_CHARACTERS = new RegExp(`[${OTHER_SPECIAL_CHARACTERS}]`);
@Component({
  selector: 'app-set-pin-validator',
  templateUrl: './set-pin-validator.component.html',
  styleUrls: ['./set-pin-validator.component.scss']
})
export class SetPinValidatorComponent implements OnInit {
  @Input({ required: true }) form: FormGroup;
  @Input({ required: true }) pinControlName: string;
  minLength: number = 0;
  maxLength: number | undefined = undefined;
  otpPinContents: string = '';

  get pinText(): string {
    return this.pinControl?.value || '';
  }
  get pinControl() {
    return this.form.get(this.pinControlName);
  }

  ngOnInit(): void {
    const settings: UserSystemInfo['settings'] = JSON.parse(localStorage.getItem('settings'));
    this.minLength = settings.otp_pin_minlength ?? 0;
    this.maxLength = settings.otp_pin_maxlength;
    this.otpPinContents = settings.otp_pin_contents ?? '';
    const validators: ValidatorFn[] = [];
    if (this.minLength > 0 || this.anyOTPContentRulesActive()) {
      validators.push(Validators.required, Validators.minLength(this.minLength))
    }
    if (this.maxLength) {
      validators.push(Validators.maxLength(this.maxLength))
    }
    if (this.otpPinContents) {
      validators.push(this.otpPinContentsValidator());
    }
    setTimeout(() => {
      this.pinControl.setValidators(validators);
      this.pinControl.updateValueAndValidity({ emitEvent: false });
    }, 0);
  }

  private otpPinContentsValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      if (!this.pinControl.hasValidator(Validators.required) && !this.pinText) {
        //meaning the minlength of the pin is 0 and otppincontents invalid therefor the validation should not trigger on the empty pin field
        return null
      }
      if (this.otpPinContents.startsWith("+")) {
        return this.pinHasAnyCharacterFromAnySpecifiedGroup() ? null : { notContainingCharactersFromAnyGroup: true }
      }
      if (this.otpPinContents.startsWith("-")) {
        return this.pinHasAnyCharacterFromEverySpecifiedGroup() ? null : { notContainingCharactersFromEveryGroup: true };
      }
      const errors: ValidationErrors = {};
      //No + or - prefix
      if (this.requiresLetter() && !this.pinHasLetter()) {
        errors.missingLetter = true;
      }
      if (this.requiresDigit() && !this.pinHasDigit()) {
        errors.missingDigit = true;
      }
      if (this.requiresSpecial() && !this.pinHasSpecialCharacter()) {
        errors.missingSpecial = true;
      }
      //if rule 'o' is given, check if the pin contains a character that is NOT part of any specified groups
      if (this.requiresOtherSpecial() && !this.pinHasOtherSpecialCharacter()) {
        errors.missingOtherSpecial = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * used to validate the pin against otppincontents starting with a '+' prefix
   */
  pinHasAnyCharacterFromAnySpecifiedGroup(): boolean {
    if (!this.anyOTPContentRulesActive()) return !this.pinHasUnspecifiedCharacters();
    let hasAnyRequiredGroup =
      (this.requiresLetter() && this.pinHasLetter()) ||
      (this.requiresSpecial() && this.pinHasSpecialCharacter()) ||
      (this.requiresOtherSpecial() && this.pinHasOtherSpecialCharacter()) ||
      (this.requiresDigit() && this.pinHasDigit());

    return hasAnyRequiredGroup && !this.pinHasUnspecifiedCharacters();
  }

  /**
   * used to validate the pin against otppincontents starting with a '-' prefix
   */
  pinHasAnyCharacterFromEverySpecifiedGroup(): boolean {
    if (!this.anyOTPContentRulesActive()) return !this.pinHasUnspecifiedCharacters();
    let hasEveryRequiredGroup =
      (!this.requiresLetter() || this.pinHasLetter()) &&
      (!this.requiresSpecial() || this.pinHasSpecialCharacter()) &&
      (!this.requiresOtherSpecial() || this.pinHasOtherSpecialCharacter()) &&
      (!this.requiresDigit() || this.pinHasDigit());

    return hasEveryRequiredGroup && !this.pinHasUnspecifiedCharacters()
  }


  getTextForPrefixRule(prefix: '+' | '-'): string {
    const groups = [];
    if (this.requiresLetter()) groups.push($localize`:@@pinLetter:a letter`);
    if (this.requiresDigit()) groups.push($localize`:@@pinDigit:a digit`);
    if (this.requiresSpecial()) groups.push($localize`:@@pinSpecial:a special character from (.:,;-_<>+*!/()=?$§%&#~^)`);
    if (this.requiresOtherSpecial()) {
      if (this.requiresSpecial()) {
        groups.push($localize`:@@pinOtherSpecial:a special character e.g. " Æäöüß`);
      } else {
        //otherwise the user might be confused about why common special characters are not accepted
        groups.push($localize`:@@pinOtherSpecialWithoutCommonSpecial:a special character not in (${SPECIAL_CHARACTERS}) e.g. " Æäöüß"`);
      }
    }

    return prefix === '+' ? groups.join($localize`:@@or: or `) : groups.join($localize`:@@and: and `);
  }

  /**
   * Note that this matters only if a + or - prefix is given
   */
  pinHasUnspecifiedCharacters() {
    return (!this.requiresLetter() && this.pinHasLetter()) ||
      (!this.requiresSpecial() && this.pinHasSpecialCharacter()) ||
      (!this.requiresDigit() && this.pinHasDigit()) ||
      (!this.requiresOtherSpecial() && this.pinHasOtherSpecialCharacter());
  }


  pinHasOtherSpecialCharacter() {
    return REGEXP_OTHER_SPECIAL_CHARACTERS.test(this.pinText);
  }

  pinHasSpecialCharacter() {
    return REGEXP_SPECIAL_CHARACTERS.test(this.pinText);
  }

  pinHasDigit() {
    return REGEXP_DIGITS.test(this.pinText);
  }

  pinHasLetter() {
    return REGEXP_LETTERS.test(this.pinText);
  }

  setOTPPoliciesActive() {
    return this.minLength > 0 || this.maxLength !== undefined || this.requiresLetter()
      || this.requiresDigit() || this.requiresSpecial() || this.requiresOtherSpecial();
  }

  allOTPContentRulesActive() {
    return this.requiresLetter() && this.requiresDigit() && this.requiresSpecial() && this.requiresOtherSpecial();
  }

  anyOTPContentRulesActive() {
    return this.requiresLetter() || this.requiresDigit() || this.requiresSpecial() || this.requiresOtherSpecial();
  }

  getColorForValidationError(validationError: string): string {
    switch (validationError) {
      case "minlengthOrMaxlength":
        return this.getColor(
          this.pinHasError("minlength") || this.pinHasError("maxlength"),
          this.pinText.length >= this.minLength && this.pinText.length <= this.maxLength
        );
      case "minlength":
        return this.getColor(this.pinHasError(validationError), this.pinText.length >= this.minLength);
      case "missingLetter":
        return this.getColor(this.pinHasError(validationError), this.pinHasLetter());
      case "missingDigit":
        return this.getColor(this.pinHasError(validationError), this.pinHasDigit());
      case "missingSpecial":
        return this.getColor(this.pinHasError(validationError), this.pinHasSpecialCharacter());
      case "missingOtherSpecial":
        return this.getColor(this.pinHasError(validationError), this.pinHasOtherSpecialCharacter());
      case "notContainingCharactersFromAnyGroup":
        return this.getColor(this.pinHasError(validationError), this.pinHasAnyCharacterFromAnySpecifiedGroup());
      case "notContainingCharactersFromEveryGroup": {
        return this.getColor(this.pinHasError(validationError), this.pinHasAnyCharacterFromEverySpecifiedGroup());
      }
      default:
        return 'inherit';
    }
  }

  getColor(errorCondition: boolean, successCondition: boolean): string {
    if (!this.pinControl || (this.pinControl.pristine && this.pinControl.untouched)) return 'inherit'
    return errorCondition ? '#f44336' /*red*/ : successCondition ? '#0ba10b' /*green*/ : 'inherit';
  }


  pinHasError(...errors: string[]): boolean {
    if (errors.some(err => err === "minlength") && this.pinText.length < this.minLength) {
      //Workaround for the minlength validator as by default the minlength is checked as soon as a character is inserted in the field.
      return true
    }
    return errors.some(error => this.pinControl?.hasError(error));
  }

  public requiresLetter(): boolean {
    return this.otpPinContents.includes("c");
  }

  public requiresDigit(): boolean {
    return this.otpPinContents.includes("n");
  }

  public requiresSpecial(): boolean {
    return this.otpPinContents.includes("s");
  }

  public requiresOtherSpecial(): boolean {
    return this.otpPinContents.includes("o");
  }

  protected readonly SPECIAL_CHARACTERS = SPECIAL_CHARACTERS;
}
