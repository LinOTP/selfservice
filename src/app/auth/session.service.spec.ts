import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CookieService } from 'ngx-cookie';
import { NgxPermissionsService } from 'ngx-permissions';

import { spyOnClass } from '../../testing/spyOnClass';

import { SystemService } from '../system.service';
import { SessionService } from './session.service';

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
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(sessionService).toBeTruthy();
  });
});
