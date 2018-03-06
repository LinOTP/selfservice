import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MaterialModule } from '../material.module';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router/src/router_state';
import { of } from 'rxjs/observable/of';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
      ],
      declarations: [
        LoginComponent,
      ],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: jasmine.createSpy('isLoggedIn'),
            login: jasmine.createSpy('login'),
            logout: jasmine.createSpy('logout'),
          }
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
