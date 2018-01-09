import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { TokenListComponent } from './token-list.component';
import { TokenService } from '../token.service';
import { RouterTestingModule } from '@angular/router/testing';

const tokens: Array<{ type: String; id: String }> = [];

class TokenServiceMock {
  getTokens = jasmine.createSpy('getTokens').and.returnValue(Observable.of(tokens));
}

describe('TokenListComponent', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenListComponent],
      // providers: [{ provide: TokenService, useValue: TokenServiceMock }]
      providers: [{
        provide: TokenService,
        useClass: TokenServiceMock
      }],
      imports: [
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
    const tokenService: TokenService = fixture.debugElement.injector.get(TokenService);
    expect(tokenService.getTokens).toHaveBeenCalled();
  });
});
