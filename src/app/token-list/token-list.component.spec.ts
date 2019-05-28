import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { Fixtures } from '../../testing/fixtures';
import { MockPipe } from '../../testing/mock-pipe';
import { MockComponent } from '../../testing/mock-component';

import { TokenListComponent } from './token-list.component';
import { MaterialModule } from '../material.module';
import { TokenService } from '../api/token.service';
import { NgxPermissionsAllowStubDirective, NgxPermissionsService, NgxPermissionsRestrictStubDirective } from 'ngx-permissions';
import { EnrollmentStatus } from '../api/token';
import { EnrollmentPermissions } from '../common/permissions';
import { TestingPage } from '../../testing/page-helper';
import { spyOnClass } from '../../testing/spyOnClass';
import { ArrayNotEmptyPipe } from '../common/pipes/array-not-empty.pipe';
import { ActiveTokensPipe } from '../common/pipes/active-tokens.pipe';
import { InactiveTokensPipe } from '../common/pipes/inactive-tokens.pipe';
import { UnreadyTokensPipe } from '../common/pipes/unready-tokens.pipe';
import { CapitalizePipe } from '../common/pipes/capitalize.pipe';

class Page extends TestingPage<TokenListComponent> {

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
  let page: Page;

  beforeEach(async(() => {
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
      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([])
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    tokenService = TestBed.get(TokenService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render expected title and text for first token enrollment section', () => {
    tokenService.getTokens.and.returnValue(of([]));

    fixture.detectChanges();
    expect(page.getEnrollFirstTokenSectionElement('h2').textContent).toEqual('Enroll your first authentication method');
    expect(page.getEnrollFirstTokenSectionElement('p').textContent).toEqual(' You currently do not have any authentication' +
      ' method enrolled. Start by selecting your preferred type: ');

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
    expect(page.getActiveAuthSectionElement('p').textContent).toEqual('The following tokens are ready to be used:');

    expect(page.getEnrollAlternativeTokenSectionElement('h2').textContent).toEqual('Set up new authentication method');
    expect(page.getEnrollAlternativeTokenSectionElement('p').textContent).toEqual('Following alternative authentication methods' +
      ' are available and can be set up:');

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

    expect(page.getEnrollAlternativeTokenSectionElement('h2').textContent).toEqual('Set up new authentication method');
    expect(page.getEnrollAlternativeTokenSectionElement('p').textContent).toEqual('Following alternative authentication methods' +
      ' are available and can be set up:');

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
    expect(component.EnrollmentPermissions).toBe(EnrollmentPermissions);
  });

  it('should load enrollment status', () => {
    expect(component.EnrollmentStatus).toBe(EnrollmentStatus);
  });

});

describe('TokenListComponent without permissions', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let page: Page;

  beforeEach(async(() => {
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
      ],
      imports: [
        MaterialModule,
        RouterTestingModule.withRoutes([])
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    tokenService = TestBed.get(TokenService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render expected title and text for user without tokens and enrollment permissions', () => {
    tokenService.getTokens.and.returnValue(of([]));

    fixture.detectChanges();
    expect(page.getEmptyStateSectionElement('h2').textContent).toEqual('No actions available');
    expect(page.getEmptyStateSectionElement('p').textContent).toEqual(
      'You currently do not own any tokens, nor can you enroll a token yourself. Please contact your administrator.'
    );

    expect(page.getEnrollFirstTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollFirstTokenSectionElement('p')).toBeNull();
    expect(page.getActiveAuthSectionElement('h2')).toBeNull();
    expect(page.getActiveAuthSectionElement('p')).toBeNull();
    expect(page.getEnrollAlternativeTokenSectionElement('h2')).toBeNull();
    expect(page.getEnrollAlternativeTokenSectionElement('p')).toBeNull();
    expect(page.getPendingSectionElement('h2')).toBeNull();
    expect(page.getPendingSectionElement('p')).toBeNull();
  });

});
