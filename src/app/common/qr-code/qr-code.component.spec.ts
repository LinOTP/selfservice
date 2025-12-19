import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MockComponent } from '@testing/mock-component';

import { MaterialModule } from '@app/material.module';

import { CustomQRCodeComponent } from './qr-code.component';

describe('QRCodeComponent', () => {
  let component: CustomQRCodeComponent;
  let fixture: ComponentFixture<CustomQRCodeComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        MockComponent({ selector: 'qrcode', inputs: ['qrdata', 'width', 'errorCorrectionLevel'] }),
      ],
      declarations: [
        CustomQRCodeComponent,
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomQRCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
