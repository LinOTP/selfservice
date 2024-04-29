import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { Fixtures } from '@testing/fixtures';
import { MockComponent } from '@testing/mock-component';
import { MockPipe } from '@testing/mock-pipe';
import { TestingPage } from '@testing/page-helper';
import { getInjectedStub, spyOnClass } from '@testing/spyOnClass';

import { EnrollmentStatus, SelfserviceToken, TokenType } from '@api/token';
import { TokenService } from '@api/token.service';
import { LoginService } from '@app/login/login.service';
import { MaterialModule } from '@app/material.module';
import { Permission } from '@common/permissions';
import { ActiveTokensPipe } from '@common/pipes/active-tokens.pipe';
import { ArrayNotEmptyPipe } from '@common/pipes/array-not-empty.pipe';
import { CapitalizePipe } from '@common/pipes/capitalize.pipe';
import { InactiveTokensPipe } from '@common/pipes/inactive-tokens.pipe';
import { UnreadyTokensPipe } from '@common/pipes/unready-tokens.pipe';


import { SelfServiceContextService } from '@app/selfservice-context.service';
import { TokenLimitResponse } from '@app/system.service';
import { TokenLimitsService } from '@app/token-limits.service';
import { TokenListComponent } from './token-list.component';
import { TokenVerifyCheckService } from './token-verify-check.service';

class Page extends TestingPage<TokenListComponent> {

  public getLoadingTokensElement(elementTag: string) {
    return this.query('#loadingTokensSection ' + elementTag);
  }

  public getEnrollAlternativeTokenSectionElement(elementTag: string) {
    return this.query('#enrollAlternativeTokenSection ' + elementTag);
  }

  public getEnrollFirstTokenSectionElement(elementTag: string) {
    return this.query('#enrollFirstTokenSection ' + elementTag);
  }

  public getActiveAuthSectionElement(elementTag: string) {
    return this.query('#activeAuthSection ' + elementTag);
  }

  public getPendingSectionElement(elementTag: string) {
    return this.query('#pendingSection ' + elementTag);
  }

  public getEmptyStateSectionElement(elementTag: string) {
    return this.query('#emptyStateSection ' + elementTag);
  }

  public getmaxTokenLimitReachedElement() {
    return this.query('#maxTokenLimitReached');
  }
}

