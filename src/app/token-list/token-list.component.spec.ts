import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockPipe } from '../../testing/mock-pipe';

import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { of } from 'rxjs/observable/of';

import { TokenListComponent } from './token-list.component';
import { MaterialModule } from '../material.module';
import { TokenService } from '../token.service';
import { NotificationService } from '../core/notification.service';

const tokens: Array<{ type: String; id: String }> = [];

class MockNotificationService {
  message = jasmine.createSpy('message');
}

describe('TokenListComponent', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TokenListComponent,
        MockPipe({ 'name': 'nonActiveTokens' }),
        MockPipe({ 'name': 'activeTokens' }),
        MockPipe({ 'name': 'arrayNotEmpty' }),
        MockPipe({ 'name': 'sortTokensByState' }),
      ],
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
          useValue: {
            deletetoken: jasmine.createSpy('deletetoken')
          }
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([])
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get tokens from the server on init', () => {
    const route: ActivatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
    expect(route.data.subscribe).toHaveBeenCalled();
  });
});
