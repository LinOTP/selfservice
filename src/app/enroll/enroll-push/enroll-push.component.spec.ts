import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from '../../../testing/mock-component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../material.module';
import { TokenService } from '../../token.service';

import { EnrollPushComponent } from './enroll-push.component';
import { NotificationService } from '../../core/notification.service';

class MockNotificationService {
  message = jasmine.createSpy('message');
}

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
        MaterialModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: {
            enroll: jasmine.createSpy('enroll')
          },

        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
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
