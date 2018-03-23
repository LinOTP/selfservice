import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from '../../../testing/mock-component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../token.service';

import { EnrollHotpComponent } from './enroll-hotp.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('The EnrollHotpComponent', () => {
  let component: EnrollHotpComponent;
  let fixture: ComponentFixture<EnrollHotpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollHotpComponent,
        MockComponent({ selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type'] }),
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: {
            enroll: jasmine.createSpy('enroll')
          },
        }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollHotpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

describe('The HOTP enrollment form', () => {
  let component: EnrollHotpComponent;
  let fixture: ComponentFixture<EnrollHotpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollHotpComponent,
        MockComponent({ selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type'] }),
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: {
            enroll: jasmine.createSpy('enroll')
          },
        }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollHotpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should enable going to step 2 after setting a description', () => {
    const description = 'testDescription';
    const element = fixture.debugElement.nativeElement;
    const step1NextButton: HTMLButtonElement = element.querySelector('#goTo2');
    component.enrollData.description = description;
    fixture.detectChanges();
    expect(step1NextButton.disabled).toBeFalsy();
    expect(component.descriptionStep.valid).toBe(true);
  });

  it('should disable going to step 2 if no description was set', () => {
    const description = '';
    const element = fixture.debugElement.nativeElement;
    const step1NextButton: HTMLButtonElement = element.querySelector('#goTo2');
    component.enrollData.description = description;
    fixture.detectChanges();
    expect(step1NextButton.disabled).toBeTruthy();
    expect(component.descriptionStep.valid).toBe(false);
  });

  it('should enable going to step 3 if the checkbox confirming the app is installed is checked', () => {
    const element = fixture.debugElement.nativeElement;
    const checkbox: HTMLInputElement = element.querySelector('#appInstalledCheckbox');
    checkbox.checked = true;
    fixture.detectChanges();
    expect(component.appInstallStep.valid).toBe(true);
  });

  it('should disable going to step 3 if the checkbox confirming the app is installed is unchecked', () => {
    const element = fixture.debugElement.nativeElement;
    const checkbox: HTMLInputElement = element.querySelector('#appInstalledCheckbox');
    checkbox.checked = false;
    fixture.detectChanges();
    expect(component.appInstallStep.valid).toBe(false);
  });
  });
});
