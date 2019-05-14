import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CustomFormsModule } from 'ng2-validation';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../api/token.service';
import { Token } from '../../api/token';

import { SetPinDialogComponent } from './set-pin-dialog.component';

describe('SetPinDialogComponent', () => {
  let component: SetPinDialogComponent;
  let fixture: ComponentFixture<SetPinDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        FormsModule,
        CustomFormsModule,
      ],
      declarations: [SetPinDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: new Token(1, '', '', true)
        },
        {
          provide: TokenService,
          useValue: { setPin: jasmine.createSpy('setPin') }
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
