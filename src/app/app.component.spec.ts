import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { AuthService } from './auth/auth.service';
import { of } from 'rxjs';
import { NotificationService } from './common/notification.service';

class AuthServiceMock {
  logout = jasmine.createSpy('logout').and.returnValue(of(null));
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(of(true));
  loginChangeEmitter = {
    subscribe: jasmine.createSpy('subscribe')
  };
}

class MockNotificationService {
  message = jasmine.createSpy('message');
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        {
          provide: AuthService,
          useClass: AuthServiceMock
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'LinOTP Selfservice'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('LinOTP Selfservice');
  }));

  it('should render title in a mat-toolbar tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mat-toolbar').textContent).toContain('LinOTP Selfservice');
  }));
});
