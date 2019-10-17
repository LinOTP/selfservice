import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { spyOnClass } from '../../testing/spyOnClass';

import { SessionService } from './session.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie';
import { NgxPermissionsService } from 'ngx-permissions';
import { SystemService } from '../system.service';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        SessionService,
        {
          provide: NgxPermissionsService,
          useValue: spyOnClass(NgxPermissionsService),
        },
        {
          provide: CookieService,
          useValue: spyOnClass(CookieService),
        },
        {
          provide: SystemService,
          useValue: spyOnClass(SystemService),
        },
      ],
    });
  });

  beforeEach(() => {
    sessionService = TestBed.get(SessionService);
  });

  it('should be created', () => {
    expect(sessionService).toBeTruthy();
  });
});
