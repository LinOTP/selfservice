import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from '../../../testing/mock-component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../token.service';

import { EnrollPushComponent } from './enroll-push.component';

describe('EnrollPushComponent', () => {
  let component: EnrollPushComponent;
  let fixture: ComponentFixture<EnrollPushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnrollPushComponent,
        MockComponent({ selector: 'ngx-qrcode', inputs: ['qrc-value', 'qrc-element-type'] }),
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
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
    fixture = TestBed.createComponent(EnrollPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
