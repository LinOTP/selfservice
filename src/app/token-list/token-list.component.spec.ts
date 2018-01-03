import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenListComponent } from './token-list.component';
import { TokenService } from '../token.service';

describe('TokenListComponent', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenListComponent]/*,
      providers: [{ provide: TokenService, useValue: tokenServiceStub }]*/
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
});

let tokenServiceStub = {
  getTokens: () => null
};