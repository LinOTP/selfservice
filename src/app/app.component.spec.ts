import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AuthGuard } from './auth-guard.service';
import { ActivatedRoute } from '@angular/router/src/router_state';
import { Observable } from 'rxjs/Observable';

class AuthServiceMock {
  logout = jasmine.createSpy('logout').and.returnValue(Observable.of(null));
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(Observable.of(true));
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      declarations: [
        AppComponent
      ],
      providers:
        [
          {
            provide: Router,
            useValue: {
              navigate: jasmine.createSpy('navigate')
            }
          },
          {
            provide: AuthService,
            useClass: AuthServiceMock
          },
        ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('KI Selfservice');
  }));

  it('should render title in a mat-toolbar tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mat-toolbar').textContent).toContain('KI Selfservice');
  }));
});
