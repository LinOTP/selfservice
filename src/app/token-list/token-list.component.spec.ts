import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxPermissionsAllowStubDirective, NgxPermissionsRestrictStubDirective } from 'ngx-permissions';

import { BehaviorSubject, of, Subject } from 'rxjs';

import { MockPipe } from '../../testing/mock-pipe';
import { MockComponent } from '../../testing/mock-component';
import { spyOnClass, getInjectedStub } from '../../testing/spyOnClass';
import { Fixtures } from '../../testing/fixtures';
import { TestingPage } from '../../testing/page-helper';

import { MaterialModule } from '../material.module';
import { TokenService } from '../api/token.service';
import { EnrollmentStatus } from '../api/token';
import { Permission } from '../common/permissions';
import { ArrayNotEmptyPipe } from '../common/pipes/array-not-empty.pipe';
import { ActiveTokensPipe } from '../common/pipes/active-tokens.pipe';
import { InactiveTokensPipe } from '../common/pipes/inactive-tokens.pipe';
import { UnreadyTokensPipe } from '../common/pipes/unready-tokens.pipe';
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';

import { TokenListComponent } from './token-list.component';
import { LoginService } from '../login/login.service';

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

}

describe('TokenListComponent with permissions', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let permissionLoadSubject: Subject<boolean>;
  let page: Page;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        TokenListComponent,
        MockPipe({ 'name': 'unreadyTokens' }),
        MockPipe({ 'name': 'inactiveTokens' }),
        MockPipe({ 'name': 'activeTokens' }),
        MockPipe({ 'name': 'arrayNotEmpty' }),
        MockPipe({ 'name': 'sortTokensByState' }),
        MockComponent({ 'selector': 'app-token-card', inputs: ['token'], outputs: ['tokenUpdate'] }),
        MockComponent({ 'selector': 'app-enrollment-grid' }),
        ArrayNotEmptyPipe,
        ActiveTokensPipe,
        InactiveTokensPipe,
        UnreadyTokensPipe,
        CapitalizePipe,
        NgxPermissionsAllowStubDirective,
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
      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([])
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    tokenService = getInjectedStub(TokenService);
    loginService = getInjectedStub(LoginService);

    permissionLoadSubject = new BehaviorSubject(true);
    (loginService as any).permissionLoad$ = permissionLoadSubject.asObservable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render expected title and text for first token enrollment section', () => {
    tokenService.getTokens.and.returnValue(of([]));

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

    tokenService.getTokens.and.returnValue(of([hotpToken]));

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
    tokenService.getTokens.and.returnValue(of([hotpToken]));

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
    tokenService.getTokens.and.returnValue(of([]));
    fixture.detectChanges();
    expect(tokenService.getTokens).toHaveBeenCalled();
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

});

describe('TokenListComponent without tokens and permissions', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let permissionLoadSubject: Subject<boolean>;
  let page: Page;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        TokenListComponent,
        MockPipe({ 'name': 'unreadyTokens' }),
        MockPipe({ 'name': 'inactiveTokens' }),
        MockPipe({ 'name': 'activeTokens' }),
        MockPipe({ 'name': 'arrayNotEmpty' }),
        MockPipe({ 'name': 'sortTokensByState' }),
        MockComponent({ 'selector': 'app-token-card', inputs: ['token'], outputs: ['tokenUpdate'] }),
        MockComponent({ 'selector': 'app-enrollment-grid' }),
        ArrayNotEmptyPipe,
        ActiveTokensPipe,
        InactiveTokensPipe,
        UnreadyTokensPipe,
        NgxPermissionsRestrictStubDirective,
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
      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([])
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    tokenService = getInjectedStub(TokenService);
    loginService = getInjectedStub(LoginService);

    permissionLoadSubject = new BehaviorSubject(false);
    (loginService as any).permissionLoad$ = permissionLoadSubject.asObservable();

    tokenService.getTokens.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no title nor text, save for the loading spinning indicator', () => {
    tokenService.getTokens.and.returnValue(of([]));

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

});
