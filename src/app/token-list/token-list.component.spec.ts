import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { Fixtures } from '../../testing/fixtures';
import { MockPipe } from '../../testing/mock-pipe';
import { MockComponent } from '../../testing/mock-component';

import { TokenListComponent } from './token-list.component';
import { MaterialModule } from '../material.module';
import { TokenService } from '../token.service';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { EnrollmentStatus } from '../token';
import { EnrollmentPermissions } from '../permissions';
import { TestingPage } from '../../testing/page-helper';
import { spyOnClass } from '../../testing/spyOnClass';
import { ArrayNotEmptyPipe } from '../array-not-empty.pipe';
import { ActiveTokensPipe } from '../active-tokens.pipe';
import { NonActiveTokensPipe } from '../non-active-tokens.pipe';

class Page extends TestingPage<TokenListComponent> {

  public getNewAuthSectionElement(elementTag: string) {
    return this.query('#newAuthSection ' + elementTag);
  }

  public getEnrollSectionElement(elementTag: string) {
    return this.query('#enrollSection ' + elementTag);
  }

  public getActiveAuthSectionElement(elementTag: string) {
    return this.query('#activeAuthSection ' + elementTag);
  }

  public getPendingSectionElement(elementTag: string) {
    return this.query('#pendingSection ' + elementTag);
  }

}

describe('TokenListComponent', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let page: Page;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TokenListComponent,
        MockPipe({ 'name': 'sortTokensByState' }),
        MockComponent({ 'selector': 'app-token-card', inputs: ['token'], outputs: ['tokenUpdate'] }),
        MockComponent({ 'selector': 'app-enrollment-grid' }),
        ArrayNotEmptyPipe,
        ActiveTokensPipe,
        NonActiveTokensPipe,
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

  it('should render expected title and text for empty enrollment section', () => {
    tokenService.getTokens.and.returnValue(of([]));

    fixture.detectChanges();
    expect(page.getEnrollSectionElement('h2').textContent).toEqual('Enroll your first authentication method');
    expect(page.getEnrollSectionElement('p').textContent).toEqual(' You currently do not have any authentication' +
      ' method enrolled. Start by selecting your prefered type: ');

    expect(page.getActiveAuthSectionElement('h2')).toBeNull();
    expect(page.getActiveAuthSectionElement('p')).toBeNull();
    expect(page.getNewAuthSectionElement('h2')).toBeNull();
    expect(page.getNewAuthSectionElement('p')).toBeNull();
    expect(page.getPendingSectionElement('h2')).toBeNull();
    expect(page.getPendingSectionElement('p')).toBeNull();
  });

  it('should render expected title and text for active authentication and new auth. method section', () => {
    const hotpToken = Fixtures.activeHotpToken;
    hotpToken.enrollmentStatus = EnrollmentStatus.completed;

    tokenService.getTokens.and.returnValue(of([hotpToken]));

    fixture.detectChanges();
    expect(page.getActiveAuthSectionElement('h2').textContent).toEqual('Active authentication methods');
    expect(page.getActiveAuthSectionElement('p').textContent).toEqual('The following tokens are ready to be used:');

    expect(page.getNewAuthSectionElement('h2').textContent).toEqual('Set up new authentication method');
    expect(page.getNewAuthSectionElement('p').textContent).toEqual('Following alternative authentication methods' +
      ' are available and can be set up:');

    expect(page.getEnrollSectionElement('h2')).toBeNull();
    expect(page.getEnrollSectionElement('p')).toBeNull();
    expect(page.getPendingSectionElement('h2')).toBeNull();
    expect(page.getPendingSectionElement('p')).toBeNull();
  });

  it('should render expected title and text for the pending and new auth. method section', () => {
    const hotpToken = Fixtures.activeHotpToken;
    hotpToken.enrollmentStatus = EnrollmentStatus.unpaired;
    tokenService.getTokens.and.returnValue(of([hotpToken]));

    fixture.detectChanges();

    expect(page.getPendingSectionElement('h2').textContent).toEqual('Pending actions');
    expect(page.getPendingSectionElement('p').textContent).toEqual('The following tokens are not active' +
      ' yet and need to be paired:');

    expect(page.getNewAuthSectionElement('h2').textContent).toEqual('Set up new authentication method');
    expect(page.getNewAuthSectionElement('p').textContent).toEqual('Following alternative authentication methods' +
      ' are available and can be set up:');

    expect(page.getActiveAuthSectionElement('h2')).toBeNull();
    expect(page.getActiveAuthSectionElement('p')).toBeNull();
    expect(page.getEnrollSectionElement('h2')).toBeNull();
    expect(page.getEnrollSectionElement('p')).toBeNull();
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

