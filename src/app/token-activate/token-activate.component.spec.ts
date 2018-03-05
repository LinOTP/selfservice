import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs/observable/of';

import { TokenActivateComponent } from './token-activate.component';

describe('TokenActivateComponent', () => {
  let component: TokenActivateComponent;
  let fixture: ComponentFixture<TokenActivateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
