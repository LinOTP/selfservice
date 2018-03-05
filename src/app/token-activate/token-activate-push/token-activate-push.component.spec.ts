import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenActivatePushComponent } from './token-activate-push.component';

describe('TokenActivatePushComponent', () => {
  let component: TokenActivatePushComponent;
  let fixture: ComponentFixture<TokenActivatePushComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenActivatePushComponent]
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
