import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenActivatePushComponent } from './token-activate-push.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TokenService } from '../../token.service';
import { NotificationService } from '../../core/notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Token } from '../../token';

class MockTokenService {
  activate = jasmine.createSpy('activate');
  challengePoll = jasmine.createSpy('challengePoll');
}
class MockNotificationService {
  message = jasmine.createSpy('message');
}

describe('TokenActivatePushComponent', () => {
  let component: TokenActivatePushComponent;
  let fixture: ComponentFixture<TokenActivatePushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [
        TokenActivatePushComponent,
      ],
      providers: [
        {
          provide: TokenService,
          useClass: MockTokenService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: Token,
          useValue: new Token(0, '', 'push', '')
        }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenActivatePushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
