import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenComponent } from './token.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TokenService } from '../token.service';

class TokenServiceMock {
  getToken = jasmine.createSpy('getToken').and.returnValue(Observable.of({ id: 'test' }));
}

describe('TokenComponent', () => {
  let component: TokenComponent;
  let fixture: ComponentFixture<TokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenComponent],
      providers: [
        {
          provide: ActivatedRoute, useValue: {
            params: Observable.of({ id: 'test' })
          }
        },
        {
          provide: TokenService,
          useClass: TokenServiceMock
        }
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
