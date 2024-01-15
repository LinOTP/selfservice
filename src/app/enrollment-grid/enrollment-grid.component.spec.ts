import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';

import { spyOnClass } from '@testing/spyOnClass';

import { TokenService } from '@api/token.service';
import { MaterialModule } from '@app/material.module';
import { CapitalizePipe } from '@common/pipes/capitalize.pipe';

import { SelfserviceToken } from '@app/api/token';
import { TokenLimitResponse } from '@app/system.service';
import { TokenLimitsService } from '@app/token-limits.service';
import { TokenType } from '@linotp/data-models';
import { EnrollmentGridComponent } from './enrollment-grid.component';


describe('EnrollmentGridComponent', () => {
  let component: EnrollmentGridComponent;
  let fixture: ComponentFixture<EnrollmentGridComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
        NgxPermissionsAllowStubDirective,
      ],
      declarations: [
        EnrollmentGridComponent,
        CapitalizePipe,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService),
        },
        {
          provide: TokenLimitsService,
          useClass: TokenLimitsService,
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should show max token limit section when limits are exceeded", () => {
    component.tokenLimitsService.setTokenLimits({
      tokenLimits: getTokenLimitsMock(),
      tokens: getTokensMock()
    });
    component.tokenTypes = [
      {
        name: TokenType.HOTP,
        description: TokenType.HOTP,
        type: TokenType.HOTP
      } as any
    ];
    fixture.detectChanges();
    expect(component.tokenLimitsService.canEnrollToken(TokenType.HOTP)).toBeFalse();
    expect(fixture.nativeElement.querySelector('#maxTokenLimitExceeded')).toBeTruthy();
  });

  it("should not show max token limit section when limits are not exceeded", () => {
    const tokenLimits = getTokenLimitsMock();
    tokenLimits.token_types[0].max_token = 2;
    component.tokenLimitsService.setTokenLimits({
      tokenLimits: tokenLimits,
      tokens: getTokensMock()
    });
    component;
    component.tokenTypes = [
      {
        name: TokenType.HOTP,
        description: TokenType.HOTP,
        type: TokenType.HOTP
      } as any
    ];
    fixture.detectChanges();
    expect(component.tokenLimitsService.canEnrollToken(TokenType.HOTP)).toBeTrue();
    expect(fixture.nativeElement.querySelector('#maxTokenLimitExceeded')).toBeFalsy();
  });
});



function getTokenLimitsMock() {
  const result: TokenLimitResponse = {
    all_token: 4,
    token_types: [{
      token_type: TokenType.HOTP,
      max_token: 1
    }]
  };
  return result;
}

function getTokensMock() {
  const tokens: SelfserviceToken[] = [
    {
      typeDetails: {
        type: TokenType.HOTP
      },
    },
  ] as any;

  return tokens;
}
