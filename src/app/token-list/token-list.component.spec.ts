import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Fixtures } from '../../testing/fixtures';
import { MockPipe } from '../../testing/mock-pipe';
import { MockComponent } from '../../testing/mock-component';

import { of } from 'rxjs';

import { TokenListComponent } from './token-list.component';
import { MaterialModule } from '../material.module';
import { TokenService } from '../token.service';

describe('TokenListComponent', () => {
  let component: TokenListComponent;
  let fixture: ComponentFixture<TokenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TokenListComponent,
        MockPipe({ 'name': 'nonActiveTokens' }),
        MockPipe({ 'name': 'activeTokens' }),
        MockPipe({ 'name': 'arrayNotEmpty' }),
        MockPipe({ 'name': 'sortTokensByState' }),
        MockComponent({ 'selector': 'app-token-card', inputs: ['token'], outputs: ['tokenUpdate'] }),
        MockComponent({ 'selector': 'app-enrollment-grid' }),
      ],
      providers: [
        {
          provide: TokenService,
          useValue: {
            getTokens: jasmine.createSpy('getTokens')
          }
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

    const tokenService: jasmine.SpyObj<TokenService> = TestBed.get(TokenService);
    tokenService.getTokens.and.returnValue(of(Fixtures.tokens));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tokens from the server on init', () => {
    const tokenService: TokenService = TestBed.get(TokenService);
    expect(tokenService.getTokens).toHaveBeenCalled();
  });
});
