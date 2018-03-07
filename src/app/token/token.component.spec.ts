import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenComponent } from './token.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { MaterialModule } from '../material.module';
import { TokenService } from '../token.service';
import { RouterTestingModule } from '@angular/router/testing';

class TokenServiceMock { }

describe('TokenComponent', () => {
  let component: TokenComponent;
  let fixture: ComponentFixture<TokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: {
              subscribe: jasmine.createSpy('subscribe')
            }
          }
        },
        {
          provide: TokenService,
          useClass: TokenServiceMock
        },
      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([]),
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
