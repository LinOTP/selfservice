import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SetPinValidatorComponent } from './set-pin-validator.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserSystemInfo } from '@app/system.service';

describe('SetPinValidatorComponent', () => {
  let component: SetPinValidatorComponent;
  let fixture: ComponentFixture<SetPinValidatorComponent>;
  let formBuilder: FormBuilder;
  let mockSettings: Partial<UserSystemInfo['settings']>;

  beforeEach(async () => {
    mockSettings = {
      otp_pin_minlength: 4,
      otp_pin_maxlength: 8,
      otp_pin_contents: 'cns', // requiring letter, number, and special character
    };

    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockSettings));

    await TestBed.configureTestingModule({
      declarations: [SetPinValidatorComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SetPinValidatorComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    component.form = formBuilder.group({
      pin: [''],
    });
    component.pinControlName = 'pin';
    fixture.detectChanges()
  });

  it('should initialize minLength, maxLength, and otpPinContents from localStorage settings', fakeAsync(() => {
    tick(222)
    expect(component.minLength).toBe(4);
    expect(component.maxLength).toBe(8);
    expect(component.otpPinContents).toBe('cns');
  }));

  it('should set validators on the pin control correctly', fakeAsync(() => {
    component.ngOnInit()
    tick();
    component.pinControl.setValue('123');
    expect(component.pinControl.hasError('minlength')).toBeTrue();
    component.pinControl.setValue('toolonginput');
    expect(component.pinControl.hasError('maxlength')).toBeTrue();
    component.pinControl.setValue('Abc1!');
    expect(component.pinControl.valid).toBeTrue();
  }));

  describe('Pin Validator Logic', () => {
    it('should return true if pin contains exclusively allowed characters from any of the given groups (+ prefix)', () => {
      component.otpPinContents = '+cs';
      component.pinControl.setValue('a$');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeTrue();
      component.pinControl.setValue('aa');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeTrue();
      component.pinControl.setValue('..');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeTrue();
      component.otpPinContents = '+no';
      component.pinControl.setValue('1 ');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeTrue();
      component.pinControl.setValue('  ');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeTrue();
    });

    it('should return false if pin contains invalid characters from groups (+ prefix)', () => {
      component.otpPinContents = '+cs';  // Expecting nothing else but letter (c) or / and special (s)
      component.pinControl.setValue('abc123');
      //false, because 123 is given though not specified in otpPinContents
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeFalse();
      component.pinControl.setValue('a.ä'); //ä counts as other special character (rule 'o')
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeFalse();
      component.pinControl.setValue('   '); //' ' counts as other special character (rule 'o')
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeFalse();
      component.otpPinContents = '+no';
      component.pinControl.setValue('A ');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeFalse();
      component.pinControl.setValue('A1 ');
      expect(component.pinHasAnyCharacterFromAnySpecifiedGroup()).toBeFalse();
    });

    it('should return true if pin has a letter, digit, and special character (- prefix)', () => {
      component.otpPinContents = '-cns';  // Expecting nothing else but a letter (c) AND number (n) AND special (s)
      component.pinControl.setValue('A1!');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeTrue();
      component.pinControl.setValue('A1!A1!');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeTrue();
      component.pinControl.setValue('A1.');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeTrue();
      component.otpPinContents = '-cnso';
      component.pinControl.setValue('A1.Æ');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeTrue();
    });

    it('should return false if pin does not meet every group requirement (- prefix)', () => {
      component.otpPinContents = '-cns';
      component.pinControl.setValue('A1234');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeFalse();
      component.pinControl.setValue('A1. ');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeFalse();
      component.pinControl.setValue('..');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeFalse();
      component.otpPinContents = '-cnso';
      component.pinControl.setValue('A1.');
      expect(component.pinHasAnyCharacterFromEverySpecifiedGroup()).toBeFalse();
    });
  });

  describe('Helper Methods', () => {
    it('should detect if pin has a letter', () => {
      component.pinControl.setValue('A1!');
      expect(component.pinHasLetter()).toBeTrue();

      component.pinControl.setValue('123!');
      expect(component.pinHasLetter()).toBeFalse();
    });

    it('should detect if pin has a digit', () => {
      component.pinControl.setValue('A1!');
      expect(component.pinHasDigit()).toBeTrue();

      component.pinControl.setValue('A!');
      expect(component.pinHasDigit()).toBeFalse();
    });

    it('should detect if pin has a special character', () => {
      component.pinControl.setValue('A1!');
      expect(component.pinHasSpecialCharacter()).toBeTrue();

      component.pinControl.setValue('A1');
      expect(component.pinHasSpecialCharacter()).toBeFalse();
    });

    it('should detect if pin has other special characters', () => {
      component.pinControl.setValue('A1Æ');
      expect(component.pinHasOtherSpecialCharacter()).toBeTrue();

      component.pinControl.setValue('A1!');
      expect(component.pinHasOtherSpecialCharacter()).toBeFalse();
    });
    it('should return correctly formatted text for "+" rule', () => {
      component.otpPinContents = '+cns';
      expect(component.getTextForPrefixRule('+')).toContain('or');
    });

    it('should return correctly formatted text for "-" rule', () => {
      component.otpPinContents = '-cns';
      expect(component.getTextForPrefixRule('-')).toContain('and');
    });
  });


});