describe('TokenListComponent', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let permissionLoadSubject: Subject<boolean>;
  let tokenListUpdateSubject: Subject<null>;
  let page: Page;
  let selfServiceContextService: jasmine.SpyObj<SelfServiceContextService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        TokenListComponent,
        MockPipe({ 'name': 'sortTokensByState' }),
        MockComponent({ 'selector': 'app-token-card', inputs: ['token'], outputs: ['tokenUpdate'] }),
        MockComponent({ 'selector': 'app-enrollment-grid' }),
        ArrayNotEmptyPipe,
        ActiveTokensPipe,
        InactiveTokensPipe,
        UnreadyTokensPipe,
        CapitalizePipe,
      ],
      providers: [
        {
          provide: TokenService,
          useValue: spyOnClass(TokenService)
        },
        {
          provide: LoginService,
          useValue: spyOnClass(LoginService)
        },
        {
          provide: TokenLimitsService,
          useClass: TokenLimitsService
        },
        {
          provide: SelfServiceContextService,
          useValue: spyOnClass(SelfServiceContextService)
        },

      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([]),
        NgxPermissionsAllowStubDirective,
      ]
    }).overrideComponent(TokenListComponent, {
      set: {
        providers: [
          {
            provide: TokenVerifyCheckService,
            useValue: spyOnClass(TokenVerifyCheckService)
          }
        ]
      }
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    tokenService = getInjectedStub(TokenService);
    tokenListUpdateSubject = new Subject();
    tokenService.tokenUpdateEmitted$ = tokenListUpdateSubject.asObservable();

    loginService = getInjectedStub(LoginService);
    permissionLoadSubject = new BehaviorSubject(true);
    (loginService as any).permissionLoad$ = permissionLoadSubject.asObservable();

    selfServiceContextService = getInjectedStub(SelfServiceContextService);
    selfServiceContextService.tokenLimits$ = of(getTokenLimitsMock());
  });

  it('should create', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render expected title and text for first token enrollment section', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of([]));
    fixture.detectChanges();

    expect(page.getEnrollFirstTokenSectionElement('h2').textContent).toEqual('Set up your first authentication method');
    expect(page.getEnrollFirstTokenSectionElement('p').textContent).toEqual(' You currently do not have any authentication' +
      ' method set up. Start by selecting your preferred type: ');

    expect(page.getActiveAuthSectionElement('h2')).toBeNull();
    expect(page.getActiveAuthSectionElement('p')).toBeNull();
    expect(page.getEnrollAlternativeTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollAlternativeTokenSectionElement('p')).toBeNull();
    expect(page.getPendingSectionElement('h2')).toBeNull();
    expect(page.getPendingSectionElement('p')).toBeNull();
  });

  it('should render expected title and text for active authentication and alternative auth. method section', () => {
    const hotpToken = Fixtures.activeHotpToken;
    hotpToken.enrollmentStatus = EnrollmentStatus.COMPLETED;

    tokenService.getSelfserviceTokens.and.returnValue(of([hotpToken]));
    fixture.detectChanges();

    expect(page.getActiveAuthSectionElement('h2').textContent).toEqual('Active authentication methods');
    expect(page.getActiveAuthSectionElement('p').textContent).toEqual('The following tokens are available for use:');

    expect(page.getEnrollAlternativeTokenSectionElement('h2').textContent).toEqual('Set up a new authentication method');
    expect(page.getEnrollAlternativeTokenSectionElement('p').textContent).toEqual('The following authentication methods' +
      ' are available:');

    expect(page.getEnrollFirstTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollFirstTokenSectionElement('p')).toBeNull();
    expect(page.getPendingSectionElement('h2')).toBeNull();
    expect(page.getPendingSectionElement('p')).toBeNull();
  });

  it('should render expected title and text for the pending and alternative auth. method section', () => {
    const hotpToken = Fixtures.activeHotpToken;
    hotpToken.enrollmentStatus = EnrollmentStatus.UNPAIRED;

    tokenService.getSelfserviceTokens.and.returnValue(of([hotpToken]));
    fixture.detectChanges();

    expect(page.getPendingSectionElement('h2').textContent).toEqual('Pending actions');
    expect(page.getPendingSectionElement('p').textContent).toEqual('The following tokens are not active' +
      ' and require further action:');

    expect(page.getEnrollAlternativeTokenSectionElement('h2').textContent).toEqual('Set up a new authentication method');
    expect(page.getEnrollAlternativeTokenSectionElement('p').textContent).toEqual('The following authentication methods' +
      ' are available:');

    expect(page.getActiveAuthSectionElement('h2')).toBeNull();
    expect(page.getActiveAuthSectionElement('p')).toBeNull();
    expect(page.getEnrollFirstTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollFirstTokenSectionElement('p')).toBeNull();
  });

  it('should load tokens from the server on init', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of([]));
    fixture.detectChanges();
    expect(tokenService.getSelfserviceTokens).toHaveBeenCalled();
  });

  it('should load enrollment permissions', () => {
    expect(component.enrollmentPermissions).toEqual([
      Permission.ENROLLPASSWORD,
      Permission.ENROLLHOTP,
      Permission.ENROLLTOTP,
      Permission.ENROLLPUSH,
      Permission.ENROLLQR,
      Permission.ENROLLMOTP,
      Permission.ENROLLSMS,
      Permission.ENROLLEMAIL,
      Permission.ENROLLYUBICO,
      Permission.ASSIGN,
    ]);
  });

  it('should load enrollment status', () => {
    expect(component.EnrollmentStatus).toBe(EnrollmentStatus);
  });

  it('should render no title nor text, save for the loading spinning indicator before the tokens loaded', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of(undefined));
    fixture.detectChanges();

    expect(page.getLoadingTokensElement('mat-spinner')).toBeTruthy();
    expect(page.getLoadingTokensElement('p').textContent).toEqual('Loading tokens…');

    expect(page.getEnrollFirstTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollFirstTokenSectionElement('p')).toBeNull();
    expect(page.getActiveAuthSectionElement('h2')).toBeNull();
    expect(page.getActiveAuthSectionElement('p')).toBeNull();
    expect(page.getEnrollAlternativeTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollAlternativeTokenSectionElement('p')).toBeNull();
    expect(page.getPendingSectionElement('h2')).toBeNull();
    expect(page.getPendingSectionElement('p')).toBeNull();
    expect(page.getEmptyStateSectionElement('h2')).toBeNull();
    expect(page.getEmptyStateSectionElement('p')).toBeNull();

  });

  it('should show token limit info when limit reached', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of(getTokenLimitReachedMock()));
    fixture.detectChanges();
    expect(component.tokenLimitsService.isMaxTokenLimitSet).toBe(true);
    expect(component.tokenLimitsService.maxTokenLimitReached).toBe(true);

    expect(page.getmaxTokenLimitReachedElement()).toBeTruthy();
  });

  it('should now show token limit info when limit not reached', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of(getTokenLimitReachedMock().slice(0, 3)));
    fixture.detectChanges();
    expect(component.tokenLimitsService.isMaxTokenLimitSet).toBe(true);
    expect(component.tokenLimitsService.maxTokenLimitReached).toBe(false);

    expect(page.getmaxTokenLimitReachedElement()).toBeFalsy();
  });

  it('should show warning when user is locked', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of(getTokenLimitReachedMock()));
    component.isUserLocked = true;
    fixture.detectChanges();
    const message = fixture.nativeElement.querySelector('.warning-info');
    expect(message).toBeTruthy();
  })

  it('should not show warning when user is not locked', () => {
    tokenService.getSelfserviceTokens.and.returnValue(of(getTokenLimitReachedMock()));
    component.isUserLocked = false;
    fixture.detectChanges();
    const message = fixture.nativeElement.querySelector('.warning-info');
    expect(message).toBeFalsy();
  })
});

function getTokenLimitsMock() {
  const result: TokenLimitResponse = {
    all_token: 4,
    token_types: []
  };
  return result;
}

function getTokenLimitReachedMock() {
  const tokens: SelfserviceToken[] = [
    {
      typeDetails: {
        type: TokenType.HOTP
      },
    },
    {
      typeDetails: {
        type: TokenType.TOTP
      },
    },
    {
      typeDetails: {
        type: TokenType.PUSH
      },
    },
    {
      typeDetails: {
        type: TokenType.PUSH
      },
    },
  ] as any;

  return tokens;
}
