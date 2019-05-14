import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';

import { TokenActivateComponent } from './token-activate.component';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '../common/notification.service';

class MockNotificationService {
  message = jasmine.createSpy('message');
}

describe('TokenActivateComponent', () => {
  let component: TokenActivateComponent;
  let fixture: ComponentFixture<TokenActivateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
        NoopAnimationsModule,
      ],
      declarations: [
        TokenActivateComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: { subscribe: jasmine.createSpy('subscribe') }
          }
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenActivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
