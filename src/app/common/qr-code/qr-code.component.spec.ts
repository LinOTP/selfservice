import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QRCodeComponent } from './qr-code.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { MockComponent } from '../../../testing/mock-component';

describe('QRCodeComponent', () => {
  let component: QRCodeComponent;
  let fixture: ComponentFixture<QRCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [
        QRCodeComponent,
        MockComponent({ selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type'] }),
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QRCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
