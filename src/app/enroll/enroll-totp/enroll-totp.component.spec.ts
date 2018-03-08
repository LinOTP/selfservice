import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollTotpComponent } from './enroll-totp.component';
import { TokenService } from '../../token.service';


class TokenServiceMock {
  enroll = jasmine.createSpy('enroll');
}

describe('EnrollTotpComponent', () => {
  let component: EnrollTotpComponent;
  let fixture: ComponentFixture<EnrollTotpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnrollTotpComponent],
      providers: [
        {
          provide: TokenService,
          useClass: TokenServiceMock
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollTotpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
