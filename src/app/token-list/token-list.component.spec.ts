import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { TokenListComponent } from './token-list.component';
import { TokenService } from '../token.service';

const tokens: Array<{ type: String; id: String }> = [];

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
      }]
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
    let tokenService: TokenService = fixture.debugElement.injector.get(TokenService);
    expect(tokenService.getTokens).toHaveBeenCalled();
  });
});

class TokenServiceMock {
  getTokens = jasmine.createSpy("getTokens").and.returnValue(Observable.of(tokens));
}